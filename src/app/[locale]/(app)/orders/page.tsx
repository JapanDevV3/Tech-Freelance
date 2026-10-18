import { getFormatter, getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { Container } from '@/components/layout/container';
import { EmptyState } from '@/components/shared/empty-state';
import { OrderRow } from '@/components/orders/order-row';
import { requireSession } from '@/lib/auth-guard';
import { ORDER_TABS, inTab, isOrderTab } from '@/lib/orders/status-groups';
import { cn } from '@/lib/utils';
import { listMyOrders } from '@/services/order.service';
import { rowPrice } from '@/lib/orders/row-price';

type Props = { params: Promise<{ locale: string }>; searchParams: Promise<{ tab?: string }> };

export default async function OrdersPage({ params, searchParams }: Props) {
    const { locale } = await params;
    const session = await requireSession(locale, '/orders');
    const party = session.user.role; // the session decides the perspective, never the URL
    const { tab } = await searchParams;
    const active = isOrderTab(tab) ? tab : 'all';

    const [t, tStatus, format, orders] = await Promise.all([
        getTranslations('orders'),
        getTranslations('orderStatus'),
        getFormatter(),
        listMyOrders(session.user.id, party),
    ]);
    const visible = orders.filter((o) => inTab(o.status, active));

    return (
        <Container size="lg" gutter="lg">
            <h1 className="text-2xl font-bold text-foreground">{t('title')}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{t('subtitle')}</p>

            <div className="mt-6 flex flex-wrap gap-1 rounded-lg bg-muted p-1">
                {ORDER_TABS.map((key) => (
                    <Link
                        key={key}
                        href={key === 'all' ? '/orders' : { pathname: '/orders', query: { tab: key } }}
                        aria-current={active === key ? 'page' : undefined}
                        className={cn(
                            'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                            active === key ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
                        )}
                    >
                        {t(`tabs.${key}`)} ({orders.filter((o) => inTab(o.status, key)).length})
                    </Link>
                ))}
            </div>

            <div className="mt-4">
                {visible.length === 0 ? (
                    <EmptyState title={t('emptyTitle')} description={t('emptySub')} />
                ) : (
                    <div className="rounded-xl border border-border bg-card px-4">
                        {visible.map((o) => {
                            const who = party === 'customer'
                                ? `${t('technician')} ${o.technician.displayName}`
                                : `${t('customer')} ${o.customer.name}`;
                            return (
                                <OrderRow
                                    key={o.id}
                                    href={`/orders/${o.id}`}
                                    title={o.service.title}
                                    subtitle={`${who} · ${format.dateTime(o.createdAt, { dateStyle: 'medium' })}`}
                                    price={rowPrice(o.status, o.quotes.at(0) ?? null)}
                                    awaitingLabel={t('awaitingQuote')}
                                    status={o.status}
                                    statusLabel={tStatus(`${party}.${o.status}`)}
                                />
                            );
                        })}
                    </div>
                )}
            </div>
        </Container>
    );
}