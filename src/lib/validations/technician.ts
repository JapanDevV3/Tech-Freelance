import { z } from 'zod';

export const profileSchema = z.object({
    displayName: z.string().min(1, 'Please fill your display name.').max(80),
    bio: z.string().max(500).optional(),
    skills: z.array(z.string().min(1).max(20)).optional(),
})

export type ProfileInput = z.infer<typeof profileSchema>;