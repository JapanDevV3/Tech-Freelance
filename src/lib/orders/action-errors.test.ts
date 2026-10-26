import { describe, expect, it } from 'vitest';
import { orderErrorKey, shouldRefresh } from './action-errors';

describe('orderErrorKey', () => {
    it('keeps codes the UI has a message for', () => expect(orderErrorKey('QUOTE_STALE')).toBe('QUOTE_STALE'));
    it('falls back to a generic key for anything else', () => {
        expect(orderErrorKey('INTERNAL')).toBe('failed');
        expect(orderErrorKey('SOMETHING_NEW')).toBe('failed');
    });
});

describe('shouldRefresh', () => {
    it('reloads when the order changed under the user', () => expect(shouldRefresh('QUOTE_STALE')).toBe(true));
    it('does not reload for errors a reload cannot fix', () => {
        expect(shouldRefresh('NETWORK')).toBe(false);
        expect(shouldRefresh('VALIDATION_ERROR')).toBe(false);
    });
});