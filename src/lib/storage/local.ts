
import { stat, unlink } from 'node:fs/promises';
import path from 'node:path';
import type { StorageDriver } from './types';
import { contentTypeFromKey } from '@/lib/uploads/keys';

const ROOT = path.resolve(process.env.LOCAL_UPLOAD_DIR ?? 'storage/uploads');

// Defense in depth against path traversal, even though keys are regex-checked
export function resolveLocalPath(key: string) {
    const full = path.resolve(ROOT, key);
    if (!full.startsWith(ROOT + path.sep)) throw new Error('INVALID_KEY');
    return full;
}

export const localDriver: StorageDriver = {
    // Mimics a presigned URL — the client PUTs to our own route instead of R2
    async createUploadTarget(key, contentType) {
        return { url: `/api/v1/uploads/local/${key}`, headers: { 'Content-Type': contentType } };
    },
    async head(key) {
        try {
            const s = await stat(resolveLocalPath(key));
            return { size: s.size, contentType: contentTypeFromKey(key) };
        } catch {
            return null;
        }
    },
    async remove(key) {
        await unlink(resolveLocalPath(key)).catch(() => undefined);
    },
    publicUrl: (key) => `/api/v1/files/${key}`,
};