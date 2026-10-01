'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatBaht } from '@/lib/format';
import { cn } from '@/lib/utils';

// No payment provider is wired up yet — this only simulates the Stripe-style
// checkout UI and navigates to the success screen; nothing is charged.
export function PaymentForm({ orderId, amountBaht }: { orderId: string; amountBaht: number }) {
    const t = useTranslations('payment');
    const router = useRouter();
    const [method, setMethod] = useState<'card' | 'promptpay'>('card');
    const [submitting, setSubmitting] = useState(false);

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSubmitting(true);
        router.push(`/orders/${orderId}/payment/success`);
    }

    return (
        <div>
            <div className="mb-5 grid grid-cols-2 gap-1 rounded-lg bg-muted p-1">
                {(['card', 'promptpay'] as const).map((m) => (
                    <button
                        key={m}
                        type="button"
                        onClick={() => setMethod(m)}
                        className={cn(
                            'rounded-md py-2 text-sm font-medium transition-colors',
                            method === m ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
                        )}
                    >
                        {t(m === 'card' ? 'methodCard' : 'methodPromptpay')}
                    </button>
                ))}
            </div>

            {method === 'promptpay' ? (
                <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border-strong py-10 text-center">
                    <div className="size-36 rounded-lg bg-sunken" />
                    <p className="text-sm text-muted-foreground">{t('promptpayHint')}</p>
                    <Button onClick={() => router.push(`/orders/${orderId}/payment/success`)} className="mt-2">
                        {t('pay', { amount: formatBaht(amountBaht * 100) })}
                    </Button>
                </div>
            ) : (
            <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid gap-2">
                <Label htmlFor="cardNumber">{t('cardNumber')}</Label>
                <Input id="cardNumber" name="cardNumber" placeholder="1234 1234 1234 1234" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="expiry">{t('expiry')}</Label>
                    <Input id="expiry" name="expiry" placeholder="MM / YY" required />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="cvc">CVC</Label>
                    <Input id="cvc" name="cvc" placeholder="123" required />
                </div>
            </div>
            <div className="grid gap-2">
                <Label htmlFor="cardName">{t('cardName')}</Label>
                <Input id="cardName" name="cardName" required />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="receiptEmail">{t('receiptEmail')}</Label>
                <Input id="receiptEmail" name="receiptEmail" type="email" placeholder="you@email.com" required />
            </div>

            <Button type="submit" disabled={submitting} className="mt-2 w-full">
                {submitting ? t('processing') : t('pay', { amount: formatBaht(amountBaht * 100) })}
            </Button>
            <p className="text-center text-xs text-muted-foreground">🔒 {t('sslNote')}</p>
            </form>
            )}
        </div>
    );
}
