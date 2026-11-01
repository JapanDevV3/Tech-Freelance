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
import { getOrderForUser } from '@/services/order.service';
import { isQuoteExpired, revisionsLeft } from '@/domain/order/quote-policy';
import { canPerform } from '@/domain/order/state-machine';
import { QuoteForm } from '@/components/orders/quote-form';
import { AcceptQuoteButton } from '@/components/orders/accept-quote-button';
import { CancelOrderButton } from '@/components/orders/cancel-order-button';

type Props = { params: Promise<{ locale: string; orderId: string }> };

export default async function OrderDetailPage({ params }: Props) {
    const { locale, orderId } = await params;
    const session = await requireSession(locale, `/orders/${orderId}`);
    if (!isUuid(orderId)) notFound();

    const order = await getOrderForUser(session.user.id, orderId);
    if (!order) notFound(); // missing and "not yours" look identical

    const [t, tStatus, tStep, tQuote, tDuration, format, tQuoteForm] = await Promise.all([
        getTranslations('orderDetail'),
        getTranslations('orderStatus'),
        getTranslations('orderTimeline'),
        getTranslations('quoteStatus'),
        getTranslations('serviceForm.durationOptions'),
        getFormatter(),
        getTranslations('quoteForm'),
    ]);

    const party = order.viewerParty;
    const now = new Date();
    const when = (d: Date) => format.dateTime(d, { dateStyle: 'medium', timeStyle: 'short' });
    // Quotes come newest first; the live one is 'sent' (or 'accepted' once agreed)
    const current = order.quotes.find((q) => q.status === 'sent' || q.status === 'accepted') ?? null;
    const quoteLabel = (q: (typeof order.quotes)[number]) =>
        tQuote(q.status === 'sent' && isQuoteExpired(q.expiresAt, now) ? 'expired' : q.status);

    const latestVersion = order.quotes.at(0)?.version ?? 0; // quotes are newest first
    // Decided on the server from the SAME rule table the API asserts; client components only get the answers
    const can = {
        quote: canPerform('sendQuote', party, order.status),
        accept: canPerform('accept', party, order.status) && current?.status === 'sent' && !isQuoteExpired(current.expiresAt, now),
        cancel: canPerform('cancel', party, order.status)
    }

    const steps = buildTimeline(order.status, order.events).map((s) => ({
        key: s.key, state: s.state, label: tStep(s.key), timestamp: s.at ? when(s.at) : undefined,
    }));

    return (
        <Container size="lg" gutter="lg">
            <Link href="/orders" className="mb-4 inline-block text-body text-muted-foreground hover:text-foreground">
                ← {t('back')}
            </Link>

            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h1 className="text-h1 font-bold text-foreground text-balance">{order.service.title}</h1>
                    <p className="mt-1 text-body text-muted-foreground">
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
                    {can.quote && (
                        <section className='rounded-xl border border-border bg-card p-5'>
                            <h2 className='mb-4 text-body font-semibold text-foreground'>{tQuoteForm('quoteFormTitle')}</h2>
                            <QuoteForm
                                key={latestVersion} // a new version after refresh → remount with that version's defaults
                                orderId={order.id}
                                nextVersion={latestVersion + 1}
                                revisionsLeft={revisionsLeft(latestVersion)}
                                // Pre-fill a revision from the live quote; the note is left blank on purpose:
                                // each version's note should say what changed in THIS version
                                defaults={current ? {
                                    amountBaht: current.amount / 100,
                                    duration: current.duration ?? undefined,
                                    revisionsIncluded: current.revisionsIncluded ?? undefined,
                                } : undefined}
                            />
                        </section>
                    )}
                    <section>
                        <h2 className="mb-4 text-body font-semibold text-foreground">{t('jobStatus')}</h2>
                        <OrderTimeline steps={steps} pendingLabel={tStep('pending')} />
                    </section>

                    <section>
                        <h2 className="mb-2 text-body font-semibold text-foreground">{t('problem')}</h2>
                        {/* Plain text: React escapes it, whitespace-pre-line keeps the customer's line breaks */}
                        <p className="whitespace-pre-line rounded-lg border border-border bg-card p-4 text-body text-muted-foreground">
                            {order.problemDescription}
                        </p>
                    </section>

                    {order.quotes.length > 0 && (
                        <section>
                            <h2 className="mb-3 text-body font-semibold text-foreground">{t('quoteHistory')}</h2>
                            <ul className="divide-y divide-hairline rounded-xl border border-border bg-card px-4">
                                {order.quotes.map((q) => (
                                    <li key={q.id} className="flex items-center justify-between gap-3 py-3 text-body">
                                        <span className="font-medium text-foreground">v{q.version} · {formatBaht(q.amount)}</span>
                                        <span className="text-muted-foreground">{quoteLabel(q)}</span>
                                        <span className="text-small text-muted-foreground">{when(q.createdAt)}</span>
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
                                <p className="text-small font-medium text-muted-foreground">{t('currentQuote', { version: current.version })}</p>
                                <span className="text-small text-muted-foreground">{quoteLabel(current)}</span>
                            </div>
                            <p className="mt-2 text-price-lg font-bold text-foreground">{formatBaht(current.amount)}</p>
                            <dl className="mt-4 space-y-2 border-t border-hairline pt-4 text-body">
                                <Row label={t('duration')} value={current.duration ? tDuration(current.duration) : '—'} />
                                <Row label={t('revisions')} value={current.revisionsIncluded === null ? '—' : t('revisionsValue', { count: current.revisionsIncluded })} />
                                {current.expiresAt && <Row label={t('validUntilLabel')} value={when(current.expiresAt)} />}
                            </dl>
                            {current.note && (
                                <p className="mt-4 whitespace-pre-line rounded-lg bg-muted p-3 text-small text-muted-foreground">{current.note}</p>
                            )}
                        </>
                    ) : order.status === 'pending_quote' ? (
                        <p className="text-body text-muted-foreground">
                            {party === 'customer' ? t('waitingForQuote') : t('sendQuoteHint')}
                        </p>
                    ) : null}
                    {can.accept && current && (
                        <AcceptQuoteButton
                            orderId={order.id}
                            quoteId={current.id}
                            version={current.version}
                            amountLabel={formatBaht(current.amount)} // formatted on the server, same as the card above
                        />
                    )}
                    {can.cancel && <CancelOrderButton orderId={order.id} />}
                    {party === 'customer' && <p className="mt-4 text-center text-small text-muted-foreground">🔒 {t('escrowNote')}</p>}
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