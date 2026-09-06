'use client';

import { signOut } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { Button, buttonVariants } from '@/components/ui/button';
import { LanguageToggle } from '@/components/language-toggle';
import { ThemeToggle } from '@/components/theme-toggle';

type HeaderUser = { name?: string | null; role: 'customer' | 'technician' } | null;

type NavItem = { href: string; label: string };

export function Header({ user }: { user: HeaderUser }) {
    const t = useTranslations('nav');
    const pathname = usePathname();

    // nav ขับด้วย "ข้อมูล" ไม่ใช่ JSX ซ้ำๆ -> เพิ่ม/ลดเมนูตาม role ได้ในที่เดียว
    const items: NavItem[] = [
        { href: '/', label: t('home') },
        { href: '/services', label: t('services') },
        ...(user ? [{ href: '/dashboard', label: t('dashboard') }] : []),
        ...(user?.role === 'technician'
            ? [{ href: '/technician/services/new', label: t('newService') }]
            : []),
    ];

    return (
        <header className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur">
            <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-5">
                {/* โลโก้ */}
                <Link href="/" className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
                        T
                    </span>
                    <span className="text-lg font-bold tracking-tight text-foreground">TechLance</span>
                </Link>

                {/* nav */}
                <nav className="flex items-center gap-1">
                    {items.map((item) => {
                        const active = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                                    active
                                        ? 'bg-accent text-foreground'
                                        : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                                }`}
                            >
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="flex-1" />

                {/* actions */}
                <LanguageToggle />
                <ThemeToggle />

                {user ? (
                    <div className="flex items-center gap-3 pl-1">
                        <span className="hidden text-sm text-muted-foreground sm:inline">{user.name}</span>
                        <Button variant="outline" size="sm" onClick={() => signOut({ callbackUrl: '/login' })}>
                            {t('signOut')}
                        </Button>
                    </div>
                ) : (
                    <Link href="/login" className={buttonVariants({ size: 'sm' })}>
                        {t('signIn')}
                    </Link>
                )}
            </div>
        </header>
    );
}
