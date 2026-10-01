import { IMAGE_EXT, UPLOAD_PURPOSES, type ImageContentType, type UploadPurpose } from './constants';

const KEY_RE = /^(services|avatars)\/[0-9a-f-]{36}\/[0-9a-f-]{36}\.(jpg|png|webp)$/;
const EXT_TO_TYPE: Record<string, ImageContentType> = { jpg: 'image/jpeg', png: 'image/png', webp: 'image/webp' };

// Keys are ALWAYS generated server-side — never trust a client filename.
export function buildKey(purpose: UploadPurpose, userId: string, type: ImageContentType) {
    return `${UPLOAD_PURPOSES[purpose].prefix}/${userId}/${crypto.randomUUID()}.${IMAGE_EXT[type]}`;
}
export const isValidKey = (key: string) => KEY_RE.test(key);
export function isOwnedKey(key: string, purpose: UploadPurpose, userId: string) {
    return isValidKey(key) && key.startsWith(`${UPLOAD_PURPOSES[purpose].prefix}/${userId}/`);
}
export function purposeOfKey(key: string): UploadPurpose | null {
    return key.startsWith('services/') ? 'serviceImage' : key.startsWith('avatars/') ? 'avatar' : null;
}
export const contentTypeFromKey = (key: string) => EXT_TO_TYPE[key.split('.').pop() ?? ''];