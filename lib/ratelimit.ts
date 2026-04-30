import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

function makeRatelimit(prefix: string, limiter: ConstructorParameters<typeof Ratelimit>[0]["limiter"]) {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    // Ratelimiting disabled — env vars not configured
    return { limit: async () => ({ success: true }) };
  }
  return new Ratelimit({
    redis: new Redis({ url, token }),
    limiter,
    prefix,
  });
}

// 10 login attempts per IP per 15 minutes
export const loginRatelimit = makeRatelimit("rl:login", Ratelimit.slidingWindow(10, "15 m"));

// 60 entries created per user per hour
export const entryRatelimit = makeRatelimit("rl:entry", Ratelimit.slidingWindow(60, "1 h"));
