// Simple in-memory rate limiter for Next.js API routes

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const tracker = new Map<string, RateLimitRecord>();

/**
 * Checks if an identifier (e.g. IP or email) has exceeded the rate limit.
 * Defaults to 5 requests per 10 minutes (600,000 milliseconds).
 */
export function isRateLimited(
  identifier: string,
  limit = 5,
  windowMs = 10 * 60 * 1000
): { limited: boolean; remaining: number; resetMs: number } {
  const now = Date.now();
  const record = tracker.get(identifier);

  if (!record) {
    tracker.set(identifier, { count: 1, resetTime: now + windowMs });
    return { limited: false, remaining: limit - 1, resetMs: windowMs };
  }

  if (now > record.resetTime) {
    // Reset window
    record.count = 1;
    record.resetTime = now + windowMs;
    tracker.set(identifier, record);
    return { limited: false, remaining: limit - 1, resetMs: windowMs };
  }

  if (record.count >= limit) {
    return { limited: true, remaining: 0, resetMs: record.resetTime - now };
  }

  record.count += 1;
  tracker.set(identifier, record);
  return { limited: false, remaining: limit - record.count, resetMs: record.resetTime - now };
}
