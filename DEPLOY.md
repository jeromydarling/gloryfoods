# Deployment runbook — Glory Foods / Selam Bakehouse

Everything is built and ready. This is the short, ordered checklist to go live on
Cloudflare Pages. The Stripe keys are intentionally **not** in the repo — they are the
last step.

## Already done (in this Cloudflare account, via MCP)

- ✅ **D1** database `glory-foods-db` created and **schema + catalog applied**
  (id `d371beb3-0460-4d51-a5fa-462ae8637066`).
- ✅ **KV** namespace `glory-foods-kv` created
  (id `7b635d3f26c84435a88b86758df00817`).
- ✅ Bindings wired in [`wrangler.toml`](wrangler.toml).
- ✅ Site builds clean (`npm run build`), types pass (`npx astro check`).

## 1. Authenticate Wrangler

```bash
wrangler login                  # interactive, OR:
export CLOUDFLARE_API_TOKEN=...  # token with Pages + D1 + Workers AI scopes
```

## 2. (Re)apply DB to remote D1 — safe to re-run

```bash
npm run db:migrate    # db/schema.sql  (idempotent)
npm run db:seed       # db/seed.sql    (INSERT OR REPLACE by slug)
```

## 3. Deploy the site

```bash
npm run deploy        # astro build && wrangler pages deploy ./dist
```

First deploy creates the Pages project `glory-foods`; it will be live at
`https://glory-foods.pages.dev`. Connect a custom domain later in the dashboard
(Pages → Custom domains) and update `SITE_URL` in `wrangler.toml` + `site` in
`astro.config.mjs`.

## 4. Stripe (the saved-for-last keys)

Use the **correct Stripe account's** keys (test keys first to verify the flow).

```bash
wrangler pages secret put STRIPE_SECRET_KEY        # sk_live_… (or sk_test_…)
wrangler pages secret put STRIPE_WEBHOOK_SECRET    # whsec_… (from step 5)
```

No Stripe products need to be pre-created — checkout builds `price_data` inline from
the authoritative D1 prices, for both one-time orders and subscriptions.

## 5. Stripe webhook

Stripe dashboard → Developers → Webhooks → **Add endpoint**:

- URL: `https://<your-domain>/api/webhook`
- Events: `checkout.session.completed`, `customer.subscription.updated`,
  `customer.subscription.deleted`
- Copy the signing secret (`whsec_…`) into the secret in step 4, then redeploy.

## 6. Optional — real photography (Workers AI / Flux)

```bash
export CLOUDFLARE_ACCOUNT_ID=...  CLOUDFLARE_API_TOKEN=...   # Workers AI scope
node scripts/generate-flux-images.mjs --apply
npm run deploy
```

## Smoke test

1. Add a bread to the basket → **Checkout** → complete with Stripe test card
   `4242 4242 4242 4242` → land on `/success` with an order summary.
2. Start a **bread box** → subscription Checkout → success.
3. Confirm rows land in D1: `wrangler d1 execute glory-foods-db --remote --command "SELECT * FROM orders LIMIT 5;"`
4. Submit the contact + newsletter forms; confirm rows in `contact_messages` /
   `newsletter_subscribers`.

## Rename the brand

Edit [`src/data/site.ts`](src/data/site.ts) (`name`, `legalName`, `tagline`, contact,
hours). The codename "Glory Foods" only appears in infra names and this doc.
