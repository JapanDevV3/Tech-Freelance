import { Container } from "@/components/layout/container";
import { ServiceForm } from "@/components/services/service-form";
import { requireRole } from "@/lib/auth-guard";
import { isUuid } from "@/lib/ids";
import { ServiceFormValues } from "@/lib/validations/service";
import { getServiceForEdit } from "@/services/catalog.service";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { notFound } from "next/navigation";

type Props = { params: Promise<{ locale: string; serviceId: string }> };

export default async function EditServicePage({ params }: Props) {
    const { locale, serviceId } = await params;
    const session = await requireRole(locale, 'technician', `/technician/services/${serviceId}/edit`);
    if (!isUuid(serviceId)) notFound();

    const service = await getServiceForEdit(session.user.id, serviceId);
    if (!service) notFound(); // not yours looks identical to not found

    const t = await getTranslations('serviceForm');
    const values: ServiceFormValues = {
        title: service.title, category: service.category, priceBaht: service.basePriceAmount / 100,
        duration: service.duration, mode: service.mode, serviceArea: service.serviceArea ?? '',
        description: service.description,
        images: service.images.map((i) => ({ kind: 'existing' as const, ...i })),
    };

    return (
        <Container size="lg" gutter="lg">
            <Link href="/dashboard" className="text-sm font-medium text-primary hover:underline">← {t('back')}</Link>
            <h1 className="mt-3 text-2xl font-bold text-foreground">{t('editPageTitle')}</h1>
            <div className="mt-6 rounded-xl border border-border bg-card p-5">
                {/* key → remount when data changes (same lesson as the profile form) */}
                <ServiceForm key={service.updatedAt.toISOString()} service={{ id: service.id, values }} />
            </div>
        </Container>
    );
}