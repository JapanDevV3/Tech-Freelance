import { auth } from "@/auth";
import { redirect } from "@/i18n/navigation";
import type { UserRole } from "@/types/next-auth";

// `callbackPath` is the locale-less path of the page being guarded, e.g. '/orders/42'.
// Required on purpose: every protected page should decide where login returns to.
export async function requireSession(locale: string, callbackPath: string) {
    const session = await auth();
    if (!session) {
        redirect({
            href: { pathname: '/auth/login', query: { callbackUrl: callbackPath } },
            locale
        });
    }
    return session!; // redirect() throws at runtime, so session is non-null past this line
}

export async function requireRole(locale: string, role: UserRole, callbackPath: string) {
    const session = await requireSession(locale, callbackPath);
    if (session.user.role !== role) redirect({ href: '/dashboard', locale });
    return session;
}