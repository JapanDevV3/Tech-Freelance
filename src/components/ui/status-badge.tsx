import { Badge } from '@/components/ui/badge';
import type { OrderStatus } from '@/domain/order/state-machine';
import { cn } from '@/lib/utils';


// Design system: warning = waiting on someone, primary = an offer / work in
// progress, success = money held or job done. `star` is reserved for ratings.
const TONE: Record<OrderStatus, string> = {
    pending_quote: 'bg-warning-soft text-warning',
    quoted: 'bg-accent-soft text-primary',
    accepted: 'bg-warning-soft text-warning',
    paid: 'bg-success-soft text-success',
    in_progress: 'bg-accent-soft text-primary',
    completed: 'bg-success-soft text-success',
    released: 'bg-success-soft text-success',
    cancelled: 'bg-muted text-muted-foreground',
    refunded: 'bg-muted text-muted-foreground',
    disputed: 'bg-destructive/10 text-destructive',
};

export function StatusBadge({ status, label, className }: { status: OrderStatus; label: string; className?: string }) {
    return (
        // `secondary` has no dark: background, so the tone's bg wins in both themes
        // (`outline` carried dark:bg-input/30, which overrode the tone in dark mode)
        <Badge variant="secondary" className={cn('h-auto border-transparent px-2.5 py-1 text-[0.7rem] font-medium', TONE[status], className)}>
            {label}
        </Badge>
    );
}
