

import { getFormatter, getTranslations } from 'next-intl/server';
import { Container } from '@/components/layout/container';
import { StatCard } from '@/components/ui/stat-card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { AccountForm } from '@/components/account/account-form';
import { SignOutButton } from '@/components/account/sign-out-button';
import { formatBaht } from '@/lib/format';


import { requireSession } from '@/lib/auth-guard';
import { getOrderStats } from '@/services/order.service';
import { getMemberSince } from '@/services/user.service';

type AccountPageProps = { params: Promise<{ locale: string }> };

export default async function AccountPage({ params }: AccountPageProps) {
    const { locale } = await params;
    const session = await requireSession(locale, '/account');

    const { id, role } = session.user;
    const name = session.user.name ?? '';
    const email = session.user.email ?? '';

    // Technicians track their numbers on the dashboard; these stats are customer-facing
    const [t, format, memberSince, stats] = await Promise.all([
        getTranslations('account'),
        getFormatter(),
        getMemberSince(id),
        role === 'customer' ? getOrderStats(id, 'customer') : null,
    ]);

    return (
        <Container size="md" gutter="lg">
            <h1 className="text-h1 font-bold text-foreground">{t('title')}</h1>
            <p className="mt-1 text-body text-muted-foreground">{t('subtitle')}</p>

            <div className="mt-6 rounded-xl border border-border bg-card p-5">
                <div className="flex items-center gap-4">
                    <Avatar size="lg">
                        <AvatarFallback>{name.slice(0, 2) || '?'}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="font-semibold text-foreground">{name}</p>
                        {memberSince && (
                            <p className="text-small text-muted-foreground">
                                {t('memberSince', { role, year: format.dateTime(memberSince, { year: 'numeric' }) })}
                            </p>
                        )}
                    </div>
                </div>
                {stats && (
                    <div className="mt-4 grid grid-cols-2 gap-3">
                        <StatCard label={t('statHired')} value={format.number(stats.total)} className="p-3" />
                        <StatCard label={t('statSpent')} value={formatBaht(stats.funded)} className="p-3" />
                    </div>
                )}
            </div>

            <div className="mt-6 rounded-xl border border-border bg-card p-5">
                <h2 className="mb-4 text-body font-semibold text-foreground">{t('personalInfo')}</h2>
                <AccountForm initial={{ name, email }} />
            </div>

            <div className="mt-6 flex items-center justify-between rounded-xl border border-border bg-card p-5">
                <div>
                    <p className="text-body font-semibold text-foreground">{t('signOut')}</p>
                    <p className="text-small text-muted-foreground">{t('signOutHint')}</p>
                </div>
                <SignOutButton label={t('signOut')} />
            </div>
        </Container>
    );
}
