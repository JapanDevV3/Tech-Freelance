'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FieldError } from '@/components/ui/field-error';
import { apiPatch } from '@/lib/api/client';
import { applyServerErrors, rootErrorKey } from '@/lib/forms/apply-server-errors';
import { accountFormSchema, type AccountFormValues } from '@/lib/validations/user';

// Every field the server may return a 422 for — each one must render a <FieldError> below
const FIELDS = ['name'] as const;

type Props = { initial: { name: string; email: string } };

export function AccountForm({ initial }: Props) {
    const t = useTranslations('account');
    const router = useRouter();
    const [saved, setSaved] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        setError,
        formState: { errors, isSubmitting, isDirty },
    } = useForm<AccountFormValues>({
        resolver: zodResolver(accountFormSchema),
        defaultValues: { name: initial.name },
    });

    const onSubmit = handleSubmit(async (values) => {
        setSaved(false);
        const res = await apiPatch<{ name: string }>('/api/v1/me', values);

        if (res.ok) {
            // The server's stored (trimmed) value becomes the new baseline: isDirty → false
            reset({ name: res.data.name });
            setSaved(true);
            // Re-render server components — the header and greetings read the name from the DB
            router.refresh();
            return;
        }

        if (applyServerErrors(res.body, setError, FIELDS)) return;
        setError('root', { message: rootErrorKey(res.body, 'saveFailed') });
    });

    return (
        <form onSubmit={onSubmit} noValidate className="grid gap-4">
            <div className="grid gap-2">
                <Label htmlFor="accountName">{t('name')}</Label>
                <Input
                    id="accountName"
                    autoComplete="name"
                    aria-invalid={!!errors.name}
                    aria-describedby={errors.name ? 'accountName-error' : undefined}
                    {...register('name')}
                />
                <FieldError id="accountName-error" message={errors.name?.message} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="accountEmail">{t('email')}</Label>
                {/* Not registered with RHF, so it's never sent: email changes need their own verification flow */}
                <Input
                    id="accountEmail"
                    type="email"
                    value={initial.email}
                    readOnly
                    aria-describedby="accountEmail-hint"
                />
                <p id="accountEmail-hint" className="text-small text-muted-foreground">{t('emailHint')}</p>
            </div>

            <FieldError message={errors.root?.message} />

            <div className="flex flex-wrap items-center gap-3">
                <Button type="submit" disabled={!isDirty || isSubmitting}>
                    {isSubmitting ? t('saving') : t('save')}
                </Button>
                {/* Always mounted: a live region added later is often not announced by screen readers */}
                <p role="status" className="text-body text-primary">
                    {saved && !isDirty ? t('saved') : null}
                </p>
            </div>
        </form>
    );
}
