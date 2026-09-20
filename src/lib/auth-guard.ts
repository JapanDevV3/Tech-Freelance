import { auth } from "@/auth";
import { redirect } from "@/i18n/navigation";
import type { UserRole } from "@/types/next-auth";

export async function requireSession(locale: string) {
    const session = await auth();
    if (!session) redirect({ href: '/auth/login', locale });
    return session!; // redirect() throws at runtime, so session is non-null past this line
}

export async function requireRole(locale: string, role: UserRole) {
    const session = await requireSession(locale);
    if(session?.user.role !== role) redirect({href: '/dashboard', locale});
    return session;
}