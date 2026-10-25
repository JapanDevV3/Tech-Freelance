'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import {
    Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { apiPost } from '@/lib/api/client';
import { orderErrorKey, shouldRefresh } from '@/lib/orders/action-errors';

type Props = { orderId: string; quoteId: string; version: number; amountLabel: string };

export function AcceptQuoteButton({ orderId, quoteId, version, amountLabel }: Props) {
    const t = useTranslations('orderActions');
    const tErr = useTranslations('orderErrors');
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [pending, setPending] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function onConfirm() {
        setPending(true);
        setError(null);
        // The quote on THIS screen — the server refuses it if the technician revised since the page loaded
        const res = await apiPost(`/api/v1/orders/${orderId}/accept`, { quoteId });
        setPending(false);
        setOpen(false);
        if (!res.ok) setError(orderErrorKey(res.code));
        // Success → show the agreed order. Stale → show the new quote next to the explanation.
        if (res.ok || shouldRefresh(res.code)) router.refresh();
    }

    return (
        <>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger render={<Button className="mt-5 w-full" />}>{t('acceptTrigger')}</DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('acceptTitle', { amount: amountLabel, version })}</DialogTitle>
                        <DialogDescription>{t('acceptDescription')}</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <DialogClose render={<Button variant="outline" />}>{t('back')}</DialogClose>
                        {/* disabled while pending: a double click must not send two requests */}
                        <Button onClick={onConfirm} disabled={pending}>
                            {pending ? t('accepting') : t('acceptConfirm')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            {/* Outside the dialog: it must stay readable after the dialog closes and the page refreshes */}
            {error && <p role="alert" className="mt-2 text-sm text-destructive">{tErr(error)}</p>}
        </>
    );
}