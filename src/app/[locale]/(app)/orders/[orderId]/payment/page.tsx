import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { Container } from '@/components/layout/container';
import { PaymentForm } from '@/components/orders/payment-form';
import { formatBaht } from '@/lib/format';
import { findOrder } from '@/lib/mock/marketplace';

export default async function OrderPaymentPage({
    params,
}: {
    params: Promise<{ orderId: string }>;
}) {
    const { orderId } = await params;
    const order = findOrder(orderId);
    if (!order) notFound();

    const t = await getTranslations('payment');
    const latest = order.quotes[order.quotes.length - 1];

    return (
        <Container size="lg" gutter="lg">
            <Link href={`/orders/${order.id}`} className="mb-4 inline-block text-sm text-muted-foreground hover:text-foreground">
                ← {t('back')}
            </Link>
            <h1 className="text-2xl font-bold text-foreground">{t('title')}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{t('subtitle')}</p>

            <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
                <div className="rounded-xl border border-border bg-card p-6">
                    <PaymentForm orderId={order.id} amountBaht={latest.priceBaht} />
                </div>

                <aside className="rounded-xl border border-border bg-card p-5">
                    <div className="flex items-center gap-3">
                        <div className="size-12 shrink-0 rounded-lg bg-sunken" />
                        <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-foreground">{order.serviceTitle}</p>
                            <p className="truncate text-xs text-muted-foreground">{t('technician')} {order.technicianName}</p>
                        </div>
                    </div>

                    <dl className="mt-4 space-y-2 border-t border-hairline pt-4 text-sm">
                        <div className="flex items-center justify-between">
                            <dt className="text-muted-foreground">{t('serviceFee')}</dt>
                            <dd className="font-medium text-foreground">{formatBaht(latest.priceBaht * 100)}</dd>
                        </div>
                        <div className="flex items-center justify-between">
                            <dt className="text-muted-foreground">{t('transactionFee')}</dt>
                            <dd className="font-medium text-foreground">{formatBaht(0)}</dd>
                        </div>
                    </dl>
                    <div className="mt-3 flex items-center justify-between border-t border-hairline pt-3">
                        <dt className="font-semibold text-foreground">{t('total')}</dt>
                        <dd className="text-lg font-bold text-foreground">{formatBaht(latest.priceBaht * 100)}</dd>
                    </div>
                    <p className="mt-3 text-xs text-muted-foreground">🔒 {t('escrowNote')}</p>
                    <p className="mt-4 text-center text-[0.7rem] text-muted-foreground">{t('poweredBy')}</p>
                </aside>
            </div>
        </Container>
    );
}
