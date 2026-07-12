import { NextRequest } from 'next/server';
import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';

export function getClientIp(request: NextRequest): string {
  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp;

  const vercelIp = request.headers.get('x-vercel-forwarded-for');
  if (vercelIp) return vercelIp.split(',')[0].trim();

  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();

  return '127.0.0.1';
}

// In-memory fallback rate limiter map
interface LocalLimitRecord {
  count: number;
  resetTime: number;
}
const tracker = new Map<string, LocalLimitRecord>();

function localRateLimit(
  identifier: string,
  limit: number,
  windowMs: number
): { limited: boolean; remaining: number; resetMs: number } {
  const now = Date.now();
  const record = tracker.get(identifier);

  if (!record || now > record.resetTime) {
    const expires = now + windowMs;
    tracker.set(identifier, { count: 1, resetTime: expires });
    return { limited: false, remaining: limit - 1, resetMs: windowMs };
  }

  if (record.count >= limit) {
    return { limited: true, remaining: 0, resetMs: Math.max(0, record.resetTime - now) };
  }

  record.count += 1;
  tracker.set(identifier, record);
  return { limited: false, remaining: limit - record.count, resetMs: Math.max(0, record.resetTime - now) };
}

// Initialize Upstash Redis if environment variables are present
let redis: Redis | null = null;
const ratelimiters = new Map<string, Ratelimit>();

let url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
let token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

if (!url || !token) {
  const urlKey = Object.keys(process.env).find(k => k.endsWith('KV_REST_API_URL') || k.endsWith('REDIS_REST_URL'));
  const tokenKey = Object.keys(process.env).find(k => k.endsWith('KV_REST_API_TOKEN') || k.endsWith('REDIS_REST_TOKEN'));
  if (urlKey && tokenKey) {
    url = process.env[urlKey];
    token = process.env[tokenKey];
  }
}

if (url && token) {
  try {
    redis = new Redis({
      url,
      token,
    });
  } catch (err) {
    console.error('Failed to initialize Upstash Redis:', err);
  }
}

/**
 * Checks if an identifier (e.g. IP or email) has exceeded the rate limit.
 * Uses Upstash Redis if configured, otherwise falls back to local in-memory.
 */
export async function checkRateLimit(
  identifier: string,
  limit = 5,
  windowMs = 10 * 60 * 1000
): Promise<{ limited: boolean; remaining: number; resetMs: number }> {
  if (!redis) {
    return localRateLimit(identifier, limit, windowMs);
  }

  try {
    const configKey = `${limit}_${windowMs}`;
    let limiter = ratelimiters.get(configKey);

    if (!limiter) {
      limiter = new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(limit, `${Math.ceil(windowMs / 1000)} s`),
        prefix: '@upstash/ratelimit/lms',
        ephemeralCache: new Map(),
      });
      ratelimiters.set(configKey, limiter);
    }

    const { success, remaining, reset } = await limiter.limit(identifier);
    const now = Date.now();
    return {
      limited: !success,
      remaining,
      resetMs: Math.max(0, (reset * 1000) - now),
    };
  } catch (err) {
    console.error('Upstash Rate Limiter error, falling back to local limit:', err);
    return localRateLimit(identifier, limit, windowMs);
  }
}
