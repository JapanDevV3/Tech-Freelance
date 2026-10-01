import type { UploadPurpose } from './constants';

export async function uploadImage(purpose: UploadPurpose, file: File): Promise<string> {
    const res = await fetch('/api/v1/uploads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ purpose, contentType: file.type, size: file.size }),
    });
    if (!res.ok) throw new Error('UPLOAD_TARGET_FAILED');
    const { data } = (await res.json()) as { data: { key: string; uploadUrl: string; headers: Record<string, string> } };

    const put = await fetch(data.uploadUrl, { method: 'PUT', headers: data.headers, body: file });
    if (!put.ok) throw new Error('UPLOAD_FAILED');
    return data.key;
}