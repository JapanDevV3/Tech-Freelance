import { z } from 'zod';
import { SERVICE_CATEGORIES } from '@/lib/service-categories';

// Accepts "089-765-4321" / "089 765 4321" and outputs digits only ("0897654321").
// Must stay idempotent: the value passes through this schema twice (client, then server).
const thaiPhone = z.string().trim()
    .transform((s) => s.replace(/[\s-]/g, ''))
    .refine((s) => s === '' || /^0\d{8,9}$/.test(s), 'phoneInvalid');

export const profileSchema = z.object({
    displayName: z.string().trim().min(1, 'displayNameRequired').max(80, 'displayNameMax'),
    phone: thaiPhone,
    serviceArea: z.string().trim().max(120, 'serviceAreaMax'),
    experienceYears: z.number({ error: 'experienceInvalid' })
        .int('experienceInvalid')
        .min(0, 'experienceInvalid')
        .max(60, 'experienceInvalid')
        .nullable(),
    skills: z.array(z.enum(SERVICE_CATEGORIES)).max(SERVICE_CATEGORIES.length),
    bio: z.string().trim().max(500, 'bioMax'),
})
    .strict();

export type ProfileFormValues = z.input<typeof profileSchema>; // what the form holds
export type ProfileInput = z.output<typeof profileSchema>;     // what the service layer receives
