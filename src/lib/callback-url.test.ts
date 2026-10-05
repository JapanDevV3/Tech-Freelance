import { describe, it, expect } from 'vitest';
import { toSafeCallbackPath, DEFAULT_CALLBACK_PATH as FALLBACK } from './callback-url';

describe('toSafeCallbackPath', () => {
    it.each([
        ['/technician/services/new', '/technician/services/new'],
        ['/th/orders/1?tab=chat', '/orders/1?tab=chat'],
        ['/en', '/'],
        ['/th/orders/1#x', '/orders/1#x'],
        ['/th?x=//evil.com', '/?x=//evil.com'], // '//' inside the query is harmless
    ])('keeps same-origin path %j → %j', (input, expected) => {
        expect(toSafeCallbackPath(input)).toBe(expected);
    });

    it.each([
        '//evil.com', '/\\evil.com', '/\t/evil.com', '/\n/evil.com',
        'https://evil.com', 'javascript:alert(1)',
        // regressions: became '//evil.com' only after normalisation / locale stripping
        '/th//evil.com', '/th///evil.com', '/..//evil.com', '/th/..//evil.com', '/././/evil.com',
    ])('rejects off-site target %j', (input) => {
        expect(toSafeCallbackPath(input)).toBe(FALLBACK);
    });

    it.each([null, undefined, '', '/auth/login', '/th/auth/register', '/en/auth', '/' + 'a'.repeat(600)])(
        'falls back for %j',
        (input) => {
            expect(toSafeCallbackPath(input)).toBe(FALLBACK);
        },
    );
});