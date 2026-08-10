/**
 * In-memory fixed-window rate limiter for unauthenticated endpoints.
 *
 * Scope and limits, stated plainly: this is per-process memory. It resets on
 * deploy and does NOT coordinate across instances, so on multi-instance hosting
 * the effective limit is (limit × instances). That is fine for what it defends
 * against here — casual scripted abuse of the newsletter form filling the
 * subscribers table. It is NOT a defence against a distributed flood; that
 * belongs at the CDN/WAF layer, or in Redis if this ever needs to be exact.
 */

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

// Bounds memory if a lot of distinct IPs show up between sweeps.
const MAX_TRACKED_KEYS = 10_000;

function sweep(now: number): void {
  for (const [key, b] of buckets) {
    if (b.resetAt <= now) buckets.delete(key);
  }
}

export type RateLimitResult = {
  ok: boolean;
  /** Seconds until the window resets — feeds the Retry-After header. */
  retryAfter: number;
};

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    if (buckets.size >= MAX_TRACKED_KEYS) sweep(now);
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfter: 0 };
  }

  existing.count += 1;
  if (existing.count > limit) {
    return {
      ok: false,
      retryAfter: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
    };
  }
  return { ok: true, retryAfter: 0 };
}

/**
 * Best-effort client IP.
 *
 * `x-forwarded-for` is client-controlled unless a trusted proxy overwrites it.
 * Behind Vercel/Cloudflare it is trustworthy; on a bare server it is not, and a
 * spoofed header defeats this limiter. Documented rather than silently assumed.
 */
export function clientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return req.headers.get("x-real-ip")?.trim() || "unknown";
}
