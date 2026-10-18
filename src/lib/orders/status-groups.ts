import type { OrderStatus } from "@/domain/order/state-machine";

export const ORDER_TABS = ['all', 'active', 'done', 'cancelled'] as const;
export type OrderTab = (typeof ORDER_TABS)[number];

const TAB_STATUSES: Record<Exclude<OrderTab, 'all'>, readonly OrderStatus[]> = {
    active: ['pending_quote', 'quoted', 'accepted', 'paid', 'in_progress', 'completed', 'disputed'],
    done: ['released'],
    cancelled: ['cancelled', 'refunded'],
}

export const isOrderTab = (v: unknown): v is OrderTab => ORDER_TABS.includes(v as OrderTab);
export const inTab = (status: OrderStatus, tab: OrderTab) => tab === 'all' || TAB_STATUSES[tab].includes(status);