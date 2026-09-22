import { z } from "zod";

// Normalize once (trim + lowercase) THEN validate format.
// Reused by register, login, and authorize so stored/looked-up emails always match.
const emailField = z.string().transform((s) => s.trim().toLowerCase()).pipe(z.email('email'));

export const loginSchema = z.object({
    email: emailField,
    password: z.string().min(1, 'passwordRequired')
});

export const registerSchema = z.object({
    name: z.string().trim().min(1, 'nameRequired').max(100, 'nameMax'),
    email: emailField,
    password: z.string().min(8, 'passwordMin').max(72, 'passwordMax'), // bcrypt truncates > 72 bytes
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