import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { eq } from 'drizzle-orm';
import bcrypt from "bcryptjs";
import { db } from "@/db/client";
import { users } from '@/db/schema';
import { loginSchema } from "@/lib/validations/auth";

export const { handlers, signIn, signOut, auth } = NextAuth({
    session: { strategy: 'jwt' },
    providers: [
        Credentials({
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            authorize: async (credentials) => {
                // Check input first
                const parsed = loginSchema.safeParse(credentials)
                if (!parsed.success) return null;
                const { email, password } = parsed.data;

                // Find user by email
                const user = await db.query.users.findFirst({ where: eq(users.email, email) });
                if (!user) return null;

                // Compare password
                const passwordOk = await bcrypt.compare(password, user.passwordHash);
                if (!passwordOk) return null;

                return { id: user.id, email: user.email, name: user.name, role: user.role }
            },
        }),
    ],
    callbacks: {
        jwt({ token, user }){
            if(user){
                token.id = user.id;
                token.role = user.role;
            }
            return token;
        },
        session({session, token}){
            if(session.user){
                session.user.id = token.id;
                session.user.role = token.role;
            }
            return session;
        }
    }
})