/**
 * GET /api/order?session_id=cs_...
 * Returns a lightweight, non-sensitive summary for the confirmation page.
 * Looks up by Stripe Checkout session id (an unguessable token).
 */
import type { Env } from "../_lib/types";
import { json } from "../_lib/http";

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const sessionId = new URL(request.url).searchParams.get("session_id");
  if (!sessionId || !sessionId.startsWith("cs_")) {
    return json({ error: "Missing session id." }, 400);
  }

  const order = await env.DB.prepare(
    `SELECT id, status, total_cents, currency, fulfillment_type, created_at
       FROM orders WHERE stripe_session_id = ?`
  )
    .bind(sessionId)
    .first<{
      id: string;
      status: string;
      total_cents: number;
      currency: string;
      fulfillment_type: string;
      created_at: string;
    }>();

  if (!order) {
    // The webhook may not have landed yet; tell the client to back off.
    return json({ pending: true }, 202);
  }

  const { results: items } = await env.DB.prepare(
    `SELECT name, unit_price_cents, quantity FROM order_items WHERE order_id = ?`
  )
    .bind(order.id)
    .all();

  return json({ ...order, items: items ?? [] });
};
