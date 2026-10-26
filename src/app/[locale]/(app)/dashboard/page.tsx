import { Link } from '@/i18n/navigation';
import { getTranslations } from 'next-intl/server';
import { getMyProfile } from '@/services/technician.service';
import { listActiveServices, listServicesByTechnician } from '@/services/catalog.service';
import { Container } from '@/components/layout/container';
import { StatCard } from '@/components/ui/stat-card';
import { buttonVariants } from '@/components/ui/button';
import { EmptyState } from '@/components/shared/empty-state';
import { OrderRow } from '@/components/orders/order-row';
import { ServiceCard } from '@/components/services/service-card';
import { formatBaht } from '@/lib/format';
import { HugeiconsIcon } from '@hugeicons/react';
import { Search01Icon, ClipboardIcon, FavouriteIcon } from '@hugeicons/core-free-icons';
import { requireSession } from '@/lib/auth-guard';
import { MyServiceRow } from '@/components/services/my-service-row';
import { listMyOrders } from '@/services/order.service';
import { inTab } from '@/lib/orders/status-groups';
import { getFormatter } from 'next-intl/server';
import { rowPrice } from '@/lib/orders/row-price';

type DashboardProps = { params: Promise<{ locale: string }> };

export default async function DashboardPage({ params }: DashboardProps) {
    const { locale } = await params;
    const session = await requireSession(locale, '/dashboard');

    return session.user.role === 'technician'
        ? <TechnicianDashboard userId={session.user.id} userName={session.user.name ?? ''} />
        : <CustomerDashboard userId={session.user.id} userName={session.user.name ?? ''} />;
}

