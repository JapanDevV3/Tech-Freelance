'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';

export function LanguageToggle() {
    const locale = useLocale();
    const pathname = usePathname();
    const router = useRouter();

    const nextLocale = locale === 'th' ? 'en' : 'th';

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={() => router.replace(pathname, { locale: nextLocale })}
        >
            {locale === 'th' ? 'EN' : 'ไทย'}
        </Button>
    );
}