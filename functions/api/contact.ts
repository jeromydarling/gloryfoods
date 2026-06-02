/**
 * POST /api/contact  — { name, email, message }
 * Persists an inquiry to D1 for the team to follow up on.
 */
import type { Env } from "../_lib/types";
import { badRequest, clientIp, isEmail, json, rateLimited, readJson } from "../_lib/http";

interface Body {
  name?: string;
  email?: string;
  message?: string;
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (await rateLimited(env.KV, `contact:${clientIp(request)}`, 5, 120)) {
    return json({ error: "Please wait a moment before sending again." }, 429);
  }
  const body = await readJson<Body>(request);
  const name = body?.name?.trim() ?? "";
  const message = body?.message?.trim() ?? "";
  if (!name || name.length > 120) return badRequest("Please add your name.");
  if (!isEmail(body?.email)) return badRequest("Please enter a valid email.");
  if (message.length < 4 || message.length > 4000) return badRequest("Please add a short message.");

  await env.DB.prepare(
    `INSERT INTO contact_messages (name, email, message) VALUES (?, ?, ?)`
  )
    .bind(name, body!.email!.toLowerCase(), message)
    .run();

  return json({ ok: true });
};
