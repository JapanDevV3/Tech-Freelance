import { redirect, Link } from "@/i18n/navigation";
import { getTranslations } from 'next-intl/server';
import { getMyProfile } from "@/services/technician.service";
import { ServiceForm } from "@/components/services/service-form";
import { Container } from "@/components/layout/container";
import { requireRole } from "@/lib/auth-guard";

type NewServicePageProps = {
    params: Promise<{ locale: string }>;
};

export default async function NewServicePage({ params }: NewServicePageProps) {
    const { locale } = await params;
    const session = await requireRole(locale, 'technician');

    // Don't have profile. Redirect to create profile.
    const profile = await getMyProfile(session.user.id);
    console.log('profile', profile);
    if (!profile) {
        redirect({ href: '/technician/profile', locale });
        return;
    }

    const t = await getTranslations('serviceForm');

    return (
        <Container size="lg" gutter="lg">
            <Link href="/dashboard" className="text-sm font-medium text-primary hover:underline">
                ← {t('back')}
            </Link>
            <h1 className="mt-3 text-2xl font-bold text-foreground">{t('pageTitle')}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{t('pageSubtitle')}</p>

            <div className="mt-6 rounded-xl border border-border bg-card p-5">
                <h2 className="mb-4 text-sm font-semibold text-foreground">{t('formTitle')}</h2>
                <ServiceForm />
            </div>
        </Container>
    );
}