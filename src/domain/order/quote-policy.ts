import { DomainError } from '@/domain/errors';

// Business policy, not a DB invariant: tune it here without a migration.
// 3 = the first quote + 2 revisions before the customer must accept or cancel.
export const MAX_QUOTE_VERSIONS = 3;

export function nextQuoteVersion(currentMax: number): number {
    const next = currentMax + 1;
    if (next > MAX_QUOTE_VERSIONS) throw new DomainError('QUOTE_LIMIT_REACHED');
    return next;
}

// For the UI: "revise N more times" (pure, safe to import in client components)
export const revisionsLeft = (currentMax: number) => Math.max(0, MAX_QUOTE_VERSIONS - currentMax);

export function isQuoteExpired(expiresAt: Date | null, now: Date): boolean {
    return expiresAt !== null && expiresAt <= now;
}