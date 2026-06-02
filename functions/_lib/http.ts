/** Small HTTP helpers shared by every function route. */

export function json(data: unknown, status = 200, headers: HeadersInit = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      ...headers,
    },
  });
}

export function badRequest(message: string): Response {
  return json({ error: message }, 400);
}

export function serverError(message = "Something went wrong on our end."): Response {
  return json({ error: message }, 500);
}

/** Parse + lightly validate a JSON body, returning null on failure. */
export async function readJson<T>(request: Request): Promise<T | null> {
  if (!request.headers.get("content-type")?.includes("application/json")) return null;
  try {
    return (await request.json()) as T;
  } catch {
    return null;
  }
}

export function isEmail(value: unknown): value is string {
  return typeof value === "string" && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value) && value.length <= 254;
}

/**
 * Fixed-window rate limiter backed by KV. Returns true if the caller is over
 * the limit. Best-effort: a KV hiccup never blocks a legitimate request.
 */
export async function rateLimited(
  kv: KVNamespace,
  key: string,
  limit: number,
  windowSeconds: number
): Promise<boolean> {
  try {
    const bucket = `rl:${key}:${Math.floor(Date.now() / 1000 / windowSeconds)}`;
    const current = parseInt((await kv.get(bucket)) ?? "0", 10);
    if (current >= limit) return true;
    await kv.put(bucket, String(current + 1), { expirationTtl: windowSeconds + 1 });
    return false;
  } catch {
    return false;
  }
}

export function clientIp(request: Request): string {
  return (
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-forwarded-for") ??
    "anon"
  );
}

/** crypto.randomUUID is available in the Workers runtime. */
export const uuid = (): string => crypto.randomUUID();
