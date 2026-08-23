import { auth, signOut } from '@/auth';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { ThemeToggle } from '@/components/theme-toggle';
import { LanguageToggle } from '@/components/language-toggle';

export default async function DashboardPage() {
    const session = await auth();
    if (!session) redirect('/login');

    const t = await getTranslations('dashboard');

    return (
        <div className="max-w-md mx-auto mt-20 space-y-3">
            <div className="flex justify-end gap-2">
                <LanguageToggle />
                <ThemeToggle />
            </div>
            <h1 className="text-2xl font-semibold">{t('greeting', { name: session.user.name ?? '' })}</h1>
            <p>{t('email')}: {session.user.email}</p>
            <p>{t('role')}: {session.user.role}</p>

            <form action={async () => { 'use server'; await signOut({ redirectTo: '/login' }); }}>
                <button type="submit" className="underline">{t('signOut')}</button>
            </form>
        </div>
    );
}