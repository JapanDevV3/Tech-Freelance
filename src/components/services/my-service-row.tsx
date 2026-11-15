import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { buttonVariants } from '@/components/ui/button';
import { formatBaht } from '@/lib/format';
import { DeleteServiceButton } from './delete-service-button';
import { ServiceStatusBadge } from './service-status-badge';
import type { serviceStatus } from '@/db/schema';

type Props = { service: { id: string; title: string; status: (typeof serviceStatus.enumValues)[number]; basePriceAmount: number; coverUrl: string | null } };

// Not a single <a>: the row holds its own buttons, and interactive content can't nest inside a link
export function MyServiceRow({ service }: Props) {
    const t = useTranslations('dashboard.technician');
    return (
        <div className="flex items-center gap-4 border-b border-hairline px-1 py-4 last:border-b-0">
            <div className="relative aspect-video w-24 shrink-0 overflow-hidden rounded-lg bg-sunken">
                {service.coverUrl && <Image src={service.coverUrl} alt={service.title} fill sizes="64px" quality={85} className="object-cover" />}
            </div>
            <div className="min-w-0 flex-1">
                <Link href={`/services/${service.id}`} className="block truncate text-body font-semibold text-foreground hover:underline">
                    {service.title}
                </Link>
                <div className="mt-1 flex items-center gap-2 text-small text-muted-foreground">
                    <ServiceStatusBadge status={service.status} />
                    <span>{formatBaht(service.basePriceAmount)}</span>
                </div>
            </div>
            <Link href={`/technician/services/${service.id}/edit`} className={buttonVariants({ variant: 'outline', size: 'sm' })}>
                {t('edit')}
            </Link>
            <DeleteServiceButton serviceId={service.id} serviceTitle={service.title} />
        </div>
    );
}
