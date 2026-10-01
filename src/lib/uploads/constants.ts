export const IMAGE_CONTENT_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const; // no SVG → XSS
export type ImageContentType = (typeof IMAGE_CONTENT_TYPES)[number];
export const IMAGE_EXT: Record<ImageContentType, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };

export const UPLOAD_PURPOSES = {
    serviceImage: { prefix: 'services', maxBytes: 5 * 1024 * 1024, role: 'technician' },
    avatar:       { prefix: 'avatars',  maxBytes: 2 * 1024 * 1024, role: null }, // any signed-in user
} as const;

export type UploadPurpose = keyof typeof UPLOAD_PURPOSES;

export const SERVICE_IMAGE_MAX_COUNT = 5;

export function isImageContentType(v: string): v is ImageContentType {
    return (IMAGE_CONTENT_TYPES as readonly string[]).includes(v);
}
