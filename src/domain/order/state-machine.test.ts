import { describe, expect, it } from 'vitest';
import { assertCanPerform } from './state-machine';
import { DomainError } from '@/domain/errors';

// Returns the DomainError code, or null when no error was thrown
const codeOf = (fn: () => unknown) => {
    try { fn(); return null; } catch (e) { return e instanceof DomainError ? e.code : 'UNEXPECTED'; }
};

describe('assertCanPerform', () => {
    it('technician quotes a pending order', () =>
        expect(assertCanPerform('sendQuote', 'technician', 'pending_quote')).toBe('quoted'));
    it('technician can revise a quoted order', () =>
        expect(assertCanPerform('sendQuote', 'technician', 'quoted')).toBe('quoted'));
    it('customer accepts a quoted order', () =>
        expect(assertCanPerform('accept', 'customer', 'quoted')).toBe('accepted'));
    it('customer cannot send a quote', () =>
        expect(codeOf(() => assertCanPerform('sendQuote', 'customer', 'pending_quote'))).toBe('FORBIDDEN'));
    it('technician cannot accept their own quote', () =>
        expect(codeOf(() => assertCanPerform('accept', 'technician', 'quoted'))).toBe('FORBIDDEN'));
    it('cannot accept before any quote exists', () =>
        expect(codeOf(() => assertCanPerform('accept', 'customer', 'pending_quote'))).toBe('INVALID_STATE'));
    it('party is checked before state', () =>
        expect(codeOf(() => assertCanPerform('sendQuote', 'customer', 'released'))).toBe('FORBIDDEN'));
    it.each(['paid', 'in_progress', 'completed', 'released', 'cancelled', 'refunded', 'disputed'] as const)(
        'cannot cancel from %s', (s) =>
            expect(codeOf(() => assertCanPerform('cancel', 'customer', s))).toBe('INVALID_STATE'));
});