import { Badge } from '@/components/ui/badge';
import type { OrderStatus } from '@/domain/order/state-machine';
import { cn } from '@/lib/utils';


const TONE: Record<OrderStatus, string> = {
    pending_quote: 'bg-accent-soft text-primary',
    quoted: 'bg-star/15 text-star',
    accepted: 'bg-star/15 text-star',
    paid: 'bg-accent-soft text-primary',
    in_progress: 'bg-accent-soft text-primary',
    completed: 'bg-star/15 text-star',
    released: 'bg-primary/10 text-primary',
    cancelled: 'bg-muted text-muted-foreground',
    refunded: 'bg-muted text-muted-foreground',
    disputed: 'bg-destructive/10 text-destructive',
};

export function StatusBadge({ status, label, className }: { status: OrderStatus; label: string; className?: string }) {
    return (
        <Badge variant="outline" className={cn('h-auto border-transparent px-2.5 py-1 text-[0.7rem] font-medium', TONE[status], className)}>
            {label}
        </Badge>
    );
}
