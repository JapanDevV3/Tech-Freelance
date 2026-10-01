'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { FieldError } from '@/components/ui/field-error';
import { ImageDropzone } from '@/components/services/image-dropzone';
import { SERVICE_CATEGORIES, SERVICE_DURATIONS } from '@/lib/service-categories';
import { serviceFormSchema, type ServiceFormValues } from '@/lib/validations/service';
import { uploadImage } from '@/lib/uploads/client';
import { applyServerErrors } from '@/lib/forms/apply-server-errors';

type PublishStatus = 'active' | 'draft';

const FORM_FIELDS = ['title', 'category', 'priceBaht', 'duration', 'mode', 'serviceArea', 'description', 'images'] as const;

// category/priceBaht intentionally absent → placeholder / empty input, like the design
const DEFAULT_VALUES = {
    title: '', duration: 'days_1_2', mode: 'remote', serviceArea: '', description: '', images: [],
} satisfies Partial<ServiceFormValues>;

export function ServiceForm() {
    const t = useTranslations('serviceForm');
    const router = useRouter();
    const [savedAs, setSavedAs] = useState<PublishStatus | null>(null);

    const { register, control, handleSubmit, reset, setError, formState: { errors, isSubmitting } } =
        useForm<ServiceFormValues>({ resolver: zodResolver(serviceFormSchema), defaultValues: DEFAULT_VALUES });

    // useWatch (not watch()) — subscribes to one field and plays well with the React Compiler
    const mode = useWatch({ control, name: 'mode' });

    // Base UI: a `null` item renders as the placeholder (trigger gets data-placeholder).
    // Verify against your @base-ui version.
    const categoryItems = [
        { value: null, label: t('serviceCategory._placeholder') },
        ...SERVICE_CATEGORIES.map((c) => ({ value: c, label: t(`serviceCategory.${c}`) })),
    ];
    const durationItems = SERVICE_DURATIONS.map((d) => ({ value: d, label: t(`durationOptions.${d}`) }));
    const modeItems = [{ value: 'remote', label: t('modeRemote') }, { value: 'onsite', label: t('modeOnsite') }];

    // handleSubmit doesn't tell us which button was clicked → bind status explicitly
    const save = (status: PublishStatus) => handleSubmit(async ({ images, ...fields }) => {
        setSavedAs(null);

        let imageKeys: string[];
        try {
            imageKeys = await Promise.all(images.map((f) => uploadImage('serviceImage', f)));
        } catch {
            setError('images', { message: 'imageUploadFailed' });
            return;
        }

        const res = await fetch('/api/v1/services', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...fields, status, imageKeys }),
        });

        if (res.ok) {
            setSavedAs(status);
            reset(DEFAULT_VALUES); // also clears controlled Selects + images (old bug: category stayed)
            router.refresh();
            return;
        }

        const body = await res.json().catch(() => null);
        // Server field `imageKeys` corresponds to the form's `images`
        if (applyServerErrors(body, setError, FORM_FIELDS, { imageKeys: 'images' })) return;
        setError('root', { message: body?.error?.code === 'NO_PROFILE' ? 'noProfile' : 'saveFailed' });
    });

    return (
        <form onSubmit={save('active')} className="grid gap-4" noValidate>
            <div className="grid gap-2">
                <Label htmlFor="title">{t('name')}</Label>
                <Input id="title" placeholder={t('namePlaceholder')} aria-invalid={!!errors.title} {...register('title')} />
                {errors.title ? <FieldError message={errors.title.message} />
                    : <p className="text-xs text-muted-foreground">{t('nameHint')}</p>}
            </div>

            <div className="grid gap-2">
                <Label htmlFor="category">{t('serviceCategory._label')}</Label>
                <Controller control={control} name="category" render={({ field, fieldState }) => (
                    <Select value={field.value ?? null} onValueChange={(v) => field.onChange(v ?? undefined)} items={categoryItems}>
                        <SelectTrigger id="category" ref={field.ref} onBlur={field.onBlur} aria-invalid={fieldState.invalid} className="w-full">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {categoryItems.filter((i) => i.value).map((i) => <SelectItem key={i.value} value={i.value}>{i.label}</SelectItem>)}
                        </SelectContent>
                    </Select>
                )} />
                <FieldError message={errors.category?.message} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="priceBaht">{t('price')}</Label>
                <Input id="priceBaht" type="number" min="1" inputMode="decimal" placeholder="500"
                    aria-invalid={!!errors.priceBaht} {...register('priceBaht', { valueAsNumber: true })} />
                <FieldError message={errors.priceBaht?.message} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="duration">{t('duration')}</Label>
                <Controller control={control} name="duration" render={({ field, fieldState }) => (
                    <Select value={field.value} onValueChange={(v) => field.onChange(v)} items={durationItems}>
                        <SelectTrigger id="duration" ref={field.ref} onBlur={field.onBlur} aria-invalid={fieldState.invalid} className="w-full">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {durationItems.map((i) => <SelectItem key={i.value} value={i.value}>{i.label}</SelectItem>)}
                        </SelectContent>
                    </Select>
                )} />
                <FieldError message={errors.duration?.message} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="mode">{t('mode')}</Label>
                <Controller control={control} name="mode" render={({ field }) => (
                    <Select value={field.value} onValueChange={(v) => field.onChange(v)} items={modeItems}>
                        <SelectTrigger id="mode" ref={field.ref} onBlur={field.onBlur} className="w-full"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            {modeItems.map((i) => <SelectItem key={i.value} value={i.value}>{i.label}</SelectItem>)}
                        </SelectContent>
                    </Select>
                )} />
            </div>

            {mode === 'onsite' && (
                <div className="grid gap-2">
                    <Label htmlFor="serviceArea">{t('serviceArea')}</Label>
                    <Input id="serviceArea" placeholder={t('serviceAreaPlaceholder')} aria-invalid={!!errors.serviceArea} {...register('serviceArea')} />
                    <FieldError message={errors.serviceArea?.message} />
                </div>
            )}

            <div className="grid gap-2">
                <Label htmlFor="description">{t('description')}</Label>
                <Textarea id="description" rows={5} placeholder={t('descriptionPlaceholder')} aria-invalid={!!errors.description} {...register('description')} />
                <FieldError message={errors.description?.message} />
            </div>

            <div className="grid gap-2">
                <Label>{t('images')}</Label>
                <Controller control={control} name="images" render={({ field, fieldState }) => (
                    <ImageDropzone value={field.value} onChange={field.onChange} onBlur={field.onBlur}
                        invalid={fieldState.invalid} describedBy="images-error" />
                )} />
                <FieldError id="images-error" message={errors.images?.message} />
            </div>

            <FieldError message={errors.root?.message} />

            <div className="flex flex-wrap gap-2">
                <Button type="submit" disabled={isSubmitting}>{isSubmitting ? t('saving') : t('submit')}</Button>
                <Button type="button" variant="outline" disabled={isSubmitting} onClick={save('draft')}>{t('saveDraft')}</Button>
            </div>
            {savedAs && <p className="text-sm text-primary">{savedAs === 'draft' ? t('savedDraft') : t('saved')}</p>}
        </form>
    );
}