import { notFound } from 'next/navigation';
import { auth } from '@/auth';
import { redirect, Link } from '@/i18n/navigation';
import { getTranslations } from 'next-intl/server';
import { Container } from '@/components/layout/container';
import { StatusBadge } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import { QuoteForm } from '@/components/orders/quote-form';
import { formatBaht } from '@/lib/format';
import { findOrder } from '@/lib/mock/marketplace';

export default async function TechnicianOrderDetailPage({
    params,
}: {
    params: Promise<{ orderId: string; locale: string }>;
}) {
    const { orderId, locale } = await params;
    const session = await auth();
    if (!session) { redirect({ href: '/auth/login', locale }); return; }
    if (session.user.role !== 'technician') { redirect({ href: '/dashboard', locale }); return; }

    const order = findOrder(orderId);
    if (!order) notFound();

    const t = await getTranslations('technicianOrderDetail');
    const latest = order.quotes[order.quotes.length - 1];
    const feeBaht = Math.round((latest.priceBaht * order.feePercent) / 100);
    const netBaht = latest.priceBaht - feeBaht;

    return (
        <Container size="lg" gutter="lg">
            <Link href="/dashboard" className="mb-4 inline-block text-sm text-muted-foreground hover:text-foreground">
                ← {t('back')}
            </Link>

            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h1 className="text-xl font-bold text-foreground text-balance">{order.serviceTitle}</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        #{order.id} · {t('customer')} {order.customerName} · {t('opened')} {order.createdAt}
                    </p>
                </div>
                <StatusBadge status={order.status} label={t(`status.${order.status}`)} />
            </div>

            <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
                <div className="space-y-6">
                    <div className="rounded-xl border border-border bg-card p-5">
                        <div className="mb-1 flex items-center justify-between">
                            <p className="text-sm font-semibold text-foreground">{order.customerName}</p>
                            <Link href={`/orders/${order.id}/chat`} className="text-xs font-medium text-primary hover:underline">
                                {t('chat')}
                            </Link>
                        </div>
                        <p className="text-xs text-muted-foreground">{t('customerBriefLabel')}</p>
                        <p className="mt-2 text-sm text-muted-foreground">{order.customerBrief}</p>
                    </div>

                    <div className="rounded-xl border border-border bg-card p-5">
                        <h2 className="mb-4 text-sm font-semibold text-foreground">{t('quoteFormTitle')}</h2>
                        <QuoteForm order={order} />
                    </div>

                    {order.quotes.length > 1 && (
                        <div className="rounded-xl border border-border bg-card p-5">
                            <h2 className="mb-3 text-sm font-semibold text-foreground">{t('quoteHistory')}</h2>
                            <div className="space-y-2">
                                {order.quotes.map((q) => (
                                    <div key={q.version} className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">
                                            v{q.version} · {formatBaht(q.priceBaht * 100)}
                                        </span>
                                        <span className={q.status === 'superseded' ? 'text-muted-foreground' : 'font-medium text-foreground'}>
                                            {t(`quoteStatus.${q.status}`)}
                                        </span>
                                        <span className="text-xs text-muted-foreground">{q.submittedAt}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <aside className="rounded-xl border border-border bg-card p-5">
                    <h2 className="mb-3 text-sm font-semibold text-foreground">{t('summary')}</h2>
                    <dl className="space-y-2.5 text-sm">
                        <Row label={t('status')} value={t(`status.${order.status}`)} />
                        <Row label={t('youReceive')} value={formatBaht(latest.priceBaht * 100)} bold />
                        <Row label={t('platformFee', { percent: order.feePercent })} value={`-${formatBaht(feeBaht * 100)}`} />
                    </dl>
                    <div className="mt-3 border-t border-hairline pt-3">
                        <Row label={t('net')} value={formatBaht(netBaht * 100)} bold />
                    </div>

                    <Button className="mt-5 w-full" disabled={order.status !== 'in_progress'}>
                        {t('markDone')}
                    </Button>
                </aside>
            </div>
        </Container>
    );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
    return (
        <div className="flex items-center justify-between">
            <dt className="text-muted-foreground">{label}</dt>
            <dd className={bold ? 'text-base font-bold text-foreground' : 'font-medium text-foreground'}>{value}</dd>
        </div>
    );
}
