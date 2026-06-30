# Glory Foods · Vibes Cuisine and Bakery

> **Codename:** Glory Foods. **Working brand:** Vibes Cuisine and Bakery — Eritrean/Ethiopian baking from St. Paul, MN.
> Rename everywhere by editing one file: [`src/data/site.ts`](src/data/site.ts).

A production-ready storefront MVP for a neighborhood Eritrean/Ethiopian bakery: a beautiful,
accessible, animated marketing site with online ordering (one-time **and**
subscription "bread boxes"), built to run entirely on Cloudflare's edge and scale
from one loaf to millions of orders.

---

## 1. System architecture

```
                 ┌──────────────────────────────────────────────┐
   Visitor ──▶   │  Cloudflare Worker  (gloryfoods, global edge)  │
                 │   • Static assets — built Astro site           │
                 │   • Worker API  →  /api/*  (worker/index.ts)   │
                 └───────────────┬──────────────────────────────┘
                                 │
            ┌────────────────────┼─────────────────────┬──────────────────┐
            ▼                    ▼                     ▼                  ▼
      ┌───────────┐       ┌────────────┐        ┌────────────┐    ┌──────────────┐
      │   D1 (SQL)│       │   KV store │        │   Stripe   │    │  Workers AI  │
      │  orders,  │       │ idempotency│        │  Checkout  │    │  Flux images │
      │ customers,│       │ rate-limit │        │  + Billing │    │ (build-time) │
      │ catalog   │       └────────────┘        └─────┬──────┘    └──────────────┘
      └───────────┘                                   │ webhook
            ▲                                          ▼
            └──────────── /functions/api/webhook ◀─────┘
```

