'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// There's no "update account" endpoint yet — the form is fully wired up
// visually (values, validation, saved state) but submitting only confirms
// locally instead of persisting. Swap the no-op below for a real PATCH once
// the endpoint exists; the form's shape won't need to change.
type Props = { initial: { name: string; email: string } };

export function AccountForm({ initial }: Props) {
    const t = useTranslations('account');
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        setTimeout(() => {
            setSaving(false);
            setSaved(true);
        }, 300);
    }

    return (
        <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid gap-2">
                <Label htmlFor="accountName">{t('name')}</Label>
                <Input id="accountName" name="name" defaultValue={initial.name} required />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="accountPhone">{t('phone')}</Label>
                <Input id="accountPhone" name="phone" type="tel" placeholder="08X-XXX-XXXX" />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="accountEmail">{t('email')}</Label>
                <Input id="accountEmail" name="email" type="email" defaultValue={initial.email} required />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="accountArea">{t('area')}</Label>
                <Input id="accountArea" name="area" placeholder={t('areaPlaceholder')} />
            </div>
            <Button type="submit" disabled={saving} className="justify-self-start">
                {saving ? t('saving') : t('save')}
            </Button>
            {saved && <p className="text-sm text-primary">{t('saved')}</p>}
        </form>
    );
}
