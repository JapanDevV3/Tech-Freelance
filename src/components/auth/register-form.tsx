'use client';

import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { UserRole } from "@/types/next-auth";
import { useForm } from 'react-hook-form';
import { registerFormSchema, RegisterFormValues } from '@/lib/validations/auth';
import { zodResolver } from '@hookform/resolvers/zod';

export function RegisterForm() {
    const t = useTranslations('auth');
    const tv = useTranslations('validation');
    const router = useRouter();

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        setError,
        formState: { errors, isSubmitting }
    } = useForm<RegisterFormValues>({
        resolver: zodResolver(registerFormSchema),
        defaultValues: { name: '', email: '', password: '', confirmPassword: '', role: 'customer' },
    })

    const role = watch('role'); // role is a button group, not a native input

    async function onSubmit(values: RegisterFormValues) {
        const res = await fetch('/api/v1/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: values.name,
                email: values.email,
                password: values.password,
                role: values.role,
            }),
        })

        if (res.ok) {
            router.push('/auth/login');
            return;
        }

        const body = await res.json().catch(() => null);
        if (body?.error?.code === 'EMAIL_TAKEN') {
            setError('email', { message: 'emailTaken' }); // attach to the field, not a banner
        } else {
            setError('root', { message: 'registerFailed' });
        }
    }

    const roles: { value: UserRole; title: string; desc: string }[] = [
        { value: 'customer', title: t('roleCustomer'), desc: t('roleCustomerDesc') },
        { value: 'technician', title: t('roleTechnician'), desc: t('roleTechnicianDesc') },
    ]

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4" noValidate>
            <div className="grid gap-2">
                <Label>{t('iAm')}</Label>
                <div className="grid grid-cols-2 gap-2">
                    {roles.map((r) => (
                        <button
                            key={r.value}
                            type="button"
                            onClick={() => setValue('role', r.value, { shouldValidate: true })}
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
                <Input id="name" autoComplete="name" placeholder={t('namePlaceholder')} {...register('name')} />
                {errors.name && <p className="text-sm text-destructive">{tv(errors.name.message!)}</p>}
            </div>

            <div className="grid gap-2">
                <Label htmlFor="email">{t('email')}</Label>
                <Input id="email" type="email" autoComplete="email" placeholder="you@email.com" {...register('email')} />
                {errors.email && (
                    <p className="text-sm text-destructive">
                        {/* server error 'emailTaken' lives in `auth`, zod keys in `validation` */}
                        {errors.email.message === 'emailTaken' ? t('emailTaken') : tv(errors.email.message!)}
                    </p>
                )}
            </div>

            <div className="grid gap-2">
                <Label htmlFor="password">{t('password')}</Label>
                <Input id="password" type="password" autoComplete="new-password" placeholder={t('passwordPlaceholder')} {...register('password')} />
                {errors.password
                    ? <p className="text-sm text-destructive">{tv(errors.password.message!)}</p>
                    : <p className="text-xs text-muted-foreground">{t('passwordHint')}</p>}
            </div>

            <div className="grid gap-2">
                <Label htmlFor="confirmPassword">{t('confirmPassword')}</Label>
                <Input id="confirmPassword" type="password" autoComplete="new-password" placeholder={t('confirmPasswordPlaceholder')} {...register('confirmPassword')} />
                {errors.confirmPassword && <p className="text-sm text-destructive">{tv(errors.confirmPassword.message!)}</p>}
            </div>

            {errors.root && <p className="text-sm text-destructive">{t('registerFailed')}</p>}

            <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? t('creatingAccount') : t('createAccount')}
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
