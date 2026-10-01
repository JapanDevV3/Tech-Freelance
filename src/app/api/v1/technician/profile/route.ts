import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { auth } from '@/auth';
import { profileSchema } from '@/lib/validations/technician';
import { getMyProfile, upsertMyProfile } from '@/services/technician.service';

// Errors carry a machine-readable `code`; the client translates it.
// Validation `details[].message` values are i18n keys from the `validation` namespace.

/* Get my technician profile */
export async function GET() {
    const session = await auth();
    if (!session) return NextResponse.json({ error: { code: 'UNAUTHENTICATED' } }, { status: 401 });

    const profile = await getMyProfile(session.user.id);
    return NextResponse.json({ data: profile ?? null });
}

/* Create or update my technician profile */
export async function POST(req: Request) {
    const session = await auth();
    if (!session) return NextResponse.json({ error: { code: 'UNAUTHENTICATED' } }, { status: 401 });
    if (session.user.role !== 'technician') return NextResponse.json({ error: { code: 'FORBIDDEN' } }, { status: 403 });

    try {
        const input = profileSchema.parse(await req.json());
        const profile = await upsertMyProfile(session.user.id, input);
        return NextResponse.json({ data: profile });
    } catch (err) {
        if (err instanceof ZodError) {
            return NextResponse.json({ error: { code: 'VALIDATION_ERROR', details: err.issues } }, { status: 422 });
        }
        console.error(err);
        return NextResponse.json({ error: { code: 'INTERNAL' } }, { status: 500 });
    }
}
