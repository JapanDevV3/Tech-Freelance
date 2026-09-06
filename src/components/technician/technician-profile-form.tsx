'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Props = { initial: { displayName: string; bio: string; skills: string[] } };

export function TechnicianProfileForm({ initial }: Props) {
    const router = useRouter();
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setSaving(true);
        setMessage('');

        const form = new FormData(e.currentTarget);
        const skills = (form.get('skills') as string)
            .split(',').map((s) => s.trim()).filter(Boolean);

        const res = await fetch('/api/v1/technician/profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                displayName: form.get('displayName'),
                bio: form.get('bio'),
                skills,
            }),
        });

        setSaving(false);
        setMessage(res.ok ? 'บันทึกแล้ว ✓' : 'บันทึกไม่สำเร็จ');
        if (res.ok) router.refresh();
    }

    return (
        <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid gap-2">
                <Label htmlFor="displayName">ชื่อที่แสดง</Label>
                <Input id="displayName" name="displayName" defaultValue={initial.displayName} required />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="bio">แนะนำตัว</Label>
                <Input id="bio" name="bio" defaultValue={initial.bio} />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="skills">ทักษะ (คั่นด้วย ,)</Label>
                <Input id="skills" name="skills" defaultValue={initial.skills.join(', ')}
                    placeholder="ลง windows, ประกอบเครื่อง, เน็ตเวิร์ก" />
            </div>
            <Button type="submit" disabled={saving}>{saving ? 'กำลังบันทึก...' : 'บันทึก'}</Button>
            {message && <p className="text-sm text-muted-foreground">{message}</p>}
        </form>
    );
}