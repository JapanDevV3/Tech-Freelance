import type { DefaultSession } from "next-auth";

export type UserRole = 'customer' | 'technician';

declare module 'next-auth' {
    interface User {
        id: string,
        role: UserRole;
    }
    interface Session {
        user: { id: string; role: UserRole } & DefaultSession['user'];
    }
}

// The JWT interface is defined in @auth/core/jwt (next-auth/jwt only re-exports it).
// It extends Record<string, unknown>, so undeclared properties are typed as unknown.
// Therefore, the module that actually declares JWT must be augmented; otherwise,
// the augmentation will not be applied to the token in the callback.
declare module '@auth/core/jwt' {
    interface JWT {
        id: string,
        role: UserRole
    }
}