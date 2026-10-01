import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { getServiceById, listActiveServices } from '@/services/catalog.service';
import { Container } from '@/components/layout/container';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RatingStars } from '@/components/ui/rating-stars';
import { ServiceCard } from '@/components/services/service-card';
import { formatBaht } from '@/lib/format';
import { findTechnician } from '@/lib/mock/marketplace';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function ServiceDetailPage({
    params,
}: {
    params: Promise<{ serviceId: string }>;
}) {
    const { serviceId } = await params;
    if (!UUID_RE.test(serviceId)) notFound();

    const [t, service] = await Promise.all([
        getTranslations('serviceDetail'),
        getServiceById(serviceId),
    ]);
    if (!service) notFound();

    // Reviews aren't wired to a backend yet — layer the same curated reviews the
    // technician profile page uses so the two pages feel consistent.
    const technicianRef = findTechnician(service.technician.displayName);
    const similar = (await listActiveServices({ category: service.category }))
        .filter((s) => s.id !== service.id)
        .slice(0, 3);

    return (
        <Container size="xl" gutter="lg">
            <Link href="/services" className="mb-4 inline-block text-sm text-muted-foreground hover:text-foreground">
                ← {t('backToList')}
            </Link>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
                {/* ---- Main column ---- */}
                <div>
                    <div className="aspect-video w-full rounded-xl bg-sunken" />

                    <Badge variant="outline" className="mt-6">{t(`category.${service.category}`)}</Badge>
                    <h1 className="mt-2 text-2xl font-bold text-foreground text-balance">{service.title}</h1>

                    <Link
                        href={`/technicians/${encodeURIComponent(service.technician.displayName)}`}
                        className="mt-4 flex items-center gap-3 rounded-xl border border-border p-3 transition-colors hover:border-primary"
                    >
                        <div className="size-10 shrink-0 rounded-full bg-muted" />
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-foreground">{service.technician.displayName}</p>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <RatingStars value={technicianRef.rating} />
                                <span>{technicianRef.rating} ({technicianRef.reviewCount} {t('reviews')})</span>
                            </div>
                        </div>
                        <span className="shrink-0 text-xs font-medium text-primary">{t('viewProfile')}</span>
                    </Link>

                    <section className="mt-8">
                        <h2 className="text-lg font-semibold text-foreground">{t('details')}</h2>
                        <p className="mt-2 whitespace-pre-line text-sm text-muted-foreground">{service.description}</p>
                    </section>

                    {technicianRef.reviews.length > 0 && (
                        <section className="mt-8">
                            <h2 className="text-lg font-semibold text-foreground">{t('reviews')}</h2>
                            <div className="mt-3 space-y-4">
                                {technicianRef.reviews.map((review) => (
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
                        </section>
                    )}
                </div>

                {/* ---- Sticky price card ---- */}
                <aside className="rounded-xl border border-border bg-card p-5 lg:sticky lg:top-20">
                    <p className="text-xs text-muted-foreground">{t('priceFrom')}</p>
                    <p className="mt-1 text-3xl font-bold text-foreground">{formatBaht(service.basePriceAmount)}</p>

                    <dl className="mt-4 space-y-2 border-t border-hairline pt-4 text-sm">
                        <div className="flex items-center justify-between">
                            <dt className="text-muted-foreground">{t('modeLabel')}</dt>
                            <dd className="font-medium text-foreground">{t(`mode.${service.mode}`)}</dd>
                        </div>
                    </dl>

                    <Button className="mt-5 w-full">{t('hireButton')}</Button>
                    <Button variant="outline" className="mt-2 w-full">{t('askFirst')}</Button>
                    <p className="mt-3 text-center text-xs text-muted-foreground">🔒 {t('escrowNote')}</p>
                </aside>
            </div>

            {similar.length > 0 && (
                <section className="mt-14">
                    <h2 className="mb-4 text-lg font-semibold text-foreground">{t('similarServices')}</h2>
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-4">
                        {similar.map((s) => (
                            <ServiceCard
                                key={s.id}
                                href={`/services/${s.id}`}
                                title={s.title}
                                description={s.description}
                                basePriceAmount={s.basePriceAmount}
                                technicianName={s.technician.displayName}
                                labels={{ priceFrom: t('priceFrom'), by: t('by') }}
                            />
                        ))}
                    </div>
                </section>
            )}
        </Container>
    );
}

export async function generateMetadata({ params }: { params: Promise<{ serviceId: string }> }) {
    const { serviceId } = await params;
    if (!UUID_RE.test(serviceId)) return {};
    const service = await getServiceById(serviceId);
    return { title: service?.title };
}
