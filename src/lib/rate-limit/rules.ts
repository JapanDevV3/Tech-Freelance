export type RateLimitRule = { limit: number; windowSec: number };

export const RATE_LIMITS = {
    loginIp: { limit: 20, windowSec: 15 * 60 },
    loginEmail: { limit: 5, windowSec: 15 * 60 },
    register: { limit: 5, windowSec: 60 * 60 },
    upload: { limit: 30, windowSec: 10 * 60 },
    createService: { limit: 10, windowSec: 60 * 60 },
    updateService: { limit: 30, windowSec: 60 * 60 },
    createOrder: { limit: 20, windowSec: 60 * 60 },
    sendQuote: { limit: 30, windowSec: 60 * 60 },
} as const satisfies Record<string, RateLimitRule>;

export type RateLimitName = keyof typeof RATE_LIMITS;
export type RateLimitResult = { success: boolean; remaining: number; resetAt: number }; // resetAt: epoch ms

export interface RateLimiter {
    check(name: RateLimitName, identifier: string): Promise<RateLimitResult>;
}