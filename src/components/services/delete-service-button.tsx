'use client';

import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "../ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";

export function DeleteServiceButton({ serviceId, serviceTitle }: { serviceId: string; serviceTitle: string }) {
    const t = useTranslations('serviceDelete');
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [pending, setPending] = useState(false);
    const [failed, setFailed] = useState(false);

    async function onConfirm() {
        setPending(true);
        setFailed(false);

        try {
            const res = await fetch(`/api/v1/services/${serviceId}`, { method: 'DELETE' })
            // 404 = already gone (double click / other tab) → same end state as success
            if (res.ok || res.status === 404) { setOpen(false); router.refresh(); return; }
            setFailed(true);
        } catch {
            setFailed(true); // network failure: fetch rejects instead of returning a response
        } finally {
            setPending(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger render={<Button variant="outline" size="sm" />}>{t('trigger')}</DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t('title')}</DialogTitle>
                    <DialogDescription>{t('description', { title: serviceTitle })}</DialogDescription>
                </DialogHeader>
                {failed && <p role="alert" className="text-sm text-destructive">{t('failed')}</p>}
                <DialogFooter>
                    <DialogClose render={<Button variant="outline" />}>{t('cancel')}</DialogClose>
                    <Button variant="destructive" onClick={onConfirm} disabled={pending}>
                        {pending ? t('deleting') : t('confirm')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}