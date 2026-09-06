'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function ServiceForm() {
    const router = useRouter();
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setSaving(true);
        setMessage('');
        const form = e.currentTarget;
        const formData = new FormData(e.currentTarget);

        const res = await fetch('/api/v1/services', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: formData.get('title'),
                description: formData.get('description'),
                mode: 'remote',
                priceBaht: formData.get('priceBaht'),
            }),
        });

        setSaving(false);

        if (res.ok) {
            setMessage('Service has been launched.');
            form.reset();
            router.refresh();
        } else {
            const body = await res.json().catch(() => null);
            setMessage(body?.error?.message ?? 'Saving failed.');
        }
    }

    return (
        <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid gap-2">
                <Label htmlFor="title">ชื่อบริการ</Label>
                <Input id="title" name="title" required placeholder="ลง Windows + ไดรเวอร์ครบ" />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="description">รายละเอียด</Label>
                <Input id="description" name="description" required />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="priceBaht">ราคาเริ่มต้น (บาท)</Label>
                <Input id="priceBaht" name="priceBaht" type="number" min="1" required placeholder="500" />
            </div>
            <Button type="submit" disabled={saving}>{saving ? 'กำลังบันทึก...' : 'ลงบริการ'}</Button>
            {message && <p className="text-sm text-muted-foreground">{message}</p>}
        </form>
    );
}