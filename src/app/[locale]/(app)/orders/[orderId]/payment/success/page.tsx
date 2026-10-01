import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { buttonVariants } from '@/components/ui/button';
import { Container } from '@/components/layout/container';
import { formatBaht } from '@/lib/format';
import { findOrder } from '@/lib/mock/marketplace';

export default async function PaymentSuccessPage({
    params,
}: {
    params: Promise<{ orderId: string }>;
}) {
    const { orderId } = await params;
    const order = findOrder(orderId);
    if (!order) notFound();

    const t = await getTranslations('paymentSuccess');
    const latest = order.quotes[order.quotes.length - 1];
    const paidAt = new Date().toLocaleString('th-TH', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

    return (
        <Container size="sm" gutter="lg">
            <div className="flex flex-col items-center text-center">
                <span className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-3xl text-primary">✓</span>
                <h1 className="mt-4 text-2xl font-bold text-foreground">{t('title')}</h1>
                <p className="mt-1 text-sm text-muted-foreground">{t('subtitle')}</p>

                <ol className="mt-6 flex w-full items-center justify-center gap-6 text-xs">
                    <StepDot n={1} label={t('step1')} active />
                    <StepDot n={2} label={t('step2')} />
                    <StepDot n={3} label={t('step3')} />
                </ol>
            </div>

            <div className="mt-8 rounded-xl border border-border bg-card p-5">
                <div className="flex items-center gap-3">
                    <div className="size-12 shrink-0 rounded-lg bg-sunken" />
                    <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-foreground">{order.serviceTitle}</p>
                        <p className="truncate text-xs text-muted-foreground">{t('technician')} {order.technicianName}</p>
                    </div>
                </div>

                <dl className="mt-4 space-y-2 border-t border-hairline pt-4 text-sm">
                    <Row label={t('paymentId')} value={`#PAY-${order.id.slice(-5)}`} />
                    <Row label={t('method')} value="Visa •••• 4242" />
                    <Row label={t('date')} value={paidAt} />
                </dl>
                <div className="mt-3 flex items-center justify-between border-t border-hairline pt-3">
                    <dt className="font-semibold text-foreground">{t('amountPaid')}</dt>
                    <dd className="text-lg font-bold text-foreground">{formatBaht(latest.priceBaht * 100)}</dd>
                </div>
            </div>

            <p className="mt-4 rounded-lg bg-accent-soft p-3 text-center text-xs text-primary">
                🔒 {t('escrowNote', { amount: formatBaht(latest.priceBaht * 100), technician: order.technicianName })}
            </p>

            <div className="mt-6 flex flex-col gap-2 sm:flex-row">
                <Link href={`/orders/${order.id}`} className={buttonVariants({ className: 'flex-1' })}>{t('viewOrder')}</Link>
                <Link href="/dashboard" className={buttonVariants({ variant: 'outline', className: 'flex-1' })}>{t('backHome')}</Link>
            </div>
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

function StepDot({ n, label, active }: { n: number; label: string; active?: boolean }) {
    return (
        <li className="flex flex-col items-center gap-1">
            <span
                className={
                    active
                        ? 'flex size-7 items-center justify-center rounded-full bg-primary text-primary-foreground'
                        : 'flex size-7 items-center justify-center rounded-full bg-muted text-muted-foreground'
                }
            >
                {active ? '✓' : n}
            </span>
            <span className={active ? 'font-medium text-foreground' : 'text-muted-foreground'}>{label}</span>
        </li>
    );
}
