'use client';

import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

// "120 / 2,000" under a long text field. Pass the trimmed length and the same
// *_MAX constant the zod schema uses: the schema trims before checking max, so
// the counter turns red exactly when validation would fail.
//
// Not an aria-live region (that would announce every keystroke); the field
// points at it with aria-describedby, so screen readers read it on focus.
type CharCountProps = { length: number; max: number; id?: string; className?: string };

export function CharCount({ length, max, id, className }: CharCountProps) {
    const t = useTranslations('common');
    const over = length > max;
    return (
        <p
            id={id}
            className={cn('ml-auto shrink-0 text-small tabular-nums', over ? 'text-destructive' : 'text-muted-foreground', className)}
        >
            <span className="sr-only">{t('charCountLabel')} </span>
            {t('charCount', { count: length, max })}
        </p>
    );
}
