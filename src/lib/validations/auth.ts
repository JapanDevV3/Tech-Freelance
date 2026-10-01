import { z } from "zod";

// Normalize once (trim + lowercase) THEN validate format.
// Reused by register, login, and authorize so stored/looked-up emails always match.
const emailField = z.string().transform((s) => s.trim().toLowerCase()).pipe(z.email('email'));

// bcrypt only uses the first 72 BYTES. A Thai character is 3 bytes in UTF-8,
// so .max(72) (which counts characters) would let bcrypt silently truncate.
const utf8Bytes = (s: string) => new TextEncoder().encode(s).length;

// Policy for NEW passwords only (register now, change-password later)
const newPasswordField = z.string()
    .min(8, 'passwordMin')
    .refine((s) => utf8Bytes(s) <= 72, 'passwordMax')
    .refine((s) => /\p{L}/u.test(s), 'passwordLetter')  // any letter incl. Thai
    .refine((s) => /\p{N}/u.test(s), 'passwordNumber');

export const loginSchema = z.object({
    email: emailField,
    password: z.string().min(1, 'passwordRequired')
});

export const registerSchema = z.object({
    name: z.string().trim().min(1, 'nameRequired').max(100, 'nameMax'),
    email: emailField,
    password: newPasswordField, // bcrypt truncates > 72 bytes
    role: z.enum(['customer', 'technician']).default('customer'),
}).strict() // reject unexpected fields

// Client-only: adds confirmPassword. Server never needs it.
export const registerFormSchema = registerSchema
    .extend({ confirmPassword: z.string() })
    .refine((d) => d.password === d.confirmPassword, {
        message: 'passwordMismatch',
        path: ['confirmPassword'],
    })

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginValues = z.input<typeof loginSchema>;
export type RegisterFormValues = z.input<typeof registerFormSchema>;