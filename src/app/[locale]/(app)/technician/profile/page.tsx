import { Link } from '@/i18n/navigation';
import { getTranslations } from 'next-intl/server';
import { getMyProfile } from '@/services/technician.service';
import { listServicesByTechnician } from '@/services/catalog.service';
import { TechnicianProfileForm } from '@/components/technician/technician-profile-form';
import { Container } from '@/components/layout/container';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { requireRole } from '@/lib/auth-guard';

type TechnicianProfileProps = {
    params: Promise<{ locale: string }>;
};

export default async function TechnicianProfilePage({ params }: TechnicianProfileProps) {
    const { locale } = await params;
    const session = await requireRole(locale, 'technician');

    const t = await getTranslations('techProfile');
    const profile = await getMyProfile(session.user.id);
    const displayName = profile?.displayName || t('untitled');
    const myServices = profile ? await listServicesByTechnician(profile.id) : [];
    // Buddhist calendar year, matching the date convention used across the app.
    const joinedYear = profile ? new Date(profile.createdAt).getFullYear() + 543 : null;

    return (
        <Container size="md" gutter="lg">
            <Link href="/dashboard" className="text-sm font-medium text-primary hover:underline">
                ← {t('backToDashboard')}
            </Link>
            <h1 className="mt-3 text-2xl font-bold text-foreground">{t('title')}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{t('subtitle')}</p>

            <div className="mt-6 flex items-center gap-4 rounded-xl border border-border bg-card p-5">
                <Avatar size="lg">
                    <AvatarFallback>{displayName.slice(0, 2)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                    <p className="truncate font-semibold text-foreground">{displayName}</p>
                    <p className="text-xs text-muted-foreground">
                        {joinedYear ? t('statLine', { year: joinedYear, count: myServices.length }) : t('publicProfileHint')}
                    </p>
                </div>
            </div>

            <div className="mt-6 rounded-xl border border-border bg-card p-5">
                <h2 className="mb-4 text-sm font-semibold text-foreground">{t('formTitle')}</h2>
                <TechnicianProfileForm
                    // key={profile?.updatedAt.toISOString()}
                    initial={{
                        displayName: profile?.displayName ?? '',
                        bio: profile?.bio ?? '',
                        skills: profile?.skills ?? [],
                    }}
                />
            </div>
        </Container>
    );
}