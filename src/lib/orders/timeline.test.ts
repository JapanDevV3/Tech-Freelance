import { describe, expect, it } from 'vitest';
import { buildTimeline } from './timeline';

const at = (min: number) => new Date(Date.UTC(2026, 9, 18, 3, min));

describe('buildTimeline', () => {
    it('new order: first step current, the rest pending', () => {
        const steps = buildTimeline('pending_quote', [{ toStatus: 'pending_quote', createdAt: at(0) }]);
        expect(steps).toHaveLength(7);
        expect(steps.map((s) => s.state)).toEqual(['current', 'pending', 'pending', 'pending', 'pending', 'pending', 'pending']);
    });

    it('revisions keep the FIRST time the order was quoted', () => {
        const steps = buildTimeline('quoted', [
            { toStatus: 'pending_quote', createdAt: at(0) },
            { toStatus: 'quoted', createdAt: at(1) },
            { toStatus: 'quoted', createdAt: at(2) },
            { toStatus: 'quoted', createdAt: at(3) },
        ]);
        expect(steps.at(1)).toEqual({ key: 'quoted', state: 'current', at: at(1) });
        expect(steps.at(0)?.state).toBe('done');
    });

    it('a cancelled order ends with the cancel step, nothing after it', () => {
        const steps = buildTimeline('cancelled', [
            { toStatus: 'pending_quote', createdAt: at(0) },
            { toStatus: 'quoted', createdAt: at(1) },
            { toStatus: 'cancelled', createdAt: at(5) },
        ]);
        expect(steps.map((s) => s.key)).toEqual(['pending_quote', 'quoted', 'cancelled']);
        expect(steps.at(-1)).toEqual({ key: 'cancelled', state: 'current', at: at(5) });
    });

    it('released marks every step done', () => {
        expect(buildTimeline('released', []).every((s) => s.state === 'done')).toBe(true);
    });
});