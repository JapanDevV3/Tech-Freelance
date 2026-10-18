import { describe, expect, it } from 'vitest';
import { orderStatus } from '@/db/schema';
import { inTab, type OrderTab } from './status-groups';

describe('order tabs', () => {
    // Guards the future: a new enum value that nobody grouped would vanish from every tab but "all"
    it('every status lands in exactly one tab', () => {
        for (const s of orderStatus.enumValues) {
            const tabs = (['active', 'done', 'cancelled'] as OrderTab[]).filter((t) => inTab(s, t));
            expect(tabs, s).toHaveLength(1);
        }
    });
});