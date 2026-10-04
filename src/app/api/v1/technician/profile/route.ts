import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

import { profileSchema } from '@/lib/validations/technician';
import { getMyProfile, upsertMyProfile } from '@/services/technician.service';
import { requireApiRole, requireApiSession } from '@/lib/api/guard';
import { apiError, validationError } from '@/lib/api/errors';

// Errors carry a machine-readable `code`; the client translates it.
// Validation `details[].message` values are i18n keys from the `validation` namespace.

/* Get my technician profile */
export async function GET() {
    const guard = await requireApiSession();
    if (!guard.ok) return guard.response;
    const { session } = guard;

    const profile = await getMyProfile(session.user.id);
    return NextResponse.json({ data: profile ?? null });
}

/* Create or update my technician profile */
export async function POST(req: Request) {
    const guard = await requireApiRole('technician');
    if (!guard.ok) return guard.response;
    const { session } = guard;

    try {
        const input = profileSchema.parse(await req.json());
        const profile = await upsertMyProfile(session.user.id, input);
        return NextResponse.json({ data: profile });
    } catch (err) {
        if (err instanceof SyntaxError) return apiError('BAD_REQUEST', 400);
        if (err instanceof ZodError) return validationError(err);
        console.error(err);
        return apiError('INTERNAL', 500);
    }
}
