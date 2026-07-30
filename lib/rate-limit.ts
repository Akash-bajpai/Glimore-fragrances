/**
 * Minimal in-memory sliding-window rate limiter.
 *
 * Good enough for a single-instance deployment. If you deploy to multiple
 * serverless instances / edge regions, swap this for a shared store such as
 * Upstash Redis (`@upstash/ratelimit`) — the call signature below is designed
 * to make that a drop-in replacement later.
 */

interface Bucket {
  count: number;
  windowStart: number;
}

const buckets = new Map<string, Bucket>();

// Periodically clear stale buckets so this doesn't leak memory forever.
setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of buckets) {
    if (now - bucket.windowStart > 10 * 60 * 1000) buckets.delete(key);
  }
}, 5 * 60 * 1000).unref?.();

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetMs: number;
}

/**
 * @param key Unique identifier, typically `${routeName}:${ip}`
 * @param limit Max requests allowed within the window
 * @param windowMs Window size in milliseconds
 */
export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || now - existing.windowStart > windowMs) {
    buckets.set(key, { count: 1, windowStart: now });
    return { success: true, remaining: limit - 1, resetMs: windowMs };
  }

  if (existing.count >= limit) {
    return { success: false, remaining: 0, resetMs: windowMs - (now - existing.windowStart) };
  }

  existing.count += 1;
  return { success: true, remaining: limit - existing.count, resetMs: windowMs - (now - existing.windowStart) };
}

/** Best-effort client IP extraction behind common proxies/load balancers. */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}
