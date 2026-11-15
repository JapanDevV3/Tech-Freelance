import { Link } from '@/i18n/navigation';
import { formatBaht } from '@/lib/format';
import { StatusBadge } from '@/components/ui/status-badge';
import Image from 'next/image';
import type { OrderStatus } from '@/domain/order/state-machine';
import { RowPrice } from '@/lib/orders/row-price';

// One order/job row — reused by the orders list, and by the technician/customer
// dashboards for "recent orders" / "my listed jobs" strips.
type OrderRowProps = {
    href: string;
    title: string;
    subtitle: string;
    price: RowPrice;
    awaitingLabel?: string;
    status?: OrderStatus;
    statusLabel?: string;
    coverUrl?: string | null;
};

export function OrderRow({ href, title, subtitle, price, awaitingLabel, status, statusLabel, coverUrl }: OrderRowProps) {
    return (
        <Link
            href={href}
            className="flex items-center gap-4 border-b border-hairline px-1 py-4 transition-colors last:border-b-0 hover:bg-accent/40"
        >
            <div className="relative aspect-video w-24 shrink-0 overflow-hidden rounded-lg bg-sunken">
                {coverUrl && (
                    <Image
                        src={coverUrl}
                        alt={title}
                        fill
                        sizes="64px"
                        quality={85}
                        className="object-cover"
                    />
                )}
            </div>
            <div className="min-w-0 flex-1">
                <p className="truncate text-body font-semibold text-foreground">{title}</p>
                <p className="truncate text-small text-muted-foreground">{subtitle}</p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1.5">
                {status && statusLabel && <StatusBadge status={status} label={statusLabel} />}
                {price?.kind === 'amount' && <span className="text-body font-bold text-foreground">{formatBaht(price.amount)}</span>}
                {price?.kind === 'awaiting' && <span className="text-small text-muted-foreground">{awaitingLabel}</span>}
            </div>
        </Link>
    );
}
