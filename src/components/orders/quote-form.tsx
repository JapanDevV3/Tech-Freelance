'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { MockOrder } from '@/lib/mock/marketplace';

// Presentational only — there's no order/quote backend yet, so submitting
// just shows a confirmation state instead of persisting anything.
export function QuoteForm({ order }: { order: MockOrder }) {
    const t = useTranslations('technicianOrderDetail');
    const latest = order.quotes[order.quotes.length - 1];
    const [submitted, setSubmitted] = useState(false);

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                setSubmitted(true);
            }}
            className="grid gap-4"
        >
            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="quotePrice">{t('price')}</Label>
                    <Input id="quotePrice" name="quotePrice" type="number" min="1" defaultValue={latest.priceBaht} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="quoteDuration">{t('duration')}</Label>
                    <Input id="quoteDuration" name="quoteDuration" defaultValue={latest.durationLabel} />
                </div>
            </div>
            <div className="grid gap-2">
                <Label htmlFor="quoteRevisions">{t('revisions')}</Label>
                <Input id="quoteRevisions" name="quoteRevisions" defaultValue={order.revisionsLabel} />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="quoteNote">{t('noteToCustomer')}</Label>
                <Textarea id="quoteNote" name="quoteNote" rows={3} placeholder={t('notePlaceholder')} />
            </div>
            <Button type="submit" disabled={submitted}>
                {submitted ? t('sent') : t('sendQuote', { version: order.quotes.length + 1 })}
            </Button>
            {submitted && <p className="text-sm text-primary">{t('sentConfirmation')}</p>}
        </form>
    );
}
