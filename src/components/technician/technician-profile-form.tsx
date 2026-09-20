'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTranslations } from 'next-intl';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { SERVICE_CATEGORIES, type ServiceCategory } from '@/lib/service-categories';

type Props = { initial: { displayName: string; bio: string; skills: string[] } };

function isServiceCategory(value: string): value is ServiceCategory {
    return (SERVICE_CATEGORIES as readonly string[]).includes(value);
}

export function TechnicianProfileForm({ initial }: Props) {
    const t = useTranslations('techProfile');
    const tCategory = useTranslations('serviceForm.serviceCategory');
    const router = useRouter();
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [status, setStatus] = useState<'idle' | 'ok' | 'error'>('idle');
    const [skills, setSkills] = useState<ServiceCategory[]>(initial.skills.filter(isServiceCategory));

    function toggleSkill(category: ServiceCategory) {
        setSkills((prev) => prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]);
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setSaving(true);
        setStatus('idle');

        const form = new FormData(e.currentTarget);

        const res = await fetch('/api/v1/technician/profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                displayName: form.get('displayName'),
                bio: form.get('bio'),
                skills,
            }),
        });

        setSaving(false);
        res.ok ? (setStatus('ok'), setMessage(t('saved'))) : (setStatus('error'), setMessage(t('saveFailed')))
        if (res.ok) router.refresh();
    }

    return (
        <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid gap-2">
                <Label htmlFor="displayName">{t('displayName')}</Label>
                <Input id="displayName" name="displayName" defaultValue={initial.displayName} placeholder={t('displayNamePlaceholder')} required />
            </div>
            <div className="grid gap-2">
                <Label>{t('skills')}</Label>
                <div className="flex flex-wrap gap-2">
                    {SERVICE_CATEGORIES.map((category) => (
                        <button
                            key={category}
                            type="button"
                            aria-pressed={skills.includes(category)}
                            onClick={() => toggleSkill(category)}
                            className={cn(
                                'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                                skills.includes(category)
                                    ? 'border-primary bg-accent-soft text-primary'
                                    : 'border-border text-muted-foreground hover:border-border-strong hover:text-foreground',
                            )}
                        >
                            {tCategory(category)}
                        </button>
                    ))}
                </div>
                <p className="text-xs text-muted-foreground">{t('skillsHint')}</p>
            </div>
            <div className="grid gap-2">
                <Label htmlFor="bio">{t('bio')}</Label>
                <Textarea id="bio" name="bio" defaultValue={initial.bio} rows={4} placeholder={t('bioPlaceholder')} />
            </div>
            <Button type="submit" disabled={saving} className="justify-self-start">
                {saving ? t('saving') : t('save')}
            </Button>
            {status !== 'idle' && (
                <p className={status === 'ok' ? 'text-sm text-primary' : 'text-sm text-destructive'}>{message}</p>
            )}
        </form>
    );
}