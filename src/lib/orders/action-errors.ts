// API codes the order UI has a specific message for. Anything else → one generic message,
// so a raw code like "INTERNAL" never reaches the screen.
const KNOWN = ['QUOTE_STALE', 'QUOTE_LIMIT_REACHED', 'INVALID_STATE', 'FORBIDDEN', 'NOT_FOUND', 'RATE_LIMITED', 'NETWORK'] as const;

// API code → key in the `orderErrors` i18n namespace
export const orderErrorKey = (code: string) => ((KNOWN as readonly string[]).includes(code) ? code : 'failed');

// "The order changed under you" — the screen is out of date, so reload it to show the truth
export const shouldRefresh = (code: string) =>
    code === 'QUOTE_STALE' || code === 'INVALID_STATE' || code === 'QUOTE_LIMIT_REACHED';