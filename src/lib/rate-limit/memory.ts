// memory.ts — dev/CI only: per-process, resets on restart, never shared between instances
import { RATE_LIMITS, type RateLimiter } from './rules';

const buckets = new Map<string, { count: number; resetAt: number }>();

export const memoryLimiter: RateLimiter = {
    async check(name, identifier) {
        const rule = RATE_LIMITS[name];
        const key = `${name}:${identifier}`;
        const now = Date.now();

        let bucket = buckets.get(key);
        if (!bucket || bucket.resetAt <= now) {
            bucket = { count: 0, resetAt: now + rule.windowSec * 1000 };
            buckets.set(key, bucket);
        }
        bucket.count += 1;

        return {
            success: bucket.count <= rule.limit,
            remaining: Math.max(0, rule.limit - bucket.count),
            resetAt: bucket.resetAt,
        };
    },
};