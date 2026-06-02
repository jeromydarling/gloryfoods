/**
 * POST /api/newsletter  — { email, source? }
 * Stores an email for the "standing invitation" list. De-dupes on the PK.
 */
import type { Env } from "../_lib/types";
import { badRequest, clientIp, isEmail, json, rateLimited, readJson } from "../_lib/http";

interface Body {
  email?: string;
  source?: string;
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (await rateLimited(env.KV, `news:${clientIp(request)}`, 6, 60)) {
    return json({ error: "Please wait a moment before trying again." }, 429);
  }
  const body = await readJson<Body>(request);
  if (!body || !isEmail(body.email)) return badRequest("Please enter a valid email.");

  const source = typeof body.source === "string" ? body.source.slice(0, 120) : null;
  await env.DB.prepare(
    `INSERT INTO newsletter_subscribers (email, source)
       VALUES (?, ?)
       ON CONFLICT(email) DO NOTHING`
  )
    .bind(body.email.toLowerCase(), source)
    .run();

  return json({ ok: true });
};
