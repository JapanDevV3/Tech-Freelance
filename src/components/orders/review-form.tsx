'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RatingInput } from '@/components/ui/rating-stars';

// No reviews backend yet — submitting shows a local confirmation instead of
// persisting anything, matching the rest of the order flow.
export function ReviewForm() {
    const t = useTranslations('review');
    const [submitted, setSubmitted] = useState(false);

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                setSubmitted(true);
            }}
            className="grid gap-5"
        >
            <div className="text-center">
                <Label className="justify-center text-sm">{t('overallRating')}</Label>
                <RatingInput name="overall" defaultValue={5} className="mt-2 justify-center" />
            </div>

            <div className="grid gap-3">
                <RatingRow name="quality" label={t('quality')} />
                <RatingRow name="onTime" label={t('onTime')} />
                <RatingRow name="value" label={t('value')} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="reviewComment">{t('shareExperience')}</Label>
                <Textarea id="reviewComment" name="comment" rows={4} placeholder={t('commentPlaceholder')} />
            </div>

            <Button type="submit" disabled={submitted}>{submitted ? t('sent') : t('submit')}</Button>
            {submitted && <p className="text-center text-sm text-primary">{t('thanks')}</p>}
        </form>
    );
}

function RatingRow({ name, label }: { name: string; label: string }) {
    return (
        <div className="flex items-center justify-between">
            <span className="text-sm text-foreground">{label}</span>
            <RatingInput name={name} defaultValue={5} />
        </div>
    );
}
