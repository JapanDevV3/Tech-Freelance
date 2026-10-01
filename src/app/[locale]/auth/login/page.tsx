'use client';
import { useForm } from 'react-hook-form';
import { signIn } from 'next-auth/react';
import { Link, useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LanguageToggle } from '@/components/language-toggle';
import { loginSchema, type LoginValues } from '@/lib/validations/auth';
import { zodResolver } from '@hookform/resolvers/zod';

export default function LoginPage() {
    const t = useTranslations('auth');
    const tv = useTranslations('validation');
    const router = useRouter();

    const {
        register,
        handleSubmit,
        setError,
        formState: { errors, isSubmitting }
    } = useForm<LoginValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: '', password: '' },
    })

    async function onSubmit(values: LoginValues) {
        const res = await signIn('credentials', { ...values, redirect: false });
        if (res?.error) {
            // Generic — never reveal which field was wrong (anti-enumeration)
            setError('root', { message: 'invalidCredentials' });
            return;
        }
        router.push('/dashboard');
    }

    return (
        <Card className="w-full max-w-lg">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{t('signIn')}</CardTitle>
                <LanguageToggle />
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4" noValidate>
                    <div className="grid gap-2">
                        <Label htmlFor="email">{t('email')}</Label>
                        <Input id="email" type="email" autoComplete="email" {...register('email')} />
                        {errors.email && <p className="text-sm text-destructive">{tv(errors.email.message!)}</p>}
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="password">{t('password')}</Label>
                        <Input id="password" type="password" autoComplete="current-password" {...register('password')} />
                        {errors.password && <p className="text-sm text-destructive">{tv(errors.password.message!)}</p>}
                    </div>
                    {errors.root && <p className="text-sm text-destructive">{t('invalidCredentials')}</p>}
                    <Button type="submit" disabled={isSubmitting} className="w-full">
                        {isSubmitting ? t('signingIn') : t('signIn')}
                    </Button>
                    <p className="text-center text-sm text-muted-foreground">
                        {t('noAccount')}{' '}
                        <Link href="/auth/register" className="font-medium text-primary hover:underline">
                            {t('createAccount')}
                        </Link>
                    </p>
                </form>
            </CardContent>
        </Card>
    );
}