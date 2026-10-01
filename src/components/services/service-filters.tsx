'use client';

import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { SERVICE_CATEGORIES } from '@/lib/service-categories';
import { useFilters } from '@/hooks/use-filters';
import { useState } from 'react';

export function ServiceFilters({ className }: { className?: string }) {
    const t = useTranslations('serviceFilters');
    const { get, setParam } = useFilters();
    const active = get('category');
    const maxPrice = get('maxPrice') ?? '20000';
    const [price, setPrice] = useState(Number(get('maxPrice') ?? '20000'));

    return (
        <aside className={cn('rounded-xl border border-border bg-card p-5', className)} >
            <h2 className="mb-4 text-sm font-semibold text-foreground">{t('filters')}</h2>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('_label')}</p>
            <div className="flex flex-col gap-0.5">
                {/* "All" clears the category param */}
                <CategoryButton label={t('all')} isActive={!active} onClick={() => setParam('category', null)} />
                {SERVICE_CATEGORIES.map((c) => (
                    <CategoryButton key={c} label={t(c)} isActive={active === c} onClick={() => setParam('category', c)} />
                ))}
            </div>

            <p className="mb-2 mt-5 text-xs font-semibold uppercase tracking-wide text-muted-foreground" >{t('price_range')}</p>
            <input type="range" min={500} max={20000} step={500} defaultValue={Number(maxPrice)}
                onChange={(e) => setPrice(Number(e.target.value))}   // fires on release-ish
                onPointerUp={() => setParam('maxPrice', String(price))}
                className="w-full accent-primary" />
            <p className="mt-1 text-xs text-muted-foreground">{t('max')} ฿{Number(price).toLocaleString()}</p>
        </aside >
    );
}

function CategoryButton({ label, isActive, onClick }: { label: string; isActive: boolean; onClick: () => void }) {
    return (
        <button onClick={onClick}
            className={cn('rounded-lg px-2.5 py-2 text-left text-sm transition-colors',
                isActive ? 'bg-accent-soft font-semibold text-primary' : 'text-foreground hover:bg-accent')}>
            {label}
        </button>
    );
}