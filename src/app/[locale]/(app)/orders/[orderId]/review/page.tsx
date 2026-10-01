import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { Container } from '@/components/layout/container';
import { ReviewForm } from '@/components/orders/review-form';
import { formatBaht } from '@/lib/format';
import { findOrder } from '@/lib/mock/marketplace';

export default async function OrderReviewPage({
    params,
}: {
    params: Promise<{ orderId: string }>;
}) {
    const { orderId } = await params;
    const order = findOrder(orderId);
    if (!order) notFound();

    const t = await getTranslations('review');

    return (
        <Container size="sm" gutter="lg">
            <Link href={`/orders/${order.id}`} className="mb-4 inline-block text-sm text-muted-foreground hover:text-foreground">
                ← {t('back')}
            </Link>
            <h1 className="text-2xl font-bold text-foreground">{t('title')}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{t('subtitle')}</p>

            <div className="mt-6 rounded-xl border border-border bg-card p-6">
                <div className="mb-5 flex items-center gap-3 rounded-lg bg-muted p-3">
                    <div className="size-10 shrink-0 rounded-lg bg-sunken" />
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-foreground">{order.serviceTitle}</p>
                        <p className="truncate text-xs text-muted-foreground">{t('technician')} {order.technicianName} · #{order.id}</p>
                    </div>
                    <span className="shrink-0 text-sm font-bold text-foreground">{formatBaht(order.priceBaht * 100)}</span>
                </div>

                <ReviewForm />
            </div>
        </Container>
    );
}
