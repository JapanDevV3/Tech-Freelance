import { getFormatter, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from '@/i18n/navigation';
import { Container } from "@/components/layout/container";
import { ServiceCard } from "@/components/services/service-card";
import { ServiceForm } from "@/components/services/service-form";
import { ServiceStatusBadge } from "@/components/services/service-status-badge";
import { DeleteServiceButton } from "@/components/services/delete-service-button";
import { requireRole } from "@/lib/auth-guard";
import { isUuid } from "@/lib/ids";
import type { ServiceFormValues } from "@/lib/validations/service";
import { getServiceForEdit } from "@/services/catalog.service";
import { getMyProfile } from "@/services/technician.service";

type Props = { params: Promise<{ locale: string; serviceId: string }> };

export default async function EditServicePage({ params }: Props) {
    const { locale, serviceId } = await params;
    const session = await requireRole(locale, 'technician', `/technician/services/${serviceId}/edit`);
    if (!isUuid(serviceId)) notFound();

    const [service, profile] = await Promise.all([
        getServiceForEdit(session.user.id, serviceId),
        getMyProfile(session.user.id),
    ]);
    if (!service) notFound(); // not yours looks identical to not found

    const [t, tServices, format] = await Promise.all([
        getTranslations('serviceForm'),
        getTranslations('services'),
        getFormatter(),
    ]);
    const values: ServiceFormValues = {
        title: service.title, category: service.category, priceBaht: service.basePriceAmount / 100,
        duration: service.duration, mode: service.mode, serviceArea: service.serviceArea ?? '',
        description: service.description,
        images: service.images.map((i) => ({ kind: 'existing' as const, ...i })),
    };
    // Only active services have a public page (the catalog filters on status)
    const isPublic = service.status === 'active';

    return (
        <Container size="lg" gutter="lg">
            <Link href="/dashboard" className="text-body font-medium text-primary hover:underline">← {t('back')}</Link>
            <div className="mt-3 flex flex-wrap items-center gap-3">
                <h1 className="text-h1 font-bold text-foreground">{t('editPageTitle')}</h1>
                <ServiceStatusBadge status={service.status} />
            </div>
            <p className="mt-1 truncate text-body text-muted-foreground">{service.title}</p>

            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
                <div className="rounded-xl border border-border bg-card p-5">
                    {isPublic && (
                        <p className="mb-5 rounded-lg bg-accent-soft px-3 py-2.5 text-body text-primary">{t('liveNotice')}</p>
                    )}
                    {/* key → remount when data changes (same lesson as the profile form) */}
                    <ServiceForm key={service.updatedAt.toISOString()} service={{ id: service.id, status: service.status, values }} />
                </div>

                <aside className="grid gap-4 lg:sticky lg:top-20">
                    <section className="rounded-xl border border-border bg-card p-5">
                        <h2 className="text-body font-semibold text-foreground">{t('previewTitle')}</h2>
                        <p className="mt-1 mb-4 text-small text-muted-foreground">{isPublic ? t('previewHintPublic') : t('previewHintHidden')}</p>
                        <ServiceCard
                            href={isPublic ? `/services/${service.id}` : undefined}
                            title={service.title}
                            description={service.description}
                            basePriceAmount={service.basePriceAmount}
                            technicianName={profile?.displayName ?? ''}
                            coverUrl={service.images[0]?.url ?? null}
                            labels={{ priceFrom: tServices('priceFrom'), by: tServices('by') }}
                        />
                    </section>

                    <section className="rounded-xl border border-border bg-card p-5">
                        <h2 className="text-body font-semibold text-foreground">{t('summaryTitle')}</h2>
                        <dl className="mt-2 text-body">
                            <div className="flex items-center justify-between gap-3 border-b border-hairline py-2.5">
                                <dt className="text-muted-foreground">{t('summaryStatus')}</dt>
                                <dd><ServiceStatusBadge status={service.status} /></dd>
                            </div>
                            <div className="flex items-center justify-between gap-3 border-b border-hairline py-2.5">
                                <dt className="text-muted-foreground">{t('summaryCreated')}</dt>
                                <dd className="font-medium text-foreground">{format.dateTime(service.createdAt, { dateStyle: 'medium' })}</dd>
                            </div>
                            <div className="flex items-center justify-between gap-3 pt-2.5">
                                <dt className="text-muted-foreground">{t('summaryUpdated')}</dt>
                                <dd className="font-medium text-foreground">{format.dateTime(service.updatedAt, { dateStyle: 'medium', timeStyle: 'short' })}</dd>
                            </div>
                        </dl>
                    </section>

                    <section className="rounded-xl border border-border bg-card p-5">
                        <h2 className="text-body font-semibold text-foreground">{t('deleteTitle')}</h2>
                        <p className="mt-1 mb-4 text-small text-muted-foreground">{t('deleteHint')}</p>
                        <DeleteServiceButton serviceId={service.id} serviceTitle={service.title} redirectTo="/dashboard" />
                    </section>
                </aside>
            </div>
        </Container>
    );
}
