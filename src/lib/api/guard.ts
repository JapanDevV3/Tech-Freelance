import 'server-only';
import type { NextResponse } from 'next/server';
import type { Session } from 'next-auth';
import { auth } from '@/auth';
import type { UserRole } from '@/types/next-auth';
import { apiError } from './errors';

type GuardResult =
    | { ok: true; session: Session }
    | { ok: false; response: NextResponse };

// API routes answer 401/403 — they never redirect. fetch() follows redirects silently,
// so the client would receive the login page's HTML with a 200 instead of an error.
export async function requireApiSession(): Promise<GuardResult> {
    const session = await auth();
    if (!session?.user) return { ok: false, response: apiError('UNAUTHENTICATED', 401) };
    // Single place for future account-level checks (banned users, tokenVersion)
    return { ok: true, session };
}

export async function requireApiRole(role: UserRole): Promise<GuardResult> {
    const guard = await requireApiSession();
    if (!guard.ok) return guard;
    if (guard.session.user.role !== role) return { ok: false, response: apiError('FORBIDDEN', 403) };
    return guard;
}