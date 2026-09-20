'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { UserRole } from "@/types/next-auth";

export function RegisterForm() {
    const t = useTranslations('auth');
    const router = useRouter();
    const [role, setRole] = useState<UserRole>('customer');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);

        const form = new FormData(e.currentTarget);
        const password = form.get('password') as string;
        const confirmPassword = form.get('confirmPassword') as string;
        if (password !== confirmPassword) {
            setError(t('passwordMismatch'));
            return;
        }

        setSaving(true);
        const res = await fetch('/api/v1/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: form.get('name'),
                email: form.get('email'),
                password,
                role,
            }),
        });
        setSaving(false);

        if (res.ok) {
            router.push('/auth/login');
            return;
        }
        const body = await res.json().catch(() => null);
        setError(body?.error?.code === 'EMAIL_TAKEN' ? t('emailTaken') : t('registerFailed'));
    }

    const roles: { value: UserRole; title: string; desc: string }[] = [
        { value: 'customer', title: t('roleCustomer'), desc: t('roleCustomerDesc') },
        { value: 'technician', title: t('roleTechnician'), desc: t('roleTechnicianDesc') },
    ];

    return (
        <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid gap-2">
                <Label>{t('iAm')}</Label>
                <div className="grid grid-cols-2 gap-2">
                    {roles.map((r) => (
                        <button
                            key={r.value}
                            type="button"
                            onClick={() => setRole(r.value)}
                            className={cn(
                                'rounded-lg border p-3 text-left transition-colors',
                                role === r.value ? 'border-primary bg-accent-soft' : 'border-border hover:bg-accent',
                            )}
                        >
                            <span className={cn('block text-sm font-semibold', role === r.value ? 'text-primary' : 'text-foreground')}>
                                {r.title}
                            </span>
                            <span className="mt-0.5 block text-xs text-muted-foreground">{r.desc}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid gap-2">
                <Label htmlFor="name">{t('name')}</Label>
                <Input id="name" name="name" required placeholder={t('namePlaceholder')} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="email">{t('email')}</Label>
                <Input id="email" name="email" type="email" required placeholder="you@email.com" />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="password">{t('password')}</Label>
                <Input id="password" name="password" type="password" required minLength={8} placeholder={t('passwordPlaceholder')} />
                <p className="text-xs text-muted-foreground">{t('passwordHint')}</p>
            </div>

            <div className="grid gap-2">
                <Label htmlFor="confirmPassword">{t('confirmPassword')}</Label>
                <Input id="confirmPassword" name="confirmPassword" type="password" required placeholder={t('confirmPasswordPlaceholder')} />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button type="submit" disabled={saving} className="w-full">
                {saving ? t('creatingAccount') : t('createAccount')}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
                {t('alreadyHaveAccount')}{' '}
                <Link href="/auth/login" className="font-medium text-primary hover:underline">
                    {t('signIn')}
                </Link>
            </p>
        </form>
    );
}
