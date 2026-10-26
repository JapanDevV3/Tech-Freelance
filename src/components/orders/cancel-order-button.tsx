'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CharCount } from '@/components/ui/char-count';
import {
    Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { CANCEL_REASON_MAX } from '@/lib/validations/order';
import { apiPost } from '@/lib/api/client';
import { orderErrorKey, shouldRefresh } from '@/lib/orders/action-errors';

export function CancelOrderButton({ orderId }: { orderId: string }) {
    const t = useTranslations('orderActions');
    const tErr = useTranslations('orderErrors');
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [reason, setReason] = useState('');
    const [pending, setPending] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function onConfirm() {
        setPending(true);
        setError(null);
        const trimmed = reason.trim();
        // No reason → no body at all (the route reads text first, so an empty body is valid)
        const res = await apiPost(`/api/v1/orders/${orderId}/cancel`, trimmed ? { reason: trimmed } : undefined);
        setPending(false);
        if (res.ok) { setOpen(false); router.refresh(); return; }
        setError(orderErrorKey(res.code));
        // The order moved on (e.g. already cancelled by the other side): close and show the truth
        if (shouldRefresh(res.code)) { setOpen(false); router.refresh(); }
    }

    return (
        <>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger render={<Button variant="outline" className="mt-2 w-full" />}>{t('cancelTrigger')}</DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('cancelTitle')}</DialogTitle>
                        <DialogDescription>{t('cancelDescription')}</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-2">
                        <Label htmlFor="cancelReason">{t('reasonLabel')}</Label>
                        {/* maxLength uses the schema's own constant, so the browser stops typing at the limit */}
                        <Textarea id="cancelReason" rows={3} maxLength={CANCEL_REASON_MAX} aria-describedby="cancelReason-count" value={reason} onChange={(e) => setReason(e.target.value)} />
                        <CharCount id="cancelReason-count" length={reason.trim().length} max={CANCEL_REASON_MAX} />
                    </div>
                    {error && <p role="alert" className="text-body text-destructive">{tErr(error)}</p>}
                    <DialogFooter>
                        <DialogClose render={<Button variant="outline" />}>{t('keep')}</DialogClose>
                        <Button variant="destructive" onClick={onConfirm} disabled={pending}>
                            {pending ? t('cancelling') : t('cancelConfirm')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            {/* Shown after the dialog closed on a refresh-worthy error */}
            {error && !open && <p role="alert" className="mt-2 text-body text-destructive">{tErr(error)}</p>}
        </>
    );
}