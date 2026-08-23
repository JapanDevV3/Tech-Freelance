'use client';

import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LanguageToggle } from '@/components/language-toggle';

export default function LoginPage() {
    const t = useTranslations('auth');
    const router = useRouter();
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(false);
        setLoading(true);

        const form = new FormData(e.currentTarget);
        const res = await signIn('credentials', {
            email: form.get('email') as string,
            password: form.get('password') as string,
            redirect: false,
        });

        setLoading(false);
        if (res?.error) {
            setError(true);
            return;
        }
        router.push('/dashboard');
    }

    return (
        <div className="flex min-h-screen items-center justify-center p-4">
            <Card className="w-full max-w-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>{t('signIn')}</CardTitle>
                    <LanguageToggle />
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="email">{t('email')}</Label>
                            <Input id="email" name="email" type="email" required />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password">{t('password')}</Label>
                            <Input id="password" name="password" type="password" required />
                        </div>
                        {error && <p className="text-sm text-red-500">{t('invalidCredentials')}</p>}
                        <Button type="submit" disabled={loading} className="w-full">
                            {loading ? t('signingIn') : t('signIn')}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}