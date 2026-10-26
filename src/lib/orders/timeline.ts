import type { OrderStatus } from '@/domain/order/state-machine';

// The happy path both parties walk through, in order
const MAIN_PATH: readonly OrderStatus[] = ['pending_quote', 'quoted', 'accepted', 'paid', 'in_progress', 'completed', 'released'];

export type TimelineStep = { key: OrderStatus; state: 'done' | 'current' | 'pending'; at: Date | null };
type EventLike = { toStatus: OrderStatus; createdAt: Date };

// Pure: status + audit events in, steps out. Labels and date formatting stay in the UI.
export function buildTimeline(status: OrderStatus, events: readonly EventLike[]): TimelineStep[] {
    // First time each status was reached — a revise re-enters 'quoted', the first entry is the milestone.
    // Assumes events arrive oldest first (getOrderForUser orders them by createdAt).
    const firstAt = new Map<OrderStatus, Date>();
    for (const e of events) if (!firstAt.has(e.toStatus)) firstAt.set(e.toStatus, e.createdAt);

    const index = MAIN_PATH.indexOf(status);
    if (index === -1) {
        // Off the happy path (cancelled, refunded, disputed): what was reached, then where it ended
        const reached = MAIN_PATH.filter((s) => firstAt.has(s));
        return [
            ...reached.map((key): TimelineStep => ({ key, state: 'done', at: firstAt.get(key) ?? null })),
            { key: status, state: 'current', at: firstAt.get(status) ?? null },
        ];
    }

    return MAIN_PATH.map((key, i): TimelineStep => ({
        key,
        state: i < index || status === 'released' ? 'done' : i === index ? 'current' : 'pending',
        at: firstAt.get(key) ?? null,
    }));
}