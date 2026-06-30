/// <reference types="@cloudflare/workers-types" />

/**
 * Bindings available on `context.env` inside every Pages Function.
 * Configured in wrangler.toml (DB, KV, public vars) and via
 * `wrangler pages secret put` (Stripe keys).
 */
export interface Env {
  DB: D1Database;
  KV: KVNamespace;
  /** Static assets binding (Workers static assets). */
  ASSETS: Fetcher;
  STRIPE_SECRET_KEY?: string;
  STRIPE_WEBHOOK_SECRET?: string;
  SITE_URL?: string;
  ORDER_CURRENCY?: string;
  BRAND_NAME?: string;
}

export interface ProductRow {
  slug: string;
  name: string;
  description: string | null;
  category: string;
  price_cents: number;
  currency: string;
  unit_label: string | null;
  is_subscription: number;
  bill_interval: string | null;
  interval_count: number;
  active: number;
}

export interface CartLineInput {
  slug: string;
  quantity: number;
}
