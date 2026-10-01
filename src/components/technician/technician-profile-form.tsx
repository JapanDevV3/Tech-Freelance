'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FieldError } from '@/components/ui/field-error';
import { cn } from '@/lib/utils';
import { SERVICE_CATEGORIES } from '@/lib/service-categories';
import { applyServerErrors } from '@/lib/forms/apply-server-errors';
import { profileSchema, type ProfileFormValues, type ProfileInput } from '@/lib/validations/technician';

const FORM_FIELDS = ['displayName', 'phone', 'serviceArea', 'experienceYears', 'skills', 'bio'] as const;

type Props = { initial: ProfileFormValues };

export function TechnicianProfileForm({ initial }: Props) {
    const t = useTranslations('techProfile');
    const tCategory = useTranslations('serviceForm.serviceCategory');
    const router = useRouter();
    const [saved, setSaved] = useState(false);

    // <Input, Context, Output>: the schema transforms (e.g. phone → digits only),
    // so the submit handler receives the parsed output, not the raw form values.
    const {
        register,
        control,
        handleSubmit,
        reset,
        setError,
        formState: { errors, isSubmitting, isDirty },
    } = useForm<ProfileFormValues, unknown, ProfileInput>({
        resolver: zodResolver(profileSchema),
        defaultValues: initial,
    });

    const onSubmit = handleSubmit(async (values) => {
        setSaved(false);
        const res = await fetch('/api/v1/technician/profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(values),
        });

        if (res.ok) {
            // Saved values become the new baseline (isDirty → false). RHF ignores
            // defaultValues changes after mount, so router.refresh() can't fight the
            // form — the old `key` remount workaround is no longer needed.
            reset(values);
            setSaved(true);
            router.refresh();
            return;
        }

        const body = await res.json().catch(() => null);
        if (!applyServerErrors(body, setError, FORM_FIELDS)) setError('root', { message: 'saveFailed' });
    });

    return (
        <form onSubmit={onSubmit} className="grid gap-4" noValidate>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="grid content-start gap-2">
                    <Label htmlFor="displayName">{t('displayName')}</Label>
                    <Input
                        id="displayName"
                        placeholder={t('displayNamePlaceholder')}
                        aria-invalid={!!errors.displayName}
                        {...register('displayName')}
                    />
                    <FieldError message={errors.displayName?.message} />
                </div>

                <div className="grid content-start gap-2">
                    <Label htmlFor="phone">{t('phone')}</Label>
                    <Input
                        id="phone"
                        type="tel"
                        inputMode="tel"
                        autoComplete="tel"
                        placeholder="08X-XXX-XXXX"
                        aria-invalid={!!errors.phone}
                        {...register('phone')}
                    />
                    {errors.phone
                        ? <FieldError message={errors.phone.message} />
                        : <p className="text-xs text-muted-foreground">{t('phonePrivateHint')}</p>}
                </div>

                <div className="grid content-start gap-2">
                    <Label htmlFor="serviceArea">{t('serviceArea')}</Label>
                    <Input
                        id="serviceArea"
                        placeholder={t('serviceAreaPlaceholder')}
                        aria-invalid={!!errors.serviceArea}
                        {...register('serviceArea')}
                    />
                    <FieldError message={errors.serviceArea?.message} />
                </div>

                <div className="grid content-start gap-2">
                    <Label htmlFor="experienceYears">{t('experience')}</Label>
                    <div className="flex items-center gap-2">
                        <Input
                            id="experienceYears"
                            type="number"
                            min="0"
                            max="60"
                            inputMode="numeric"
                            aria-invalid={!!errors.experienceYears}
                            // Optional number: empty → null. (valueAsNumber would give NaN,
                            // which is right for required fields like price, wrong here.)
                            {...register('experienceYears', {
                                setValueAs: (v: unknown) => (v === '' || v == null ? null : Number(v)),
                            })}
                        />
                        <span className="text-sm text-muted-foreground">{t('experienceUnit')}</span>
                    </div>
                    <FieldError message={errors.experienceYears?.message} />
                </div>
            </div>

            <div className="grid gap-2">
                <Label id="skills-label">{t('skills')}</Label>
                <Controller
                    control={control}
                    name="skills"
                    render={({ field }) => (
                        <div role="group" aria-labelledby="skills-label" className="flex flex-wrap gap-2">
                            {SERVICE_CATEGORIES.map((category) => {
                                const selected = field.value.includes(category);
                                return (
                                    <button
                                        key={category}
                                        type="button"
                                        aria-pressed={selected}
                                        onClick={() => field.onChange(
                                            selected
                                                ? field.value.filter((c) => c !== category)
                                                : [...field.value, category],
                                        )}
                                        className={cn(
                                            'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                                            selected
                                                ? 'border-primary bg-accent-soft text-primary'
                                                : 'border-border text-muted-foreground hover:border-border-strong hover:text-foreground',
                                        )}
                                    >
                                        {tCategory(category)}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                />
                <p className="text-xs text-muted-foreground">{t('skillsHint')}</p>
                <FieldError message={errors.skills?.message} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="bio">{t('bio')}</Label>
                <Textarea
                    id="bio"
                    rows={4}
                    placeholder={t('bioPlaceholder')}
                    aria-invalid={!!errors.bio}
                    {...register('bio')}
                />
                <FieldError message={errors.bio?.message} />
            </div>

            <FieldError message={errors.root?.message} />

            <Button type="submit" disabled={isSubmitting || !isDirty} className="justify-self-start">
                {isSubmitting ? t('saving') : t('save')}
            </Button>
            {saved && !isDirty && <p className="text-sm text-primary">{t('saved')}</p>}
        </form>
    );
}
