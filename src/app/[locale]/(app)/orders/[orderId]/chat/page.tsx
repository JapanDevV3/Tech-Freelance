import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { Container } from '@/components/layout/container';
import { ChatComposer } from '@/components/chat/chat-composer';
import { formatBaht } from '@/lib/format';
import { findOrder, findChat } from '@/lib/mock/marketplace';

export default async function OrderChatPage({
    params,
}: {
    params: Promise<{ orderId: string }>;
}) {
    const { orderId } = await params;
    const order = findOrder(orderId);
    if (!order) notFound();

    const t = await getTranslations('chat');

    return (
        <Container size="md" gutter="lg">
            <Link href={`/orders/${order.id}`} className="mb-4 inline-block text-sm text-muted-foreground hover:text-foreground">
                ← {t('back')}
            </Link>

            <div className="overflow-hidden rounded-xl border border-border bg-card">
                <div className="flex items-center justify-between border-b border-border p-4">
                    <div>
                        <p className="text-sm font-semibold text-foreground">{order.technicianName}</p>
                        <p className="text-xs text-muted-foreground">#{order.id} · {order.serviceTitle}</p>
                    </div>
                    <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-medium text-primary">
                        🔒 Escrow {formatBaht(order.priceBaht * 100)}
                    </span>
                </div>

                <ChatComposer initialMessages={findChat(order.id)} />
            </div>
        </Container>
    );
}
