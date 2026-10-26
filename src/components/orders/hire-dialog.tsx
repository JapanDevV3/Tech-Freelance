'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { z } from 'zod';
import { useRouter } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FieldError } from '@/components/ui/field-error';
import {
    Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { createOrderSchema } from '@/lib/validations/order';
import { apiPost } from '@/lib/api/client';
import { applyServerErrors } from '@/lib/forms/apply-server-errors';
import { orderErrorKey } from '@/lib/orders/action-errors';

// The API's own rules for this field — minus serviceId, which the page supplies (the customer never types it)
const hireFormSchema = createOrderSchema.pick({ problemDescription: true });
type HireFormValues = z.input<typeof hireFormSchema>;

export function HireDialog({ serviceId }: { serviceId: string }) {
    const t = useTranslations('hire');
    const tErr = useTranslations('orderErrors');
    const router = useRouter();
    const [open, setOpen] = useState(false);

    const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<HireFormValues>({
        resolver: zodResolver(hireFormSchema),
        defaultValues: { problemDescription: '' },
    });

    // handleSubmit runs zod first: an invalid form never reaches the network
    const onSubmit = handleSubmit(async (values) => {
        const res = await apiPost<{ id: string }>('/api/v1/orders', { serviceId, ...values });
        if (res.ok) {
            router.push(`/orders/${res.data.id}`); // the new order's page is the confirmation
            return;
        }
        // 422 → put each message under its field; anything else → one message for the whole form
        if (applyServerErrors(res.body, setError, ['problemDescription'])) return;
        setError('root', { message: orderErrorKey(res.code) });
    });

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger render={<Button className="mt-5 w-full" />}>{t('trigger')}</DialogTrigger>
            <DialogContent>
                {/* noValidate: zod owns validation, so the browser's own bubbles don't compete with ours */}
                <form onSubmit={onSubmit} noValidate className="grid gap-4">
                    <DialogHeader>
                        <DialogTitle>{t('title')}</DialogTitle>
                        <DialogDescription>{t('description')}</DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-2">
                        <Label htmlFor="problemDescription">{t('label')}</Label>
                        <Textarea
                            id="problemDescription"
                            rows={5}
                            placeholder={t('placeholder')}
                            aria-invalid={!!errors.problemDescription}
                            aria-describedby={errors.problemDescription ? 'problemDescription-error' : undefined}
                            {...register('problemDescription')}
                        />
                        <FieldError id="problemDescription-error" message={errors.problemDescription?.message} />
                    </div>

                    {errors.root?.message && (
                        <p role="alert" className="text-body text-destructive">{tErr(errors.root.message)}</p>
                    )}

                    <DialogFooter>
                        <DialogClose render={<Button type="button" variant="outline" />}>{t('cancel')}</DialogClose>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? t('submitting') : t('submit')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}