-- Glory Foods (codename) — Vibes Cuisine and Bakery
-- D1 schema. Safe to re-run: every object uses IF NOT EXISTS.
--
-- Design notes:
--  * `products` is the AUTHORITATIVE source of price. The checkout API looks up
--    amounts here by slug and never trusts client-supplied prices.
--  * Money is stored as integer cents to avoid float drift.
--  * Webhook idempotency is enforced by `webhook_events` (Stripe may retry).
--  * Timestamps are ISO-8601 strings in UTC (D1/SQLite friendly, sortable).

PRAGMA foreign_keys = ON;

-- ---------------------------------------------------------------------------
-- Catalog
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS products (
  slug            TEXT PRIMARY KEY,
  name            TEXT NOT NULL,
  tagline         TEXT,
  description     TEXT,
  category        TEXT NOT NULL,              -- breads | sweets | pantry | subscription
  price_cents     INTEGER NOT NULL CHECK (price_cents >= 0),
  currency        TEXT NOT NULL DEFAULT 'usd',
  unit_label      TEXT,                       -- "loaf", "5-pack", "12 oz bag"
  image           TEXT,                       -- /images/menu/<slug>.webp
  is_subscription INTEGER NOT NULL DEFAULT 0, -- 0 one-time, 1 recurring
  bill_interval   TEXT,                       -- week | month  (subscriptions only)
  interval_count  INTEGER NOT NULL DEFAULT 1,
  active          INTEGER NOT NULL DEFAULT 1,
  sort            INTEGER NOT NULL DEFAULT 100,
  created_at      TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category, sort);

-- ---------------------------------------------------------------------------
-- People
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS customers (
  id                 TEXT PRIMARY KEY,        -- uuid
  email              TEXT NOT NULL UNIQUE,
  name               TEXT,
  phone              TEXT,
  stripe_customer_id TEXT,
  created_at         TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE INDEX IF NOT EXISTS idx_customers_stripe ON customers(stripe_customer_id);

-- ---------------------------------------------------------------------------
-- One-time orders
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS orders (
  id                 TEXT PRIMARY KEY,        -- uuid, surfaced to the guest
  customer_email     TEXT NOT NULL,
  customer_name      TEXT,
  phone              TEXT,
  fulfillment_type   TEXT NOT NULL DEFAULT 'pickup',  -- pickup | delivery
  pickup_date        TEXT,                    -- requested date (ISO)
  address_line1      TEXT,
  address_line2      TEXT,
  city               TEXT,
  region             TEXT,
  postal_code        TEXT,
  notes              TEXT,
  status             TEXT NOT NULL DEFAULT 'pending', -- pending | paid | fulfilled | cancelled | refunded
  subtotal_cents     INTEGER NOT NULL DEFAULT 0,
  total_cents        INTEGER NOT NULL DEFAULT 0,
  currency           TEXT NOT NULL DEFAULT 'usd',
  stripe_session_id  TEXT UNIQUE,
  stripe_payment_intent TEXT,
  created_at         TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at         TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE INDEX IF NOT EXISTS idx_orders_email  ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status, created_at);

CREATE TABLE IF NOT EXISTS order_items (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id         TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_slug     TEXT NOT NULL,
  name             TEXT NOT NULL,             -- snapshot at purchase time
  unit_price_cents INTEGER NOT NULL,          -- snapshot
  quantity         INTEGER NOT NULL CHECK (quantity > 0)
);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);

-- ---------------------------------------------------------------------------
-- Recurring subscriptions ("The Weekly Table", "Gursha Box", ...)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS subscriptions (
  id                   TEXT PRIMARY KEY,      -- uuid
  customer_email       TEXT NOT NULL,
  plan_slug            TEXT NOT NULL,
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id   TEXT,
  status               TEXT NOT NULL DEFAULT 'pending', -- pending|active|past_due|canceled
  current_period_end   TEXT,
  created_at           TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at           TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE INDEX IF NOT EXISTS idx_subs_email ON subscriptions(customer_email);

-- ---------------------------------------------------------------------------
-- Lightweight engagement tables
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  email      TEXT PRIMARY KEY,
  source     TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE TABLE IF NOT EXISTS contact_messages (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT NOT NULL,
  email      TEXT NOT NULL,
  message    TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

-- ---------------------------------------------------------------------------
-- Stripe webhook idempotency — store each processed event id once.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS webhook_events (
  id           TEXT PRIMARY KEY,             -- Stripe event id (evt_...)
  type         TEXT,
  processed_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
