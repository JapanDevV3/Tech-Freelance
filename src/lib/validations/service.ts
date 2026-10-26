import { z } from 'zod';
import { SERVICE_CATEGORIES, SERVICE_DURATIONS } from '@/lib/service-categories';
import { SERVICE_IMAGE_MAX_COUNT, UPLOAD_PURPOSES, isImageContentType } from '@/lib/uploads/constants';

// Shared with the description character counter
export const SERVICE_DESCRIPTION_MAX = 2000;

// Plain object, NO refine — zod v4 won't let you extend/omit a refined object.
// Each variant extends this, then applies the cross-field rule last.
const serviceFields = z.object({
    title: z.string().trim().min(1, 'serviceTitleRequired').max(120, 'serviceTitleMax'),
    category: z.enum(SERVICE_CATEGORIES, { error: 'categoryRequired' }), // design has a placeholder → no default
    priceBaht: z.number({ error: 'priceInvalid' }).positive('pricePositive').max(1_000_000, 'priceMax'),
    duration: z.enum(SERVICE_DURATIONS, { error: 'durationRequired' }),
    mode: z.enum(['remote', 'onsite']),
    serviceArea: z.string().trim().max(120, 'serviceAreaMax'),
    description: z.string().trim().min(1, 'serviceDescriptionRequired').max(SERVICE_DESCRIPTION_MAX, 'serviceDescriptionMax'),
});

const onsiteNeedsArea = <T extends { mode: string; serviceArea: string }>(d: T) =>
    d.mode !== 'onsite' || d.serviceArea.length > 0;
const onsiteNeedsAreaIssue = { message: 'serviceAreaRequired', path: ['serviceArea'] };

const formImage = z.discriminatedUnion('kind', [
    z.object({ kind: z.literal('existing'), key: z.string(), url: z.string() }),
    z.object({ kind: z.literal('new'), file: z.instanceof(File) }),
]);

export const createServiceSchema = serviceFields
    .extend({
        status: z.enum(['draft', 'active']),
        imageKeys: z.array(z.string()).max(SERVICE_IMAGE_MAX_COUNT, 'imagesMax').default([]),
    })
    .strict()
    .refine(onsiteNeedsArea, onsiteNeedsAreaIssue);

const { maxBytes } = UPLOAD_PURPOSES.serviceImage;
export const serviceFormSchema = serviceFields
    .extend({
        images: z.array(formImage)
            .max(SERVICE_IMAGE_MAX_COUNT, 'imagesMax')
            .refine((xs) => xs.every((x) => x.kind === 'existing' || isImageContentType(x.file.type)), 'imageType')
            .refine((xs) => xs.every((x) => x.kind === 'existing' || x.file.size <= maxBytes), 'imageSize'),
    })
    .refine(onsiteNeedsArea, onsiteNeedsAreaIssue);

export const updateServiceSchema = createServiceSchema;

export type CreateServiceInput = z.infer<typeof createServiceSchema>;
export type ServiceFormValues = z.input<typeof serviceFormSchema>;
export type FormImage = z.infer<typeof formImage>;