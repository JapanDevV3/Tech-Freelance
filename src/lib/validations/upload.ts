import { z } from 'zod';
import { isImageContentType } from '@/lib/uploads/constants';

// Single-file client check, shared by every single-image upload (avatar today).
// Messages are i18n keys in the `validation` namespace.
export const imageFileSchema = (maxBytes: number) =>
    z.instanceof(File)
        .refine((f) => isImageContentType(f.type), 'imageType')
        .refine((f) => f.size <= maxBytes, 'imageSize');

// PUT /api/v1/me/avatar body — the key comes from POST /api/v1/uploads
export const setAvatarSchema = z.object({ key: z.string().min(1) }).strict();
