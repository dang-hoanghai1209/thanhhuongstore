import redis from '@/lib/redis';

interface RateLimitConfig {
  keyPrefix: string;
  limit: number;
  windowSeconds: number;
}

/**
 * Redis sliding window rate limiter
 * Returns true if request is allowed, false if rate limited.
 */
export async function isRateLimited(ip: string, config: RateLimitConfig): Promise<boolean> {
  const key = `rate_limit:${config.keyPrefix}:${ip}`;
  const now = Date.now();
  const clearBefore = now - config.windowSeconds * 1000;

  try {
    const pipeline = redis.multi();
    
    // Remove expired entries
    pipeline.zremrangebyscore(key, 0, clearBefore);
    // Count active entries in window
    pipeline.zcard(key);
    // Add current request
    pipeline.zadd(key, now, `${now}-${Math.random().toString(36).substring(2, 7)}`);
    // Set expire on the key to avoid persistent memory leaks
    pipeline.expire(key, config.windowSeconds + 2);

    const results = await pipeline.exec();
    if (!results) return false;

    // The second command (index 1) in multi returns the count of ZCARD
    const cardResult = results[1];
    if (cardResult && cardResult[1] !== undefined) {
      const requestCount = cardResult[1] as number;
      if (requestCount >= config.limit) {
        return true; // Limit reached, rate limited!
      }
    }
  } catch (error) {
    console.error('Rate Limiter Error (falling back to allowed):', error);
  }

  return false; // Request allowed
}

// 1. Auth Limiter (E.g. Login, Register) - 5 requests per 1 minute
export const authLimiter = {
  check: (ip: string) => isRateLimited(ip, { keyPrefix: 'auth', limit: 5, windowSeconds: 60 }),
};

// 2. Public API Limiter - 60 requests per 1 minute
export const apiLimiter = {
  check: (ip: string) => isRateLimited(ip, { keyPrefix: 'api', limit: 60, windowSeconds: 60 }),
};

// 3. AI Chat Limiter - 20 requests per 1 minute (as per API specs)
export const chatLimiter = {
  check: (ip: string) => isRateLimited(ip, { keyPrefix: 'chat', limit: 20, windowSeconds: 60 }),
};
