import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { serviceStatus } from '@/db/schema';

type ServiceStatus = (typeof serviceStatus.enumValues)[number];

// Same tone rules as order StatusBadge: success = live, warning = paused (waiting
// on the technician), muted = not visible to customers.
const TONE: Record<ServiceStatus, string> = {
    active: 'bg-success-soft text-success',
    paused: 'bg-warning-soft text-warning',
    draft: 'bg-muted text-muted-foreground',
    archived: 'bg-muted text-muted-foreground',
};

export function ServiceStatusBadge({ status, className }: { status: ServiceStatus; className?: string }) {
    const t = useTranslations('serviceStatus');
    return (
        <Badge variant="secondary" className={cn('h-auto border-transparent px-2.5 py-1 text-[0.7rem] font-medium', TONE[status], className)}>
            {t(status)}
        </Badge>
    );
}
