import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { Container } from '@/components/layout/container';
import { EmptyState } from '@/components/shared/empty-state';
import { StatusBadge, type OrderStatus } from '@/components/ui/status-badge';
import { formatBaht } from '@/lib/format';
import { MOCK_ORDERS } from '@/lib/mock/marketplace';
import { cn } from '@/lib/utils';

const TABS: { key: 'all' | OrderStatus }[] = [
    { key: 'all' },
    { key: 'in_progress' },
    { key: 'awaiting_payment' },
    { key: 'completed' },
];

export default async function OrdersPage({
    searchParams,
}: {
    searchParams: Promise<{ status?: string }>;
}) {
    const { status } = await searchParams;
    const t = await getTranslations('orders');
    const active = TABS.some((tab) => tab.key === status) ? (status as (typeof TABS)[number]['key']) : 'all';

    const orders = active === 'all' ? MOCK_ORDERS : MOCK_ORDERS.filter((o) => o.status === active);

    return (
        <Container size="lg" gutter="lg">
            <h1 className="text-2xl font-bold text-foreground">{t('title')}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{t('subtitle')}</p>

            <div className="mt-6 flex flex-wrap gap-1 rounded-lg bg-muted p-1">
                {TABS.map((tab) => {
                    const count = tab.key === 'all' ? MOCK_ORDERS.length : MOCK_ORDERS.filter((o) => o.status === tab.key).length;
                    const isActive = active === tab.key;
                    return (
                        <Link
                            key={tab.key}
                            href={tab.key === 'all' ? '/orders' : { pathname: '/orders', query: { status: tab.key } }}
                            className={cn(
                                'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                                isActive ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
                            )}
                        >
                            {t(`tabs.${tab.key}`)} ({count})
                        </Link>
                    );
                })}
            </div>

            <div className="mt-4">
                {orders.length === 0 ? (
                    <EmptyState title={t('emptyTitle')} description={t('emptySub')} />
                ) : (
                    <div className="rounded-xl border border-border bg-card px-4">
                        {orders.map((order) => (
                            <Link
                                key={order.id}
                                href={`/orders/${order.id}`}
                                className="flex items-center gap-4 border-b border-hairline py-4 transition-colors last:border-b-0 hover:bg-accent/40"
                            >
                                <div className="size-12 shrink-0 rounded-lg bg-sunken" />
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-semibold text-foreground">{order.serviceTitle}</p>
                                    <p className="truncate text-xs text-muted-foreground">
                                        {t('technician')} {order.technicianName} · #{order.id} · {order.createdAt}
                                    </p>
                                </div>
                                <div className="flex shrink-0 flex-col items-end gap-1.5">
                                    <StatusBadge status={order.status} label={t(`status.${order.status}`)} />
                                    <span className="text-sm font-bold text-foreground">{formatBaht(order.priceBaht * 100)}</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </Container>
    );
}
