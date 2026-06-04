/**
 * POST /api/checkout
 * Body: { items: [{ slug, quantity }], mode: "payment" | "subscription" }
 *
 * Re-prices the cart against D1, builds Stripe Checkout line items, and returns
 * a hosted Checkout URL. Client prices are never trusted.
 */
import type { Env, CartLineInput } from "../_lib/types";
import { priceCart } from "../_lib/db";
import { Stripe, StripeError } from "../_lib/stripe";
import { badRequest, clientIp, json, rateLimited, readJson, serverError } from "../_lib/http";

interface Body {
  items?: CartLineInput[];
  mode?: "payment" | "subscription";
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (!env.STRIPE_SECRET_KEY) {
    return serverError("Checkout isn't configured yet. Please add the Stripe key.");
  }
  if (await rateLimited(env.KV, `checkout:${clientIp(request)}`, 12, 60)) {
    return json({ error: "Too many attempts. Please wait a moment." }, 429);
  }

  const body = await readJson<Body>(request);
  if (!body || !Array.isArray(body.items) || body.items.length === 0) {
    return badRequest("Your basket is empty.");
  }

  const lines = await priceCart(env.DB, body.items);
  if (lines.length === 0) {
    return badRequest("We couldn't find those items. Please refresh and try again.");
  }

  const hasSub = lines.some((l) => l.product.is_subscription === 1);
  const allSub = lines.every((l) => l.product.is_subscription === 1);
  if (hasSub && !allSub) {
    return badRequest("Bread boxes are checked out on their own — please order them separately.");
  }
  const mode: "payment" | "subscription" = hasSub ? "subscription" : "payment";
  if (mode === "subscription" && lines.length > 1) {
    return badRequest("Please start one bread box at a time.");
  }

  const currency = (env.ORDER_CURRENCY ?? "usd").toLowerCase();
  const siteUrl = (env.SITE_URL ?? new URL(request.url).origin).replace(/\/$/, "");
  const brand = env.BRAND_NAME ?? "Vibes Cuisine and Bakery";

  const lineItems = lines.map(({ product, quantity }) => {
    const price_data: Record<string, unknown> = {
      currency,
      unit_amount: product.price_cents,
      product_data: {
        name: product.name,
        description: product.description ?? undefined,
      },
    };
    if (mode === "subscription") {
      price_data.recurring = {
        interval: product.bill_interval ?? "month",
        interval_count: product.interval_count || 1,
      };
    }
    return { price_data, quantity: mode === "subscription" ? 1 : quantity };
  });

  // Compact cart snapshot for the webhook (Stripe metadata values cap at 500 chars).
  const cartMeta = JSON.stringify(
    lines.map((l) => ({ s: l.product.slug, q: l.quantity, p: l.product.price_cents }))
  ).slice(0, 480);

  const stripe = new Stripe(env.STRIPE_SECRET_KEY);
  try {
    const session = await stripe.createCheckoutSession({
      mode,
      "line_items": lineItems,
      success_url: `${siteUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/menu?checkout=cancelled`,
      submit_type: mode === "payment" ? "pay" : undefined,
      allow_promotion_codes: true,
      billing_address_collection: "auto",
      phone_number_collection: { enabled: true },
      ...(mode === "payment"
        ? { customer_creation: "always", shipping_address_collection: { allowed_countries: ["US"] } }
        : {}),
      custom_text: {
        submit: {
          message:
            mode === "subscription"
              ? "A portion of every box bakes bread for a neighbor. Thank you."
              : "Pickup & local delivery details will follow by email.",
        },
      },
      metadata: { cart: cartMeta, brand, mode },
      ...(mode === "subscription"
        ? { subscription_data: { metadata: { cart: cartMeta } } }
        : { payment_intent_data: { metadata: { cart: cartMeta } } }),
    });

    return json({ url: session.url, id: session.id });
  } catch (err) {
    if (err instanceof StripeError) {
      return json({ error: `Payment setup failed: ${err.message}` }, 502);
    }
    return serverError();
  }
};
