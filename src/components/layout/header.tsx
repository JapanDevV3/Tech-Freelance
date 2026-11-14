'use client';

import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { buttonVariants } from '@/components/ui/button';
import { LanguageToggle } from '@/components/language-toggle';
import { ThemeToggle } from '@/components/theme-toggle';
import { AvatarDropdown } from '@/components/avatar-dropdown';
import { MobileNav, type NavItem } from '@/components/layout/mobile-nav';
import { UserRole } from "@/types/next-auth";
import { cn } from '@/lib/utils';

export type HeaderUser = { name: string; role: UserRole; avatarUrl: string | null } | null;

export function Header({ user }: { user: HeaderUser }) {
    const t = useTranslations('nav');
    const pathname = usePathname();

    const links: Omit<NavItem, 'active'>[] = [
        { href: '/', label: t('home') },
        { href: '/services', label: t('services') },
        ...(user ? [{ href: '/dashboard', label: t('dashboard') }] : []),
        ...(user?.role === 'technician'
            ? [
                { href: '/orders', label: t('orders') },
                { href: '/technician/services/new', label: t('newService') },
            ]
            : []),
        ...(user?.role === 'customer'
            ? [
                { href: '/orders', label: t('orders') },
                { href: '/favorites', label: t('favorites') },
            ]
            : []),
    ];
    const items: NavItem[] = links.map((link) => ({ ...link, active: pathname === link.href }));

    return (
        <header className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur">
            <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 sm:px-6">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-body font-bold text-primary-foreground">
                        T
                    </span>
                    <span className="text-lg font-bold tracking-tight text-foreground">Tech-Freelance</span>
                </Link>

                {/* nav: inline from lg up; below that it lives in <MobileNav> */}
                <nav aria-label={t('mainNav')} className="hidden items-center gap-1 lg:flex">
                    {items.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            aria-current={item.active ? 'page' : undefined}
                            className={cn(
                                'rounded-lg px-3 py-2 text-body font-medium transition-colors',
                                item.active ? 'bg-accent text-foreground' : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                            )}
                        >
                            {item.label}
                        </Link>
                    ))}
                </nav>

                <div className="flex-1" />

                {/* actions — language and theme move into the menu below lg */}
                <div className="hidden items-center gap-3 lg:flex">
                    <LanguageToggle />
                    <ThemeToggle />
                </div>

                {user ? <AvatarDropdown role={user.role} name={user.name} avatarUrl={user.avatarUrl} />
                    : (
                        <Link href="/auth/login" className={buttonVariants({ size: 'sm' })}>
                            {t('signIn')}
                        </Link>
                    )}
                <MobileNav items={items} className="lg:hidden" />
            </div>
        </header>
    );
}
