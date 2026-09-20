import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { Container } from '@/components/layout/container';
import { StatusBadge } from '@/components/ui/status-badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { OrderTimeline } from '@/components/orders/order-timeline';
import { formatBaht } from '@/lib/format';
import { findOrder } from '@/lib/mock/marketplace';

export default async function CustomerOrderDetailPage({
    params,
}: {
    params: Promise<{ orderId: string }>;
}) {
    const { orderId } = await params;
    const order = findOrder(orderId);
    if (!order) notFound();

    const t = await getTranslations('orderDetail');
    const latestQuote = order.quotes[order.quotes.length - 1];
    const canPay = order.status === 'quoted' || order.status === 'awaiting_payment';

    return (
        <Container size="lg" gutter="lg">
            <Link href="/orders" className="mb-4 inline-block text-sm text-muted-foreground hover:text-foreground">
                ← {t('back')}
            </Link>

            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h1 className="text-xl font-bold text-foreground text-balance">{order.serviceTitle}</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        #{order.id} · {t('technician')} {order.technicianName} · {t('opened')} {order.createdAt}
                    </p>
                </div>
                <StatusBadge status={order.status} label={t(`status.${order.status}`)} />
            </div>

            <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
                <div>
                    <h2 className="mb-4 text-sm font-semibold text-foreground">{t('jobStatus')}</h2>
                    <OrderTimeline steps={order.steps} />

                    <h2 className="mt-8 mb-2 text-sm font-semibold text-foreground">{t('yourBrief')}</h2>
                    <p className="rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">{order.customerBrief}</p>
                </div>

                <aside className="rounded-xl border border-border bg-card p-5">
                    <div className="flex items-center justify-between">
                        <p className="text-xs font-medium text-muted-foreground">{t('currentQuote', { version: latestQuote.version })}</p>
                        <StatusBadge status={order.status} label={t(`quoteStatus.${latestQuote.status}`)} />
                    </div>
                    <p className="mt-2 text-2xl font-bold text-foreground">{formatBaht(latestQuote.priceBaht * 100)}</p>

                    <dl className="mt-4 space-y-2 border-t border-hairline pt-4 text-sm">
                        <Row label={t('duration')} value={latestQuote.durationLabel} />
                        <Row label={t('equipment')} value={order.equipmentLabel} />
                        <Row label={t('revisions')} value={order.revisionsLabel} />
                    </dl>

                    {latestQuote.note && (
                        <p className="mt-4 rounded-lg bg-muted p-3 text-xs text-muted-foreground">{latestQuote.note}</p>
                    )}

                    {canPay ? (
                        <>
                            <Link href={`/orders/${order.id}/payment`} className={buttonVariants({ className: 'mt-5 w-full' })}>
                                {t('acceptAndPay')}
                            </Link>
                            <Link
                                href={`/orders/${order.id}/chat`}
                                className={buttonVariants({ variant: 'outline', className: 'mt-2 w-full' })}
                            >
                                {t('negotiate')}
                            </Link>
                        </>
                    ) : order.status === 'completed' ? (
                        <Link href={`/orders/${order.id}/review`} className={buttonVariants({ className: 'mt-5 w-full' })}>
                            {t('leaveReview')}
                        </Link>
                    ) : (
                        <Button className="mt-5 w-full" disabled>{t('confirmDone')}</Button>
                    )}

                    <p className="mt-3 text-center text-xs text-muted-foreground">🔒 {t('escrowNote')}</p>
                </aside>
            </div>

            <Link
                href={`/orders/${order.id}/chat`}
                className="mt-6 flex items-center justify-center gap-2 rounded-xl border border-border bg-card py-3 text-sm font-medium text-foreground transition-colors hover:border-primary"
            >
                💬 {t('chatWithTechnician')}
            </Link>
        </Container>
    );
}

function Row({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-center justify-between">
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="font-medium text-foreground">{value}</dd>
        </div>
    );
}
