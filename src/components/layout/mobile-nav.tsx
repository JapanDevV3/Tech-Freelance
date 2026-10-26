'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { HugeiconsIcon } from '@hugeicons/react';
import { Menu01Icon } from '@hugeicons/core-free-icons';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { LanguageToggle } from '@/components/language-toggle';
import { ThemeToggle } from '@/components/theme-toggle';
import { cn } from '@/lib/utils';

export type NavItem = { href: string; label: string; active: boolean };

// Below lg the header has no room for every link (Thai labels are long and the
// technician has five), so the links, language and theme move into a side sheet.
// The avatar / sign-in button stays in the bar: it's the one action people look for there.
export function MobileNav({ items, className }: { items: NavItem[]; className?: string }) {
    const t = useTranslations('nav');
    // Controlled, so tapping a link can close the sheet: client-side navigation
    // keeps this component mounted, and the sheet would otherwise stay open.
    const [open, setOpen] = useState(false);

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger render={<Button variant="ghost" size="icon" aria-label={t('openMenu')} className={className} />}>
                <HugeiconsIcon icon={Menu01Icon} strokeWidth={2} />
            </SheetTrigger>
            <SheetContent side="right">
                <SheetHeader className="border-b border-border">
                    <SheetTitle>{t('menu')}</SheetTitle>
                </SheetHeader>
                <nav aria-label={t('menu')} className="flex flex-col gap-1 p-3">
                    {items.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            aria-current={item.active ? 'page' : undefined}
                            onClick={() => setOpen(false)}
                            className={cn(
                                'flex min-h-10 items-center rounded-lg px-3 text-body font-medium transition-colors pointer-coarse:min-h-11',
                                item.active ? 'bg-accent text-foreground' : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                            )}
                        >
                            {item.label}
                        </Link>
                    ))}
                </nav>
                <SheetFooter className="flex-row items-center gap-2 border-t border-border">
                    <LanguageToggle />
                    <ThemeToggle />
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