- **Frontend** — [Astro](https://astro.build) static output. Marketing + catalog
  pages are prerendered to HTML and served from the CDN; client interactivity
  (basket, scroll-reveal motion, forms) ships as a single small bundle.
- **API** — a single Cloudflare **Worker** ([`worker/index.ts`](worker/index.ts))
  routes `/api/*` to the handlers in [`functions/api/`](functions/api) and serves
  the static site for everything else. Talks to Stripe over REST (no SDK to
  bundle) and persists to D1.
- **Database** — Cloudflare **D1** (SQLite at the edge). The `products` table is the
  authoritative source of price; the checkout API never trusts client-supplied amounts.
- **KV** — webhook idempotency, fixed-window rate limiting, newsletter de-duplication.
- **Payments** — Stripe **Checkout** (hosted) for one-time orders and **Billing** for
  subscriptions, reconciled into D1 via a signature-verified webhook.
- **Imagery** — ships with on-brand SVG artwork; an optional script renders real
  photography with Cloudflare Workers AI (Flux). See [§7](#7-imagery).

**Why this scales:** static assets are cached globally; Functions are stateless and
horizontally scaled by Cloudflare; D1 and KV are managed and replicated. There is no
server to provision or keep warm.

---

## 2. File structure

```
.
├── astro.config.mjs          # static output + sitemap
├── wrangler.toml             # Worker config; assets, D1 + KV bindings, vars
├── worker/index.ts           # Worker entry: routes /api/* + serves assets
├── db/
│   ├── schema.sql            # D1 schema (idempotent)
│   └── seed.sql              # catalog seed (authoritative pricing)
├── functions/                # API handlers (imported by worker/index.ts)
│   ├── _lib/                 # shared, non-routed helpers
│   │   ├── types.ts          # Env bindings + row types
│   │   ├── http.ts           # json(), rate limiting, validation, uuid
│   │   ├── stripe.ts         # fetch-based Stripe client + webhook verify
│   │   └── db.ts             # priceCart(), saveOrder(), idempotency
│   └── api/
│       ├── checkout.ts       # POST → Stripe Checkout session
│       ├── webhook.ts        # POST ← Stripe events → D1
│       ├── order.ts          # GET  → confirmation summary
│       ├── newsletter.ts     # POST → newsletter signup
│       └── contact.ts        # POST → contact message
├── public/
│   ├── _headers              # security headers + cache policy
│   ├── images/               # generated SVG art (+ Flux photos later)
│   ├── favicon.svg, site.webmanifest, robots.txt
├── scripts/
│   ├── gen-art.mjs           # generates the on-brand SVG artwork
│   ├── generate-flux-images.mjs  # optional Workers AI (Flux) photography
│   └── image-prompts.json    # prompts for the above
└── src/
    ├── data/                 # single sources of truth
    │   ├── site.ts           # brand, contact, hours (rename here)
    │   ├── menu.ts           # display catalog + price formatting
    │   └── values.ts         # the bakehouse's promises + story copy
    ├── layouts/Base.astro    # html shell, SEO, header/footer, cart drawer
    ├── components/           # Header, Footer, ProductCard, SubscriptionCard…
    ├── pages/                # index, menu, subscriptions, our-story, visit, success, 404
    ├── scripts/              # cart.ts, motion.ts, forms.ts, main.ts (client)
    └── styles/global.css     # bespoke design system (tokens, motion, a11y)
```

---

## 3. Database schema (D1)

Full DDL in [`db/schema.sql`](db/schema.sql). Tables:

| Table                    | Purpose |
|--------------------------|---------|
| `products`               | Catalog + **authoritative price** (cents). One-time and subscription items. |
| `customers`              | De-duplicated by email; linked to Stripe customer id. |
| `orders` / `order_items` | One-time orders with per-line price snapshots. |
| `subscriptions`          | Recurring "bread box" state, synced from Stripe. |
| `newsletter_subscribers` | "Standing invitation" list. |
| `contact_messages`       | Inbound inquiries (catering, big orders). |
| `webhook_events`         | Stripe event ids — guarantees each event is processed once. |

Money is stored as integer cents; timestamps are ISO-8601 UTC strings.

---

## 4. API endpoints

| Method & path        | Body / query                              | Purpose |
|----------------------|-------------------------------------------|---------|
| `POST /api/checkout` | `{ items:[{slug,quantity}], mode }`       | Re-prices cart from D1, creates a Stripe Checkout session, returns `{ url }`. |
| `POST /api/webhook`  | Stripe event (raw)                        | Verifies signature, writes paid orders / subscription state to D1. |
| `GET  /api/order`    | `?session_id=cs_…`                        | Non-sensitive confirmation summary for the success page. |
| `POST /api/newsletter`| `{ email, source? }`                     | Adds to the newsletter list (deduped). |
| `POST /api/contact`  | `{ name, email, message }`                | Stores a contact message. |

Security throughout: server-side re-pricing, KV rate limiting, input validation,
HMAC-SHA256 webhook verification with replay protection, and idempotent writes.

---

## 5. UI architecture

- **Design system** in [`src/styles/global.css`](src/styles/global.css): CSS custom
  properties for a warm Eritrean/Ethiopian palette (teff cream, honey gold, berbere red,
  highland green, coffee), a fluid type scale, and reusable primitives (`.btn`,
  `.card`, `.container`, `.section`).
- **Components** are Astro `.astro` files with scoped styles — zero client framework.
- **Client JS** (`src/scripts/`) is a single ~7 kB module: a localStorage **basket**
  with a slide-out drawer, **scroll-reveal** motion via `IntersectionObserver`, and
  progressively-enhanced forms.
- **Accessibility:** semantic landmarks, a skip link, visible focus rings, labelled
  controls, `aria-live` status regions, and **full `prefers-reduced-motion` support**.
  All scroll-reveal content is visible without JS (progressive enhancement).
- **Voice:** warm and hospitable — human dignity, welcome of the newcomer, the common
  good, fair pay for bakers, and feeding neighbors. (No religious language.)

---

## 6. Local development

```bash
npm install
npm run dev            # Astro dev server (UI only) → http://localhost:4321

# Full stack (Functions + D1 + KV) with Wrangler:
cp .dev.vars.example .dev.vars   # add Stripe TEST keys
npm run db:local                 # apply schema + seed to a local D1
npm run build && npm run preview # → http://localhost:8788
```

---

## 7. Imagery

The site ships with tasteful, generated SVG artwork (`node scripts/gen-art.mjs`) so it
looks complete immediately. To replace it with real photography via **Cloudflare
Workers AI (Flux)**:

```bash
export CLOUDFLARE_ACCOUNT_ID=...      # dashboard → account id
export CLOUDFLARE_API_TOKEN=...       # token with "Workers AI" permission
node scripts/generate-flux-images.mjs --apply   # render + switch refs to .jpg
npm run build
```

Prompts live in [`scripts/image-prompts.json`](scripts/image-prompts.json).

---

## 8. Deployment (Cloudflare Workers)

Deployed as a **Worker with static assets** named `gloryfoods`
(`https://gloryfoods.jer-f84.workers.dev`). Cloudflare's Git integration builds
and deploys on every push to `main` (it runs the `[build]` command in
`wrangler.toml`, then `wrangler deploy`). The `worker/index.ts` entry serves the
`/api/*` routes and falls back to the built Astro site.

Provisioned resources (already created in this account):

- **D1** `glory-foods-db` — `d371beb3-0460-4d51-a5fa-462ae8637066`
- **KV** `glory-foods-kv` — `7b635d3f26c84435a88b86758df00817`

Manual deploy (requires `wrangler login` or a `CLOUDFLARE_API_TOKEN` with
**Workers Scripts: Edit**):

```bash
npm run deploy            # wrangler deploy (runs the build first)
npm run db:migrate && npm run db:seed   # sync schema + catalog to remote D1
```

Then set the Stripe secrets (kept out of git on purpose) and the webhook:

```bash
wrangler secret put STRIPE_SECRET_KEY
wrangler secret put STRIPE_WEBHOOK_SECRET
# Stripe dashboard → Webhooks → add endpoint:
#   https://gloryfoods.jer-f84.workers.dev/api/webhook
#   events: checkout.session.completed,
#           customer.subscription.updated, customer.subscription.deleted
```

See [`DEPLOY.md`](DEPLOY.md) for the full runbook.
