'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { SERVICE_CATEGORIES, ServiceCategory } from '@/lib/service-categories';

export function ServiceForm() {
    const t = useTranslations('serviceForm');
    const router = useRouter();
    const [saving, setSaving] = useState(false);
    // base-ui Select is NOT a native <select>, so its value won't show up in
    // FormData — keep it in state and send it explicitly.
    const [mode, setMode] = useState<'remote' | 'onsite'>('remote');
    const [status, setStatus] = useState<'idle' | 'ok' | 'error'>('idle');
    const [message, setMessage] = useState('');
    const [category, setCategory] = useState<ServiceCategory>('other')

    const categoryItems = Object.fromEntries(SERVICE_CATEGORIES.map((category) => [category, t(`serviceCategory.${category}`)]))

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setSaving(true);
        setStatus('idle');
        const form = e.currentTarget;
        const data = new FormData(form);
        // The clicked submit button's name/value ("status") rides along in
        // FormData automatically — that's how we tell publish from draft apart.
        const publishStatus = (data.get('status') as 'active' | 'draft' | null) ?? 'active';

        const res = await fetch('/api/v1/services', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: data.get('title'),
                description: data.get('description'), // Textarea is native → in FormData
                mode,                                  // from state
                category,
                priceBaht: data.get('priceBaht'),
                status: publishStatus,
            }),
        });

        setSaving(false);
        if (res.ok) {
            setStatus('ok'); setMessage(publishStatus === 'draft' ? t('savedDraft') : t('saved'));
            form.reset(); setMode('remote'); router.refresh();
        } else {
            const body = await res.json().catch(() => null);
            setStatus('error'); setMessage(body?.error?.message ?? t('saveFailed'));
        }
    }


    return (
        <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid gap-2">
                <Label htmlFor="title">{t('name')}</Label>
                <Input id="title" name="title" required placeholder={t('namePlaceholder')} />
                <p className="text-xs text-muted-foreground">{t('nameHint')}</p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className='grid gap-2'>
                    <Label>{t('serviceCategory._label')}</Label>
                    <Select value={category} onValueChange={(val) => setCategory(val as ServiceCategory)} items={categoryItems}>
                        <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            {SERVICE_CATEGORIES.map((category) => <SelectItem key={category} value={category}>{t(`serviceCategory.${category}`)}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="priceBaht">{t('price')}</Label>
                    <Input id="priceBaht" name="priceBaht" type="number" min="1" required placeholder="500" />
                </div>
            </div>

            <div className="grid gap-2">
                <Label>{t('mode')}</Label>
                {/* base-ui Select — verify value/onValueChange prop names for your @base-ui version */}
                <Select value={mode} onValueChange={(v) => setMode(v as 'remote' | 'onsite')} items={{ remote: t('modeRemote'), onsite: t('modeOnsite') }}>
                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="remote">{t('modeRemote')}</SelectItem>
                        <SelectItem value="onsite">{t('modeOnsite')}</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="grid gap-2">
                <Label htmlFor="description">{t('description')}</Label>
                {/* was a single-line Input — now multi-line */}
                <Textarea id="description" name="description" required rows={5} placeholder={t('descriptionPlaceholder')} />
            </div>

            <div className="flex flex-wrap gap-2">
                <Button type="submit" name="status" value="active" disabled={saving}>
                    {saving ? t('saving') : t('submit')}
                </Button>
                <Button type="submit" name="status" value="draft" variant="outline" disabled={saving}>
                    {t('saveDraft')}
                </Button>
            </div>

            {/* success vs error now visually distinct (was always muted gray) */}
            {status !== 'idle' && (
                <p className={status === 'ok' ? 'text-sm text-primary' : 'text-sm text-destructive'}>
                    {message}
                </p>
            )}
        </form>
    );
}