import { Link } from '@/i18n/navigation';
import { getTranslations } from 'next-intl/server';
import { getMyProfile } from '@/services/technician.service';
import { listServicesByTechnician } from '@/services/catalog.service';
import { TechnicianProfileForm } from '@/components/technician/technician-profile-form';
import { Container } from '@/components/layout/container';
import { AvatarUploader } from '@/components/account/avatar-uploader';
import { requireRole } from '@/lib/auth-guard';
import { getStorage } from '@/lib/storage';
import { isServiceCategory } from '@/lib/service-categories';
import { getMyAvatarKey } from '@/services/user.service';

type TechnicianProfileProps = {
    params: Promise<{ locale: string }>;
};

export default async function TechnicianProfilePage({ params }: TechnicianProfileProps) {
    const { locale } = await params;
    const session = await requireRole(locale, 'technician');

    const t = await getTranslations('techProfile');
    const [profile, avatarKey] = await Promise.all([
        getMyProfile(session.user.id),
        getMyAvatarKey(session.user.id),
    ]);
    // Only the key is stored; the URL depends on the active storage driver
    const avatarSrc = avatarKey ? getStorage().publicUrl(avatarKey) : null;
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
                <AvatarUploader src={avatarSrc} fallback={displayName.slice(0, 2)} />
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
                    initial={{
                        displayName: profile?.displayName ?? '',
                        phone: profile?.phone ?? '',
                        serviceArea: profile?.serviceArea ?? '',
                        experienceYears: profile?.experienceYears ?? null,
                        // Legacy rows may hold free-text skills — keep only known categories
                        skills: (profile?.skills ?? []).filter(isServiceCategory),
                        bio: profile?.bio ?? '',
                    }}
                />
            </div>
        </Container>
    );
}