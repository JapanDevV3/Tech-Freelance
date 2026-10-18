import { notFound } from 'next/navigation';
import { getFormatter, getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { Container } from '@/components/layout/container';
import { StatusBadge } from '@/components/ui/status-badge';
import { OrderTimeline } from '@/components/orders/order-timeline';
import { requireSession } from '@/lib/auth-guard';
import { isUuid } from '@/lib/ids';
import { formatBaht } from '@/lib/format';
import { buildTimeline } from '@/lib/orders/timeline';
import { isQuoteExpired } from '@/domain/order/quote-policy';
import { getOrderForUser } from '@/services/order.service';

type Props = { params: Promise<{ locale: string; orderId: string }> };

export default async function OrderDetailPage({ params }: Props) {
    const { locale, orderId } = await params;
    const session = await requireSession(locale, `/orders/${orderId}`);
    if (!isUuid(orderId)) notFound();

    const order = await getOrderForUser(session.user.id, orderId);
    if (!order) notFound(); // missing and "not yours" look identical

    const [t, tStatus, tStep, tQuote, tDuration, format] = await Promise.all([
        getTranslations('orderDetail'),
        getTranslations('orderStatus'),
        getTranslations('orderTimeline'),
        getTranslations('quoteStatus'),
        getTranslations('serviceForm.durationOptions'),
        getFormatter(),
    ]);

    const party = order.viewerParty;
    const now = new Date();
    const when = (d: Date) => format.dateTime(d, { dateStyle: 'medium', timeStyle: 'short' });
    // Quotes come newest first; the live one is 'sent' (or 'accepted' once agreed)
    const current = order.quotes.find((q) => q.status === 'sent' || q.status === 'accepted') ?? null;
    const quoteLabel = (q: (typeof order.quotes)[number]) =>
        tQuote(q.status === 'sent' && isQuoteExpired(q.expiresAt, now) ? 'expired' : q.status);

    const steps = buildTimeline(order.status, order.events).map((s) => ({
        key: s.key, state: s.state, label: tStep(s.key), timestamp: s.at ? when(s.at) : undefined,
    }));

    return (
        <Container size="lg" gutter="lg">
            <Link href="/orders" className="mb-4 inline-block text-sm text-muted-foreground hover:text-foreground">
                ← {t('back')}
            </Link>

            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h1 className="text-xl font-bold text-foreground text-balance">{order.service.title}</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {party === 'customer'
                            ? `${t('technician')} ${order.technician.displayName}`
                            : `${t('customer')} ${order.customer.name}`}
                        {' · '}{t('opened')} {when(order.createdAt)}
                    </p>
                </div>
                <StatusBadge status={order.status} label={tStatus(`${party}.${order.status}`)} />
            </div>

            <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
                <div className="space-y-8">
                    <section>
                        <h2 className="mb-4 text-sm font-semibold text-foreground">{t('jobStatus')}</h2>
                        <OrderTimeline steps={steps} pendingLabel={tStep('pending')} />
                    </section>

                    <section>
                        <h2 className="mb-2 text-sm font-semibold text-foreground">{t('problem')}</h2>
                        {/* Plain text: React escapes it, whitespace-pre-line keeps the customer's line breaks */}
                        <p className="whitespace-pre-line rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">
                            {order.problemDescription}
                        </p>
                    </section>

                    {order.quotes.length > 0 && (
                        <section>
                            <h2 className="mb-3 text-sm font-semibold text-foreground">{t('quoteHistory')}</h2>
                            <ul className="divide-y divide-hairline rounded-xl border border-border bg-card px-4">
                                {order.quotes.map((q) => (
                                    <li key={q.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                                        <span className="font-medium text-foreground">v{q.version} · {formatBaht(q.amount)}</span>
                                        <span className="text-muted-foreground">{quoteLabel(q)}</span>
                                        <span className="text-xs text-muted-foreground">{when(q.createdAt)}</span>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}
                </div>

                <aside className="rounded-xl border border-border bg-card p-5">
                    {current ? (
                        <>
                            <div className="flex items-center justify-between">
                                <p className="text-xs font-medium text-muted-foreground">{t('currentQuote', { version: current.version })}</p>
                                <span className="text-xs text-muted-foreground">{quoteLabel(current)}</span>
                            </div>
                            <p className="mt-2 text-2xl font-bold text-foreground">{formatBaht(current.amount)}</p>
                            <dl className="mt-4 space-y-2 border-t border-hairline pt-4 text-sm">
                                <Row label={t('duration')} value={current.duration ? tDuration(current.duration) : '—'} />
                                <Row label={t('revisions')} value={current.revisionsIncluded === null ? '—' : t('revisionsValue', { count: current.revisionsIncluded })} />
                                {current.expiresAt && <Row label={t('validUntilLabel')} value={when(current.expiresAt)} />}
                            </dl>
                            {current.note && (
                                <p className="mt-4 whitespace-pre-line rounded-lg bg-muted p-3 text-xs text-muted-foreground">{current.note}</p>
                            )}
                        </>
                    ) : order.status === 'pending_quote' ? (
                        <p className="text-sm text-muted-foreground">
                            {party === 'customer' ? t('waitingForQuote') : t('sendQuoteHint')}
                        </p>
                    ) : null}
                    {/* 5b: <OrderActions …/> — accept / cancel / quote form, driven by canPerform() */}
                    {party === 'customer' && <p className="mt-4 text-center text-xs text-muted-foreground">🔒 {t('escrowNote')}</p>}
                </aside>
            </div>
        </Container>
    );
}

function Row({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-center justify-between gap-4">
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="text-right font-medium text-foreground">{value}</dd>
        </div>
    );
}