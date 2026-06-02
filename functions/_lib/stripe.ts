/**
 * Minimal Stripe client over fetch — no SDK to bundle, runs natively on the
 * Workers runtime. Encodes params into Stripe's bracketed form syntax and
 * verifies webhook signatures with WebCrypto (constant-time compare).
 */

const STRIPE_API = "https://api.stripe.com/v1";

type FormValue = string | number | boolean | null | undefined;
type FormParams = { [key: string]: FormValue | FormParams | FormParams[] | FormValue[] };

/** Flatten nested objects/arrays into Stripe's `a[b][0][c]=v` form encoding. */
function encodeForm(params: FormParams, prefix = ""): string[] {
  const parts: string[] = [];
  for (const [rawKey, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue;
    const key = prefix ? `${prefix}[${rawKey}]` : rawKey;
    if (Array.isArray(value)) {
      value.forEach((entry, i) => {
        if (entry !== null && typeof entry === "object") {
          parts.push(...encodeForm(entry as FormParams, `${key}[${i}]`));
        } else {
          parts.push(`${key}[${i}]=${encodeURIComponent(String(entry))}`);
        }
      });
    } else if (typeof value === "object") {
      parts.push(...encodeForm(value as FormParams, key));
    } else {
      parts.push(`${key}=${encodeURIComponent(String(value))}`);
    }
  }
  return parts;
}

export class StripeError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export class Stripe {
  constructor(private readonly secretKey: string) {}

  private async request<T>(
    method: "GET" | "POST",
    path: string,
    params?: FormParams,
    idempotencyKey?: string
  ): Promise<T> {
    const headers: Record<string, string> = {
      authorization: `Bearer ${this.secretKey}`,
      "content-type": "application/x-www-form-urlencoded",
    };
    if (idempotencyKey) headers["idempotency-key"] = idempotencyKey;

    const body = params ? encodeForm(params).join("&") : undefined;
    const url = method === "GET" && body ? `${STRIPE_API}${path}?${body}` : `${STRIPE_API}${path}`;

    const res = await fetch(url, {
      method,
      headers,
      body: method === "POST" ? body : undefined,
    });
    const data = (await res.json()) as any;
    if (!res.ok) {
      throw new StripeError(data?.error?.message ?? "Stripe request failed", res.status);
    }
    return data as T;
  }

  // Accepts a loosely-typed object; the encoder handles arbitrary nesting.
  createCheckoutSession(params: Record<string, unknown>, idempotencyKey?: string) {
    return this.request<{ id: string; url: string }>(
      "POST",
      "/checkout/sessions",
      params as FormParams,
      idempotencyKey
    );
  }

  retrieveCheckoutSession(id: string) {
    return this.request<any>("GET", `/checkout/sessions/${id}`, {
      "expand[0]": "line_items",
      "expand[1]": "customer",
    } as FormParams);
  }
}

/* --------------------- webhook signature verification ------------------- */

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return mismatch === 0;
}

function toHex(buffer: ArrayBuffer): string {
  return [...new Uint8Array(buffer)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Verify a Stripe webhook signature header (`Stripe-Signature`).
 * Returns the parsed event on success, or null if verification fails.
 */
export async function verifyStripeSignature(
  payload: string,
  signatureHeader: string | null,
  secret: string,
  toleranceSeconds = 300
): Promise<any | null> {
  if (!signatureHeader) return null;
  const parts = Object.fromEntries(
    signatureHeader.split(",").map((kv) => kv.split("=").map((s) => s.trim()))
  ) as Record<string, string>;
  const timestamp = parts["t"];
  const expected = parts["v1"];
  if (!timestamp || !expected) return null;

  // reject stale timestamps (replay protection)
  const age = Math.abs(Date.now() / 1000 - Number(timestamp));
  if (!Number.isFinite(age) || age > toleranceSeconds) return null;

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sigBuf = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(`${timestamp}.${payload}`)
  );
  const computed = toHex(sigBuf);
  if (!timingSafeEqual(computed, expected)) return null;

  try {
    return JSON.parse(payload);
  } catch {
    return null;
  }
}
