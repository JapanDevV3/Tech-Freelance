'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { HugeiconsIcon } from '@hugeicons/react';
import { Sun03Icon, Moon02Icon } from '@hugeicons/core-free-icons';
import { Button } from '@/components/ui/button';

export function ThemeToggle() {
    const { resolvedTheme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    // ก่อน client mount เรายังไม่รู้ธีมจริง → โชว์ปุ่มเปล่าไว้ก่อน กัน hydration mismatch
    if (!mounted) return <Button variant="outline" size="icon" aria-label="สลับธีม" />;

    const isDark = resolvedTheme === 'dark';
    return (
        <Button variant="outline" size="icon" aria-label="Toggle theme"
            onClick={() => setTheme(isDark ? 'light' : 'dark')}>
            <HugeiconsIcon icon={isDark ? Sun03Icon : Moon02Icon} strokeWidth={2} />
        </Button>
    );
}