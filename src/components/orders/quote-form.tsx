'use client';

import { useTranslations } from 'next-intl';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { z } from 'zod';
import { useRouter } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FieldError } from '@/components/ui/field-error';
import { CharCount } from '@/components/ui/char-count';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SERVICE_DURATIONS } from '@/lib/service-categories';
import { QUOTE_NOTE_MAX, sendQuoteSchema } from '@/lib/validations/order';
import { apiPost } from '@/lib/api/client';
import { applyServerErrors } from '@/lib/forms/apply-server-errors';
import { orderErrorKey, shouldRefresh } from '@/lib/orders/action-errors';

type QuoteFormValues = z.input<typeof sendQuoteSchema>;
// Every field the server may return a 422 for — each one must render a <FieldError> below
const FIELDS = ['amountBaht', 'duration', 'revisionsIncluded', 'validDays', 'note'] as const;
const VALID_DAYS = [1, 3, 7, 14, 30] as const;
// An empty <input type="number"> must become undefined (optional), not NaN (which zod rejects)
const optionalNumber = (v: string) => (v === '' ? undefined : Number(v));

type Props = {
    orderId: string;
    nextVersion: number;
    revisionsLeft: number; // computed on the server from the same policy the API enforces
    defaults?: Partial<QuoteFormValues>;
};

export function QuoteForm({ orderId, nextVersion, revisionsLeft, defaults }: Props) {
    const t = useTranslations('quoteForm');
    const tDuration = useTranslations('serviceForm.durationOptions');
    const tErr = useTranslations('orderErrors');
    const router = useRouter();

    const { register, control, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<QuoteFormValues>({
        resolver: zodResolver(sendQuoteSchema),
        defaultValues: { validDays: 7, ...defaults },
    });

    const note = useWatch({ control, name: 'note' }) ?? '';

    const onSubmit = handleSubmit(async (values) => {
        const res = await apiPost(`/api/v1/orders/${orderId}/quotes`, values);
        // Success: the page re-renders with the new version; the parent's `key` remounts this form
        if (res.ok) { router.refresh(); return; }
        if (applyServerErrors(res.body, setError, FIELDS)) return;
        setError('root', { message: orderErrorKey(res.code) });
        if (shouldRefresh(res.code)) router.refresh();
    });

    // Hooks above run on every render; this early return comes after them, so the hook order never changes
    if (revisionsLeft === 0) return <p className="text-body text-muted-foreground">{t('limitReached')}</p>;

    const durationItems = SERVICE_DURATIONS.map((d) => ({ value: d, label: tDuration(d) }));
    const dayItems = VALID_DAYS.map((d) => ({ value: String(d), label: t('validDaysOption', { count: d }) }));

    return (
        <form onSubmit={onSubmit} noValidate className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="amountBaht">{t('price')}</Label>
                    {/* Required: valueAsNumber is right here — an empty box SHOULD fail as NaN */}
                    <Input id="amountBaht" type="number" min="1" inputMode="decimal" aria-invalid={!!errors.amountBaht} aria-describedby={errors.amountBaht ? 'amountBaht-error' : undefined}
                        {...register('amountBaht', { valueAsNumber: true })} />
                    <FieldError id="amountBaht-error" message={errors.amountBaht?.message} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="duration">{t('duration')}</Label>
                    <Controller control={control} name="duration" render={({ field, fieldState }) => (
                        <Select value={field.value ?? null} onValueChange={(v) => field.onChange(v ?? undefined)} items={durationItems}>
                            <SelectTrigger id="duration" ref={field.ref} onBlur={field.onBlur} aria-invalid={fieldState.invalid} aria-describedby={fieldState.invalid ? 'duration-error' : undefined} className="w-full">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {durationItems.map((i) => <SelectItem key={i.value} value={i.value}>{i.label}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    )} />
                    <FieldError message={errors.duration?.message} />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="revisionsIncluded">{t('revisions')}</Label>
                    <Input id="revisionsIncluded" type="number" min="0" max="20" aria-invalid={!!errors.revisionsIncluded}
                        {...register('revisionsIncluded', { setValueAs: optionalNumber })} />
                    <FieldError message={errors.revisionsIncluded?.message} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="validDays">{t('validDays')}</Label>
                    {/* Select values are strings; the schema wants a number — convert at the boundary */}
                    <Controller control={control} name="validDays" render={({ field, fieldState }) => (
                        <Select value={field.value ? String(field.value) : null} onValueChange={(v) => field.onChange(v ? Number(v) : undefined)} items={dayItems}>
                            <SelectTrigger id="validDays" ref={field.ref} onBlur={field.onBlur} aria-invalid={fieldState.invalid} className="w-full">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {dayItems.map((i) => <SelectItem key={i.value} value={i.value}>{i.label}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    )} />
                    <FieldError message={errors.validDays?.message} />
                </div>
            </div>

            <div className="grid gap-2">
                <Label htmlFor="note">{t('noteToCustomer')}</Label>
                <Textarea id="note" rows={3} placeholder={t('notePlaceholder')} aria-invalid={!!errors.note} aria-describedby={[errors.note && 'note-error', 'note-count'].filter(Boolean).join(' ')} {...register('note')} />
                <div className="flex items-start gap-3">
                    <FieldError message={errors.note?.message} />
                    <CharCount id="note-count" length={note.trim().length} max={QUOTE_NOTE_MAX} />
                </div>
            </div>

            {errors.root?.message && <p role="alert" className="text-body text-destructive">{tErr(errors.root.message)}</p>}

            <div className="flex flex-wrap items-center justify-between gap-3">
                {/* The first quote isn't a revision — only count down from v2 on */}
                {nextVersion > 1 && <p className="text-small text-muted-foreground">{t('revisionsLeft', { count: revisionsLeft })}</p>}
                <Button type="submit" disabled={isSubmitting} className="ml-auto">
                    {isSubmitting ? t('sending') : t('sendQuote', { version: nextVersion })}
                </Button>
            </div>
        </form>
    );
}