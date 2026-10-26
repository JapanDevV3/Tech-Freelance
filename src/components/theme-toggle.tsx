'use client';

import { useTheme } from 'next-themes';
import { useTranslations } from 'next-intl';
import { HugeiconsIcon } from '@hugeicons/react';
import { Sun03Icon, Moon02Icon } from '@hugeicons/core-free-icons';
import { Button } from '@/components/ui/button';
import { useSyncExternalStore } from 'react';

const noopSubscribe = () => () => {};

// false during SSR + hydration, true once on the client — no setState-in-effect, no mismatch
function useIsClient() {
    return useSyncExternalStore(noopSubscribe, () => true, () => false);
}

export function ThemeToggle() {
    const t = useTranslations('common');
    const { resolvedTheme, setTheme } = useTheme();
    const mounted = useIsClient();

    if (!mounted) return <Button variant="outline" size="icon" aria-label={t('toggleTheme')} />;

    const isDark = resolvedTheme === 'dark';
    return (
        <Button variant="outline" size="icon" aria-label={t('toggleTheme')}
            onClick={() => setTheme(isDark ? 'light' : 'dark')}>
            <HugeiconsIcon icon={isDark ? Sun03Icon : Moon02Icon} strokeWidth={2} />
        </Button>
    );
}