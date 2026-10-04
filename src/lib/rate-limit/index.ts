// index.ts — the only module the rest of the app imports
import 'server-only';
import { createHmac } from 'node:crypto';
import { memoryLimiter } from './memory';
import { createUpstashLimiter } from './upstash';
import type { RateLimitName, RateLimiter, RateLimitResult } from './rules';
import { apiError } from '@/lib/api/errors';

let limiter: RateLimiter | undefined;

function getLimiter(): RateLimiter {
    if (limiter) return limiter;
    const driver = process.env.RATE_LIMIT_DRIVER ?? 'memory';

    if (driver === 'upstash') {
        const url = process.env.UPSTASH_REDIS_REST_URL;
        const token = process.env.UPSTASH_REDIS_REST_TOKEN;
        if (!url || !token) throw new Error('RATE_LIMIT_DRIVER=upstash but UPSTASH_REDIS_REST_URL/TOKEN missing');
        limiter = createUpstashLimiter(url, token);
    } else if (driver === 'memory') {
        // In production, memory looks like it works but every instance counts separately
        if (process.env.NODE_ENV === 'production') throw new Error('Memory rate limiter is not allowed in production');
        limiter = memoryLimiter;
    } else {
        throw new Error(`Unknown RATE_LIMIT_DRIVER: ${driver}`);
    }
    return limiter;
}

export async function rateLimit(name: RateLimitName, identifier: string): Promise<RateLimitResult> {
    try {
        return await getLimiter().check(name, identifier);
    } catch (err) {
        // Fail-open: an outage of the limiter must not lock every user out
        console.error(`[rate-limit] ${name} check failed, allowing request`, err);
        return { success: true, remaining: 0, resetAt: Date.now() };
    }
}

// Keyed hash: usable as a counter key, not reversible to the email by the store
export function hashIdentifier(value: string): string {
    return createHmac('sha256', process.env.AUTH_SECRET!).update(value).digest('hex').slice(0, 32);
}

// Vercel sets x-forwarded-for itself (client IP first). If you ever self-host,
// only trust this header when your proxy overwrites it.
export function getClientIp(req: Request): string {
    return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
        || req.headers.get('x-real-ip')
        || 'unknown';
}

export function rateLimitResponse(result: RateLimitResult) {
    const retryAfter = Math.max(1, Math.ceil((result.resetAt - Date.now()) / 1000));
    return apiError('RATE_LIMITED', 429, {
        headers: { 'Retry-After': String(retryAfter) },
    });
}