// ---------------------------------------------------------------------------
// Technician branch — mirrors the Framer "/dashboard" screen.
// "My listed services" is real data (this technician's own active services).
// "Incoming requests" has no backend yet, so it's mock data until job
// requests exist as a real domain concept.
// ---------------------------------------------------------------------------
async function TechnicianDashboard({ userId, userName }: { userId: string; userName: string }) {
    const t = await getTranslations('dashboard.technician');
    const profile = await getMyProfile(userId);
    const myServices = profile
        ? (await listServicesByTechnician(profile.id))
        : [];
    const myOrders = profile ? await listMyOrders(userId, 'technician') : [];
    const incomingRequests = myOrders.filter((o) => o.status === 'pending_quote').slice(0, 3);
    const activeJobs = myOrders.filter((o) => inTab(o.status, 'active')).length;
    const activeListings = myServices.filter((s) => s.status === 'active').length;
    const format = await getFormatter();
    const monthlyRevenue = 0;

    return (
        <Container size="xl" gutter="lg">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-h1 font-bold text-foreground">{t('greeting', { name: userName })}</h1>
                    <p className="mt-1 text-body text-muted-foreground">{t('subtitle')}</p>
                </div>
                <Link href="/technician/services/new" className={buttonVariants()}>{t('postNew')}</Link>
            </div>

            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <StatCard label={t('statRevenue')} value={formatBaht(monthlyRevenue)} hint={t('statRevenueHint')} hintTone="positive" />
                <StatCard label={t('statJobs')} value={String(activeJobs)} hint={t('statJobsHint')} hintTone="positive" />
                <StatCard label={t('statRating')} value="4.9" hint={t('statRatingHint', { count: 37 })} />
                <StatCard label={t('statListings')} value={String(activeListings)} hint={t('statListingsHint')} />
            </div>

            <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
                <div className="rounded-xl border border-border bg-card p-5">
                    <h2 className="mb-2 text-body font-semibold text-foreground">{t('myServices')}</h2>
                    {myServices.length === 0 ? (
                        <EmptyState
                            title={t('noServicesTitle')}
                            description={t('noServicesSub')}
                            action={<Link href="/technician/services/new" className={buttonVariants({ size: 'sm' })}>{t('postNew')}</Link>}
                        />
                    ) : (
                        <div>
                            {myServices.map((s) => <MyServiceRow key={s.id} service={s} />)}
                        </div>
                    )}
                </div>

                <div className="rounded-xl border border-border bg-card p-5">
                    <h2 className="mb-3 text-body font-semibold text-foreground">{t('incomingRequests')}</h2>
                    {incomingRequests.length === 0 ? (
                        <p className="text-body text-muted-foreground">{t('noRequests')}</p>
                    ) : (
                        <div className="space-y-3">
                            {incomingRequests.map((order) => (
                                <div key={order.id} className="rounded-lg border border-border p-3">
                                    <p className="truncate text-body font-semibold text-foreground">{order.customer.name}</p>
                                    <p className="line-clamp-1 text-small text-muted-foreground">{order.service.title}</p>
                                    <p className="mt-1 text-small text-muted-foreground">{format.dateTime(order.createdAt, { dateStyle: 'medium', timeStyle: 'short' })}</p>
                                    <Link href={`/orders/${order.id}`} className={buttonVariants({ size: 'sm', className: 'mt-3 w-full' })}>
                                        {t('viewRequest')}
                                    </Link>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </Container>
    );
}

// ---------------------------------------------------------------------------
// Customer branch — mirrors the Framer "/home" screen. Recent orders and
// saved-technician count are mock until orders/favorites have a backend;
// recommended services reuse the real catalog.
// ---------------------------------------------------------------------------
async function CustomerDashboard({ userId, userName }: { userId: string, userName: string }) {
    const t = await getTranslations('dashboard.customer');
    const recommended = (await listActiveServices()).slice(0, 3);
    const [myOrders, tStatus] = await Promise.all([listMyOrders(userId, 'customer'), getTranslations('orderStatus')]);
    const recentOrders = myOrders.slice(0, 2);
    const inProgressCount = myOrders.filter((o) => inTab(o.status, 'active')).length;
    const totalSpent = myOrders
        .filter((o) => ['paid', 'in_progress', 'completed', 'released'].includes(o.status))
        .reduce((sum, o) => sum + (o.quotes.at(0)?.amount ?? 0), 0);

    const quickLinks = [
        { href: '/services', icon: Search01Icon, label: t('quickSearch') },
        { href: '/orders', icon: ClipboardIcon, label: t('quickOrders') },
        { href: '/favorites', icon: FavouriteIcon, label: t('quickFavorites') },
    ];

    return (
        <Container size="xl" gutter="lg">
            <h1 className="text-h1 font-bold text-foreground">{t('greeting', { name: userName })}</h1>
            <p className="mt-1 text-body text-muted-foreground">{t('subtitle')}</p>

            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <StatCard label={t('statInProgress')} value={String(inProgressCount)} />
                <StatCard label={t('statSpent')} value={formatBaht(totalSpent)} />
                <StatCard label={t('statSaved')} value="3" />
            </div>

            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                {quickLinks.map((q) => (
                    <Link
                        key={q.href}
                        href={q.href}
                        className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-5 text-center transition-colors hover:border-primary"
                    >
                        <span className="flex size-10 items-center justify-center rounded-full bg-accent-soft text-primary">
                            <HugeiconsIcon icon={q.icon} />
                        </span>
                        <span className="text-body font-medium text-foreground">{q.label}</span>
                    </Link>
                ))}
            </div>

            <section className="mt-10">
                <div className="mb-3 flex items-center justify-between">
                    <h2 className="text-h2 font-semibold text-foreground">{t('recentOrders')}</h2>
                    <Link href="/orders" className="text-body font-medium text-primary hover:underline">{t('viewAll')} →</Link>
                </div>
                <div className="rounded-xl border border-border bg-card px-4">
                    {recentOrders.map((order) => (
                        <OrderRow
                            key={order.id}
                            href={`/orders/${order.id}`}
                            title={order.service.title}
                            subtitle={`${t('by')} ${order.technician.displayName}`}
                            price={rowPrice(order.status, order.quotes.at(0) ?? null)}
                            awaitingLabel={tStatus('customer.pending_quote')}
                            status={order.status} statusLabel={tStatus(`customer.${order.status}`)} />
                    ))}
                </div>
            </section>

            {recommended.length > 0 && (
                <section className="mt-10">
                    <h2 className="mb-3 text-h2 font-semibold text-foreground">{t('recommended')}</h2>
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-4">
                        {recommended.map((s) => (
                            <ServiceCard
                                key={s.id}
                                href={`/services/${s.id}`}
                                title={s.title}
                                coverUrl={s.coverUrl}
                                description={s.description}
                                basePriceAmount={s.basePriceAmount}
                                technicianName={s.technician.displayName}
                                labels={{ priceFrom: t('priceFrom'), by: t('by') }}
                            />
                        ))}
                    </div>
                </section>
            )}
        </Container>
    );
}
