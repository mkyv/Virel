// In-memory rate limiter. Bucket por key (típicamente IP del cliente).

interface Bucket {
  count: number;
  resetAt: number;
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt < now) {
    const resetAt = now + windowMs;
    buckets.set(key, { count: 1, resetAt });
    return { success: true, remaining: limit - 1, resetAt };
  }

  if (bucket.count >= limit) {
    return { success: false, remaining: 0, resetAt: bucket.resetAt };
  }

  bucket.count++;
  return {
    success: true,
    remaining: limit - bucket.count,
    resetAt: bucket.resetAt,
  };
}
