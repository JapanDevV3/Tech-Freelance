import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// Order lifecycle status → visual tone. Centralized here so every place that
// renders an order status (list rows, detail headers, dashboard) stays in sync.
export type OrderStatus =
    | 'awaiting_response'
    | 'quoted'
    | 'awaiting_payment'
    | 'in_progress'
    | 'completed';

const TONE: Record<OrderStatus, string> = {
    awaiting_response: 'bg-accent-soft text-primary',
    quoted: 'bg-accent-soft text-primary',
    awaiting_payment: 'bg-star/15 text-star',
    in_progress: 'bg-accent-soft text-primary',
    completed: 'bg-primary/10 text-primary',
};

export function StatusBadge({ status, label, className }: { status: OrderStatus; label: string; className?: string }) {
    return (
        <Badge variant="outline" className={cn('h-auto border-transparent px-2.5 py-1 text-[0.7rem] font-medium', TONE[status], className)}>
            {label}
        </Badge>
    );
}
