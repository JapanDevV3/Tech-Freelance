import type { DefaultSession } from "next-auth";

declare module 'next-auth' {
    interface User {
        role: 'customer' | 'technician';
    }
    interface Session {
        user: { id: string; role: 'customer' | 'technician' } & DefaultSession['user'];
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        id: string,
        role: 'customer' | 'technician'
    }
}