/**
 * POST /api/webhook  — Stripe webhook receiver.
 *
 * Verifies the signature, dedupes by event id, and writes paid orders and
 * subscription state into D1. Always returns 200 quickly for handled events so
 * Stripe stops retrying; returns 400 only when the signature is invalid.
 *
 * Configure in Stripe → Developers → Webhooks with events:
 *   checkout.session.completed, customer.subscription.updated,
 *   customer.subscription.deleted
 */
import type { Env } from "../_lib/types";
import { verifyStripeSignature } from "../_lib/stripe";
import {
  markEventProcessed,
  saveOrder,
  upsertCustomer,
  type OrderRecord,
} from "../_lib/db";
import { uuid } from "../_lib/http";

interface CartMetaEntry {
  s: string;
  q: number;
  p: number;
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (!env.STRIPE_WEBHOOK_SECRET) {
    return new Response("Webhook not configured", { status: 500 });
  }

  const payload = await request.text();
  const event = await verifyStripeSignature(
    payload,
    request.headers.get("stripe-signature"),
    env.STRIPE_WEBHOOK_SECRET
  );
  if (!event) return new Response("Invalid signature", { status: 400 });

  // Idempotency: only process each event id once.
  const fresh = await markEventProcessed(env, event.id, event.type);
  if (!fresh) return new Response("Already processed", { status: 200 });

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const email: string =
          session.customer_details?.email ?? session.customer_email ?? "unknown@unknown";
        const name: string | undefined = session.customer_details?.name ?? undefined;
        const phone: string | undefined = session.customer_details?.phone ?? undefined;

        await upsertCustomer(env, email, name, session.customer ?? null);

        if (session.mode === "subscription") {
          const cart = parseCart(session.metadata?.cart);
          await env.DB.prepare(
            `INSERT INTO subscriptions
               (id, customer_email, plan_slug, stripe_subscription_id, stripe_customer_id, status)
             VALUES (?,?,?,?,?, 'active')
             ON CONFLICT(stripe_subscription_id) DO UPDATE SET status='active', updated_at=excluded.updated_at`
          )
            .bind(
              uuid(),
              email,
              cart[0]?.s ?? "unknown",
              session.subscription ?? null,
              session.customer ?? null
            )
            .run();
        } else {
          const cart = parseCart(session.metadata?.cart);
          const names = await productNames(env, cart.map((c) => c.s));
          const items = cart.map((c) => ({
            slug: c.s,
            name: names.get(c.s) ?? c.s,
            unitPriceCents: c.p,
            quantity: c.q,
          }));
          const order: OrderRecord = {
            id: uuid(),
            email,
            name,
            phone,
            fulfillment: session.shipping_details ? "delivery" : "pickup",
            subtotalCents: session.amount_subtotal ?? session.amount_total ?? 0,
            totalCents: session.amount_total ?? 0,
            currency: session.currency ?? "usd",
            sessionId: session.id,
            paymentIntent: session.payment_intent ?? null,
            items,
          };
          await saveOrder(env, order);
        }
        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object;
        const status = event.type.endsWith("deleted") ? "canceled" : sub.status;
        const periodEnd = sub.current_period_end
          ? new Date(sub.current_period_end * 1000).toISOString()
          : null;
        await env.DB.prepare(
          `UPDATE subscriptions
              SET status = ?, current_period_end = ?, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now')
            WHERE stripe_subscription_id = ?`
        )
          .bind(status, periodEnd, sub.id)
          .run();
        break;
      }

      default:
        // Unhandled event types are acknowledged so Stripe stops retrying.
        break;
    }
  } catch (err) {
    // Log to the Workers console; return 500 so Stripe retries transient errors.
    console.error("webhook handler error", event.type, err);
    return new Response("handler error", { status: 500 });
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
};

async function productNames(env: Env, slugs: string[]): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  if (slugs.length === 0) return map;
  const placeholders = slugs.map(() => "?").join(",");
  const { results } = await env.DB.prepare(
    `SELECT slug, name FROM products WHERE slug IN (${placeholders})`
  )
    .bind(...slugs)
    .all<{ slug: string; name: string }>();
  for (const row of results ?? []) map.set(row.slug, row.name);
  return map;
}

function parseCart(raw: unknown): CartMetaEntry[] {
  if (typeof raw !== "string") return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
