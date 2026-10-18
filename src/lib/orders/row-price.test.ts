import { describe, expect, it } from 'vitest';
import { rowPrice } from './row-price';

const q = { amount: 150000, status: 'sent' };

describe('rowPrice', () => {
    it('waiting for the first quote', () => expect(rowPrice('pending_quote', null)).toEqual({ kind: 'awaiting' }));
    it('cancelled before any quote shows nothing', () => expect(rowPrice('cancelled', null)).toEqual({ kind: 'none' }));
    it('cancelled after a quote still shows nothing', () =>
        expect(rowPrice('cancelled', { ...q, status: 'rejected' })).toEqual({ kind: 'none' }));
    it('a live or agreed quote shows its amount', () => {
        expect(rowPrice('quoted', q)).toEqual({ kind: 'amount', amount: 150000 });
        expect(rowPrice('accepted', { ...q, status: 'accepted' })).toEqual({ kind: 'amount', amount: 150000 });
    });
});