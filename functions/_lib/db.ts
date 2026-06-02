/** D1 data-access helpers. */
import type { CartLineInput, Env, ProductRow } from "./types";

export interface PricedLine {
  product: ProductRow;
  quantity: number;
}

/**
 * Re-price a client cart against D1 — the single source of pricing truth.
 * Unknown/inactive slugs and bad quantities are dropped, so a tampered cart
 * can never set its own price.
 */
export async function priceCart(
  db: D1Database,
  lines: CartLineInput[]
): Promise<PricedLine[]> {
  const wanted = new Map<string, number>();
  for (const line of lines) {
    if (!line || typeof line.slug !== "string") continue;
    const qty = Math.floor(Number(line.quantity));
    if (!Number.isInteger(qty) || qty < 1 || qty > 24) continue;
    wanted.set(line.slug, qty);
  }
  if (wanted.size === 0) return [];

  const slugs = [...wanted.keys()];
  const placeholders = slugs.map(() => "?").join(",");
  const { results } = await db
    .prepare(
      `SELECT slug, name, description, category, price_cents, currency, unit_label,
              is_subscription, bill_interval, interval_count, active
         FROM products
        WHERE active = 1 AND slug IN (${placeholders})`
    )
    .bind(...slugs)
    .all<ProductRow>();

  return (results ?? []).map((product) => ({
    product,
    quantity: wanted.get(product.slug)!,
  }));
}

export interface OrderRecord {
  id: string;
  email: string;
  name?: string | null;
  phone?: string | null;
  fulfillment: string;
  totalCents: number;
  subtotalCents: number;
  currency: string;
  sessionId: string;
  paymentIntent?: string | null;
  items: { slug: string; name: string; unitPriceCents: number; quantity: number }[];
}

/** Persist a paid order + its line items. Idempotent on stripe_session_id. */
export async function saveOrder(env: Env, order: OrderRecord): Promise<void> {
  const now = new Date().toISOString();
  await env.DB.prepare(
    `INSERT INTO orders
       (id, customer_email, customer_name, phone, fulfillment_type, status,
        subtotal_cents, total_cents, currency, stripe_session_id, stripe_payment_intent,
        created_at, updated_at)
     VALUES (?,?,?,?,?, 'paid', ?,?,?,?,?,?,?)
     ON CONFLICT(stripe_session_id) DO UPDATE SET status='paid', updated_at=excluded.updated_at`
  )
    .bind(
      order.id,
      order.email,
      order.name ?? null,
      order.phone ?? null,
      order.fulfillment,
      order.subtotalCents,
      order.totalCents,
      order.currency,
      order.sessionId,
      order.paymentIntent ?? null,
      now,
      now
    )
    .run();

  if (order.items.length > 0) {
    const stmt = env.DB.prepare(
      `INSERT INTO order_items (order_id, product_slug, name, unit_price_cents, quantity)
       VALUES (?,?,?,?,?)`
    );
    await env.DB.batch(
      order.items.map((it) =>
        stmt.bind(order.id, it.slug, it.name, it.unitPriceCents, it.quantity)
      )
    );
  }
}

export async function upsertCustomer(
  env: Env,
  email: string,
  name?: string | null,
  stripeCustomerId?: string | null
): Promise<void> {
  await env.DB.prepare(
    `INSERT INTO customers (id, email, name, stripe_customer_id)
     VALUES (?,?,?,?)
     ON CONFLICT(email) DO UPDATE SET
       name = COALESCE(excluded.name, customers.name),
       stripe_customer_id = COALESCE(excluded.stripe_customer_id, customers.stripe_customer_id)`
  )
    .bind(crypto.randomUUID(), email, name ?? null, stripeCustomerId ?? null)
    .run();
}

/** Record a Stripe event id once; returns false if already processed. */
export async function markEventProcessed(
  env: Env,
  eventId: string,
  type: string
): Promise<boolean> {
  try {
    await env.DB.prepare(
      `INSERT INTO webhook_events (id, type) VALUES (?, ?)`
    )
      .bind(eventId, type)
      .run();
    return true;
  } catch {
    return false; // primary-key conflict → already handled
  }
}
