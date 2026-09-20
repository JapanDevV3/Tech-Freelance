import { auth } from '@/auth';
import { redirect } from '@/i18n/navigation';
import { getTranslations } from 'next-intl/server';
import { Container } from '@/components/layout/container';
import { StatCard } from '@/components/ui/stat-card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { AccountForm } from '@/components/account/account-form';
import { SignOutButton } from '@/components/account/sign-out-button';
import { formatBaht } from '@/lib/format';
import { MOCK_ORDERS } from '@/lib/mock/marketplace';

type AccountPageProps = { params: Promise<{ locale: string }> };

export default async function AccountPage({ params }: AccountPageProps) {
    const { locale } = await params;
    const session = await auth();
    if (!session) { redirect({ href: '/auth/login', locale }); return; }

    const t = await getTranslations('account');
    const name = session.user.name ?? '';
    const email = session.user.email ?? '';
    const totalSpentBaht = MOCK_ORDERS.reduce((sum, o) => sum + o.priceBaht, 0);

    return (
        <Container size="md" gutter="lg">
            <h1 className="text-2xl font-bold text-foreground">{t('title')}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{t('subtitle')}</p>

            <div className="mt-6 rounded-xl border border-border bg-card p-5">
                <div className="flex items-center gap-4">
                    <Avatar size="lg">
                        <AvatarFallback>{name.slice(0, 2) || '?'}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="font-semibold text-foreground">{name}</p>
                        <p className="text-xs text-muted-foreground">{t('customerSince', { year: '2567' })}</p>
                    </div>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-3">
                    <StatCard label={t('statHired')} value={String(MOCK_ORDERS.length)} className="p-3" />
                    <StatCard label={t('statSpent')} value={formatBaht(totalSpentBaht * 100)} className="p-3" />
                    <StatCard label={t('statSaved')} value="3" className="p-3" />
                </div>
            </div>

            <div className="mt-6 rounded-xl border border-border bg-card p-5">
                <h2 className="mb-4 text-sm font-semibold text-foreground">{t('personalInfo')}</h2>
                <AccountForm initial={{ name, email }} />
            </div>

            <div className="mt-6 flex items-center justify-between rounded-xl border border-border bg-card p-5">
                <div>
                    <p className="text-sm font-semibold text-foreground">{t('signOut')}</p>
                    <p className="text-xs text-muted-foreground">{t('signOutHint')}</p>
                </div>
                <SignOutButton label={t('signOut')} />
            </div>
        </Container>
    );
}
