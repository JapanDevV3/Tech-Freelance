import type { orderStatus } from '@/db/schema'; // type-only: no runtime DB dependency
import { DomainError } from '@/domain/errors';

export type OrderStatus = (typeof orderStatus.enumValues)[number];
export type OrderParty = 'customer' | 'technician';

// Statuses where the customer's money has entered escrow and has not been returned.
// `disputed` is left out until the dispute flow decides who keeps the money.
export const FUNDED_STATUSES = ['paid', 'in_progress', 'completed', 'released'] as const satisfies readonly OrderStatus[];

type Rule = { by: readonly OrderParty[]; from: readonly OrderStatus[]; to: OrderStatus };

// Every status change is a named action: WHO may do it, FROM which states, TO which state.
// Authorization (layer 2) and the state guard live in one reviewable table.
export const ORDER_ACTIONS = {
    sendQuote: { by: ['technician'], from: ['pending_quote', 'quoted'], to: 'quoted' },
    accept:    { by: ['customer'], from: ['quoted'], to: 'accepted' },
    cancel:    { by: ['customer', 'technician'], from: ['pending_quote', 'quoted', 'accepted'], to: 'cancelled' },
    // Wired in the payment PR — listed now so the whole lifecycle is tested in one place
    start:     { by: ['technician'], from: ['paid'], to: 'in_progress' },
    complete:  { by: ['technician'], from: ['in_progress'], to: 'completed' },
    confirm:   { by: ['customer'], from: ['completed'], to: 'released' },
} as const satisfies Record<string, Rule>;

export type OrderAction = keyof typeof ORDER_ACTIONS;

// Party is checked before state: a customer trying to quote gets 403 whatever the status,
// so the error never hints at where the order is in its lifecycle.
export function assertCanPerform(action: OrderAction, party: OrderParty, status: OrderStatus): OrderStatus {
    const rule: Rule = ORDER_ACTIONS[action];
    if (!rule.by.includes(party)) throw new DomainError('FORBIDDEN');
    if (!rule.from.includes(status)) throw new DomainError('INVALID_STATE');
    return rule.to;
}

// Same rule table, boolean answer — for deciding whether the UI shows an action.
// UX only: the service layer still calls assertCanPerform, which is what actually protects the data.
export function canPerform(action: OrderAction, party: OrderParty, status: OrderStatus): boolean{
    const rule: Rule = ORDER_ACTIONS[action];
    return rule.by.includes(party) && rule.from.includes(status);
}