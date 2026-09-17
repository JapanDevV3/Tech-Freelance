import { listActiveServices, type ServiceSort } from '@/services/catalog.service';
import { Container } from '@/components/layout/container';
import { ServiceCard } from '@/components/services/service-card';
import { getTranslations } from 'next-intl/server';
import { ServiceFilters } from '@/components/services/service-filters';
import { ServiceSearch } from '@/components/services/service-search';
import { ServiceSort as SortSelect } from '@/components/services/service-sort';
import { SERVICE_CATEGORIES, type ServiceCategory } from '@/lib/service-categories';

export default async function ServicesPage({
    searchParams,
}: {
    searchParams: Promise<{ q?: string; category?: string; maxPrice?: string; sort?: string }>;
}) {
    const sp = await searchParams;
    const t = await getTranslations('services');
    const category = SERVICE_CATEGORIES.includes(sp.category as ServiceCategory)
        ? (sp.category as ServiceCategory)
        : undefined;

    const services = await listActiveServices({
        q: sp.q,
        maxPrice: sp.maxPrice ? Number(sp.maxPrice) : undefined,
        category,
        sort: (sp.sort as ServiceSort) ?? 'newest',
    });

    return (
        <Container size="xl" gutter="lg">
            <div className="mb-6"><ServiceSearch placeholder={t('searchPlaceholder')} /></div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-[236px_minmax(0,1fr)] md:items-start">
                <ServiceFilters className="hidden md:block md:sticky md:top-20" />

                <div>
                    <div className="mb-4 flex items-center justify-between gap-3">
                        <p className="text-sm text-text-2">{t('found', { count: services.length })}</p>
                        <SortSelect labels={{
                            newest: t('sortNewest'), priceAsc: t('sortPriceAsc'), priceDesc: t('sortPriceDesc'),
                        }} />
                    </div>

                    {services.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-border-strong p-14 text-center">
                            <p className="font-medium text-foreground">{t('emptyTitle')}</p>
                            <p className="mt-1 text-sm text-muted-foreground">{t('emptySub')}</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4">
                            {services.map((s) => (
                                <ServiceCard key={s.id} href="/services" title={s.title} description={s.description}
                                    basePriceAmount={s.basePriceAmount} technicianName={s.technician.displayName}
                                    labels={{ priceFrom: t('priceFrom'), by: t('by') }} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </Container>
    );
}