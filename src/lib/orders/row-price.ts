import type { OrderStatus } from '@/domain/order/state-machine';

type LatestQuote = { amount: number; status: string } | null;
export type RowPrice = { kind: 'amount'; amount: number } | { kind: 'awaiting' } | { kind: 'none' };

// Driven by the ORDER status, never by "is there a quote": no quote also happens on a cancelled order.
export function rowPrice(status: OrderStatus, latest: LatestQuote): RowPrice {
    if (status === 'cancelled' || status === 'refunded') return { kind: 'none' }; // no money changes hands
    if (status === 'pending_quote') return { kind: 'awaiting' };
    return latest ? { kind: 'amount', amount: latest.amount } : { kind: 'none' };
}