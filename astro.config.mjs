// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

// Static output deploys to Cloudflare Pages as plain assets on the global edge.
// The dynamic surface (Stripe, orders, subscriptions) lives in Pages Functions
// under /functions, running on the Workers runtime alongside these assets.
// Update `site` once a real domain is connected.
export default defineConfig({
  site: "https://gloryfoods.jer-f84.workers.dev",
  output: "static",
  trailingSlash: "ignore",
  integrations: [sitemap()],
  build: {
    inlineStylesheets: "auto",
  },
});
