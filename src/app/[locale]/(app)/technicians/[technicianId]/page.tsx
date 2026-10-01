import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RatingStars } from '@/components/ui/rating-stars';
import { StatCard } from '@/components/ui/stat-card';
import { Container } from '@/components/layout/container';
import { formatBaht } from '@/lib/format';
import { findTechnician } from '@/lib/mock/marketplace';

export default async function TechnicianProfilePage({
    params,
}: {
    params: Promise<{ technicianId: string }>;
}) {
    const { technicianId } = await params;
    const t = await getTranslations('technicianProfile');
    const technician = findTechnician(technicianId);

    return (
        <Container size="xl" gutter="lg">
            <Link href="/services" className="mb-4 inline-block text-sm text-muted-foreground hover:text-foreground">
                ← {t('back')}
            </Link>

            {/* ---- Header card ---- */}
            <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-4">
                    <Avatar size="lg" className="size-14">
                        <AvatarFallback>{technician.displayName.slice(0, 2)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <div className="flex flex-wrap items-center gap-2">
                            <h1 className="text-xl font-bold text-foreground">{technician.displayName}</h1>
                            {technician.verified && (
                                <Badge className="bg-primary/10 text-primary">✓ {t('verified')}</Badge>
                            )}
                        </div>
                        <div className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                            <RatingStars value={technician.rating} />
                            <span>{technician.rating} ({technician.reviewCount} {t('reviews')})</span>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                            📍 {technician.location} · {t('memberSince', { year: technician.memberSince })}
                        </p>
                        <p className="mt-3 max-w-xl text-sm text-muted-foreground">{technician.bio}</p>
                    </div>
                </div>
                <Button className="shrink-0">{t('contact')}</Button>
            </div>

            {/* ---- Stats ---- */}
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <StatCard label={t('jobsCompleted')} value={String(technician.jobsCompleted)} />
                <StatCard label={t('avgRating')} value={String(technician.rating)} />
                <StatCard label={t('avgResponse')} value={technician.avgResponseTime} />
            </div>

            {/* ---- Services ---- */}
            {technician.services.length > 0 && (
                <section className="mt-10">
                    <h2 className="text-lg font-semibold text-foreground">{t('servicesTitle')}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {t('servicesSub', { count: technician.services.length })}
                    </p>
                    <div className="mt-4 grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-4">
                        {technician.services.map((service) => (
                            <div key={service.id} className="rounded-xl border border-border bg-card">
                                <div className="aspect-video w-full bg-sunken" />
                                <div className="space-y-1 p-4">
                                    <p className="line-clamp-2 text-sm font-semibold text-foreground">{service.title}</p>
                                    <p className="line-clamp-1 text-xs text-muted-foreground">{service.subtitle}</p>
                                    <div className="flex items-baseline justify-between border-t border-hairline pt-3">
                                        <span className="text-xs text-muted-foreground">{t('priceFrom')}</span>
                                        <span className="text-base font-bold text-foreground">{formatBaht(service.priceBaht * 100)}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* ---- Reviews ---- */}
            <section className="mt-10">
                <h2 className="text-lg font-semibold text-foreground">{t('reviewsTitle')}</h2>
                {technician.reviews.length === 0 ? (
                    <p className="mt-2 text-sm text-muted-foreground">{t('noReviews')}</p>
                ) : (
                    <div className="mt-3 space-y-4">
                        {technician.reviews.map((review) => (
                            <div key={review.id} className="border-b border-hairline pb-4 last:border-b-0">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-semibold text-foreground">{review.author}</p>
                                    <p className="text-xs text-muted-foreground">{review.timeAgo}</p>
                                </div>
                                <RatingStars value={review.rating} className="mt-1" />
                                <p className="mt-1.5 text-sm text-muted-foreground">{review.comment}</p>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </Container>
    );
}
