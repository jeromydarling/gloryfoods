/// <reference types="@cloudflare/workers-types" />
/**
 * Worker entrypoint for Vibes Cuisine and Bakery.
 *
 * Cloudflare serves a matching static asset (the built Astro site) before this
 * Worker runs, so the Worker primarily handles the JSON API under /api/* and
 * delegates everything else to the ASSETS binding (which also renders the
 * prebuilt 404 page for unknown paths).
 *
 * The route handlers are the same modules used when this was a Pages project
 * (functions/api/*); they only read `request` and `env`, so we invoke them with
 * a minimal context.
 */
import type { Env } from "../functions/_lib/types";
import { onRequestPost as checkout } from "../functions/api/checkout";
import { onRequestPost as webhook } from "../functions/api/webhook";
import { onRequestGet as order } from "../functions/api/order";
import { onRequestPost as newsletter } from "../functions/api/newsletter";
import { onRequestPost as contact } from "../functions/api/contact";

type Handler = (ctx: { request: Request; env: Env }) => Response | Promise<Response>;

const ROUTES: Record<string, Handler> = {
  "POST /api/checkout": checkout as unknown as Handler,
  "POST /api/webhook": webhook as unknown as Handler,
  "GET /api/order": order as unknown as Handler,
  "POST /api/newsletter": newsletter as unknown as Handler,
  "POST /api/contact": contact as unknown as Handler,
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname.startsWith("/api/")) {
      const handler = ROUTES[`${request.method} ${url.pathname}`];
      if (handler) return handler({ request, env });
      // Path exists under a different method → 405; otherwise 404.
      const known = Object.keys(ROUTES).some(
        (k) => k.slice(k.indexOf(" ") + 1) === url.pathname
      );
      return new Response("Method Not Allowed", { status: known ? 405 : 404 });
    }

    // Static site + 404 handling is served by the assets binding.
    return env.ASSETS.fetch(request);
  },
};
