'use client';

import { useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { FieldError } from '@/components/ui/field-error';
import { uploadImage } from '@/lib/uploads/client';
import { imageFileSchema } from '@/lib/validations/upload';
import { IMAGE_CONTENT_TYPES, UPLOAD_PURPOSES } from '@/lib/uploads/constants';

const { maxBytes } = UPLOAD_PURPOSES.avatar;
const avatarFile = imageFileSchema(maxBytes);

type Props = { src: string | null; fallback: string };

// Not a react-hook-form form: it's a single immediate action, not a set of fields.
// Consistency here = same zod rules + same <FieldError> + same i18n keys.
// Reusable on the customer Account page (any signed-in user may upload an avatar).
export function AvatarUploader({ src, fallback }: Props) {
    const t = useTranslations('avatar');
    const router = useRouter();
    const inputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string>();

    async function handleFile(file: File | undefined) {
        if (!file) return;

        const parsed = avatarFile.safeParse(file);
        if (!parsed.success) {
            setError(parsed.error.issues[0]?.message);
            return;
        }

        setError(undefined);
        setUploading(true);
        try {
            const key = await uploadImage('avatar', file);
            const res = await fetch('/api/v1/me/avatar', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key }),
            });
            if (!res.ok) throw new Error('SET_AVATAR_FAILED');
            router.refresh(); // new key → new URL, so no stale browser cache
        } catch {
            setError('imageUploadFailed');
        } finally {
            setUploading(false);
        }
    }

    return (
        <div className="flex shrink-0 flex-col items-center gap-2">
            <Avatar size="lg" className="size-16">
                {src && <AvatarImage src={src} alt="" />}
                <AvatarFallback>{fallback}</AvatarFallback>
            </Avatar>
            <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={uploading}
                onClick={() => inputRef.current?.click()}
                aria-describedby="avatar-hint"
            >
                {uploading ? t('uploading') : t('change')}
            </Button>
            <span id="avatar-hint" className="sr-only">{t('hint', { sizeMb: maxBytes / 1024 / 1024 })}</span>
            <input
                ref={inputRef}
                type="file"
                hidden
                accept={IMAGE_CONTENT_TYPES.join(',')}
                // Reset so choosing the same file again still fires onChange
                onChange={(e) => { void handleFile(e.target.files?.[0]); e.target.value = ''; }}
            />
            <FieldError message={error} />
        </div>
    );
}
