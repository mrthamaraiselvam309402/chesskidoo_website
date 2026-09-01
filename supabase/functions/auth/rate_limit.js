// Simple in-memory rate limiter for Supabase Edge Functions
const rateLimitStore = new Map();

const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 10; // 10 requests per minute

export async function checkRateLimit(identifier, type = 'default') {
  const now = Date.now();
  const key = type + ':' + identifier;
  const entry = rateLimitStore.get(key);

  if (!entry || now >= entry.resetTime) {
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW_MS
    });
    return { allowed: true, resetTime: now + RATE_LIMIT_WINDOW_MS };
  }

  if (entry.count >= RATE_LIMIT_MAX_REQUESTS) {
    return { allowed: false, resetTime: entry.resetTime };
  }

  entry.count++;
  return { allowed: true, resetTime: entry.resetTime };
}
