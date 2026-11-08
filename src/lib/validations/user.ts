import { z } from 'zod';

export const NAME_MAX = 100;

// Shared by register and account update: a name valid at sign-up must stay valid when edited
export const nameField = z.string().trim().min(1, 'nameRequired').max(NAME_MAX, 'nameMax');

// PATCH /api/v1/me — every field optional, unknown keys rejected (role, email, passwordHash
// can never ride along). Refine last: zod 4 can't omit/extend/partial a refined object.
export const updateMeSchema = z
    .object({ name: nameField })
    .partial()
    .strict()
    .refine((input) => Object.values(input).some((value) => value !== undefined), 'nothingToUpdate');

// Account form — the full editable state, so `name` is required here
export const accountFormSchema = z.object({ name: nameField });

export type UpdateMeInput = z.infer<typeof updateMeSchema>;
export type AccountFormValues = z.input<typeof accountFormSchema>;
