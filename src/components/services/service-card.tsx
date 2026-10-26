import { Link } from '@/i18n/navigation';
import { formatBaht } from '@/lib/format';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';

type ServiceCardProps = {
    /** Omit to render a static card, e.g. a preview of a service that isn't public */
    href?: string;
    title: string;
    description: string;
    basePriceAmount: number; // stored in satang; formatted inside this component
    technicianName: string;
    labels: { priceFrom: string; by: string };
    coverUrl?: string | null;
};

export function ServiceCard({
    href,
    title,
    description,
    basePriceAmount,
    technicianName,
    labels,
    coverUrl,
}: ServiceCardProps) {
    const card = (
        <Card className={href ? 'h-full transition-colors group-hover:border-primary' : 'h-full'}>
            <div className="relative aspect-video w-full overflow-hidden bg-sunken">
                {coverUrl && (
                    <Image
                        src={coverUrl}
                        alt="" // decorative: the title right below already describes the card
                        fill
                        sizes="(min-width: 1024px) 320px, (min-width: 640px) 50vw, 100vw"
                        className="object-cover"
                    />
                )}
            </div>
            <CardHeader>
                <CardTitle>
                    <span className="line-clamp-2 text-h3 font-semibold">{title}</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                <p className="line-clamp-2 text-body text-muted-foreground">{description}</p>
                <p className="text-small text-muted-foreground">{labels.by} {technicianName}</p>
                <div className="flex items-baseline justify-between border-t border-hairline pt-3">
                    <span className="text-small text-muted-foreground">{labels.priceFrom}</span>
                    <span className="text-price font-bold text-foreground">{formatBaht(basePriceAmount)}</span>
                </div>
            </CardContent>
        </Card>
    );
    // Whole card is a single link target; `group` lets children react to hover.
    return href ? <Link href={href} className="group block">{card}</Link> : card;
}