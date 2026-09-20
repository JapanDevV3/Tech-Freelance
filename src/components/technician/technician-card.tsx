import { Link } from '@/i18n/navigation';
import { HugeiconsIcon } from '@hugeicons/react';
import { FavouriteIcon } from '@hugeicons/core-free-icons';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { RatingStars } from '@/components/ui/rating-stars';
import type { MockTechnician } from '@/lib/mock/marketplace';

// Saved-technician row used on the favorites page. Kept separate from
// ServiceCard/OrderRow since it links to a technician, not a service or order.
type TechnicianCardProps = {
    technician: MockTechnician;
    labels: { reviews: string; viewProfile: string };
};

export function TechnicianCard({ technician, labels }: TechnicianCardProps) {
    return (
        <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-4">
            <Avatar size="lg">
                <AvatarFallback>{technician.displayName.slice(0, 2)}</AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-foreground">{technician.displayName}</p>
                    <Badge variant="outline">{technician.categoryLabel}</Badge>
                </div>
                <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <RatingStars value={technician.rating} />
                    <span>{technician.rating} ({technician.reviewCount} {labels.reviews})</span>
                </div>
                <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">{technician.bio}</p>
            </div>

            <div className="flex shrink-0 items-center gap-2">
                <Button variant="ghost" size="icon" aria-label="favorite">
                    <HugeiconsIcon icon={FavouriteIcon} className="text-destructive" />
                </Button>
                <Link href={`/technicians/${technician.slug}`} className={buttonVariants({ size: 'sm' })}>
                    {labels.viewProfile}
                </Link>
            </div>
        </div>
    );
}
