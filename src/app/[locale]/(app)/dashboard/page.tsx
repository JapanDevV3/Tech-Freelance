import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

export default async function DashboardPage() {
    const session = await auth();
    if (!session) redirect('/login');

    const t = await getTranslations('dashboard');

    return (
        <div className="mx-auto mt-12 max-w-md space-y-3 px-4">
            <h1 className="text-2xl font-semibold">{t('greeting', { name: session.user.name ?? '' })}</h1>
            <p className="text-muted-foreground">{t('email')}: {session.user.email}</p>
            <p className="text-muted-foreground">{t('role')}: {session.user.role}</p>
        </div>
    );
}
