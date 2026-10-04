import 'server-only';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { RATE_LIMITS, type RateLimitName, type RateLimiter } from './rules';

export function createUpstashLimiter(url: string, token: string): RateLimiter {
    const redis = new Redis({ url, token });

    // One Ratelimit per rule, built once and reused: its in-memory ephemeral cache
    // only helps if the instance outlives a single request
    const limiters = Object.fromEntries(
        (Object.keys(RATE_LIMITS) as RateLimitName[]).map((name) => {
            const rule = RATE_LIMITS[name];
            return [name, new Ratelimit({
                redis,
                limiter: Ratelimit.slidingWindow(rule.limit, `${rule.windowSec} s`),
                prefix: `rl:${name}`,
                timeout: 1000, // Redis slower than 1s → let the request through (fail-open)
            })];
        }),
    ) as Record<RateLimitName, Ratelimit>;

    return {
        async check(name, identifier) {
            const r = await limiters[name].limit(identifier);
            return { success: r.success, remaining: r.remaining, resetAt: r.reset };
        },
    };
}