import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { loginSchema } from "@/lib/validations/auth";
import { verifyCredentials } from "@/services/auth.service";
import { rateLimit, hashIdentifier, getClientIp } from '@/lib/rate-limit';

// `code` reaches the client as res.code — keep it non-sensitive (it ends up in the URL)
class RateLimitedSignin extends CredentialsSignin {
    code = 'rate_limited';
}

export const { handlers, signIn, signOut, auth } = NextAuth({
    session: { strategy: 'jwt' },
    providers: [
        Credentials({
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            authorize: async (credentials, request) => {
                // Validate shape first; reject malformed input without touching the DB
                const parsed = loginSchema.safeParse(credentials);
                if (!parsed.success) return null;
                const { email, password } = parsed.data;

                const [byIp, byEmail] = await Promise.all([
                    rateLimit('loginIp', getClientIp(request)),
                    rateLimit('loginEmail', hashIdentifier(email)),
                ]);

                if(!byIp.success || !byEmail.success) throw new RateLimitedSignin();

                return verifyCredentials(email, password);
            },
        }),
    ],
    callbacks: {
        jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = user.role;
            }
            return token;
        },
        session({ session, token }) {
            if (session.user) {
                session.user.id = token.id;
                session.user.role = token.role;
            }
            return session;
        }
    }
})