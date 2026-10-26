import { describe, expect, it } from 'vitest';
import { MAX_QUOTE_VERSIONS, isQuoteExpired, nextQuoteVersion, revisionsLeft } from './quote-policy';
import { DomainError } from '@/domain/errors';

describe('nextQuoteVersion', () => {
    it('first quote is v1', () => expect(nextQuoteVersion(0)).toBe(1));
    it('allows revising up to the limit', () =>
        expect(nextQuoteVersion(MAX_QUOTE_VERSIONS - 1)).toBe(MAX_QUOTE_VERSIONS));
    it('refuses past the limit', () => {
        try { nextQuoteVersion(MAX_QUOTE_VERSIONS); expect.unreachable(); }
        catch (e) { expect((e as DomainError).code).toBe('QUOTE_LIMIT_REACHED'); }
    });
});

describe('revisionsLeft', () => {
    it('counts down and never goes negative', () => {
        expect(revisionsLeft(1)).toBe(MAX_QUOTE_VERSIONS - 1);
        expect(revisionsLeft(MAX_QUOTE_VERSIONS + 5)).toBe(0);
    });
});

describe('isQuoteExpired', () => {
    const now = new Date('2026-10-12T12:00:00Z');
    it('no expiry never expires', () => expect(isQuoteExpired(null, now)).toBe(false));
    it('expires exactly at the boundary', () => expect(isQuoteExpired(now, now)).toBe(true));
    it('future expiry is still valid', () =>
        expect(isQuoteExpired(new Date('2026-10-13T00:00:00Z'), now)).toBe(false));
});