import { Link } from '@/i18n/navigation';
import { formatBaht } from '@/lib/format';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type ServiceCardProps = {
    href: string;
    title: string;
    description: string;
    basePriceAmount: number; // stored in satang; formatted inside this component
    technicianName: string;
    labels: { priceFrom: string; by: string };
};

export function ServiceCard({
    href,
    title,
    description,
    basePriceAmount,
    technicianName,
    labels,
}: ServiceCardProps) {
    return (
        // Whole card is a single link target; `group` lets children react to hover.
        <Link href={href} className="group block">
            <Card className="h-full transition-colors group-hover:border-primary">
                <div className="aspect-video w-full bg-sunken" />
                <CardHeader>
                    <CardTitle>
                        <span className="line-clamp-2 text-base font-semibold">{title}</span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <p className="line-clamp-2 text-sm text-muted-foreground">{description}</p>
                    <p className="text-xs text-muted-foreground">{labels.by} {technicianName}</p>
                    <div className="flex items-baseline justify-between border-t border-hairline pt-3">
                        <span className="text-xs text-muted-foreground">{labels.priceFrom}</span>
                        <span className="text-lg font-bold text-foreground">{formatBaht(basePriceAmount)}</span>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}