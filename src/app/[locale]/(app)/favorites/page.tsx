import { getTranslations } from 'next-intl/server';
import { Container } from '@/components/layout/container';
import { EmptyState } from '@/components/shared/empty-state';
import { TechnicianCard } from '@/components/technician/technician-card';
import { MOCK_TECHNICIANS } from '@/lib/mock/marketplace';

export default async function FavoritesPage() {
    const t = await getTranslations('favorites');
    const technicians = MOCK_TECHNICIANS;

    return (
        <Container size="lg" gutter="lg">
            <h1 className="text-2xl font-bold text-foreground">{t('title')}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{t('subtitle')}</p>

            <div className="mt-6">
                {technicians.length === 0 ? (
                    <EmptyState title={t('emptyTitle')} description={t('emptySub')} />
                ) : (
                    <div className="space-y-3">
                        {technicians.map((technician) => (
                            <TechnicianCard
                                key={technician.slug}
                                technician={technician}
                                labels={{ reviews: t('reviews'), viewProfile: t('viewProfile') }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </Container>
    );
}
