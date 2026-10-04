import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { setAvatarSchema } from '@/lib/validations/upload';
import { setMyAvatar } from '@/services/user.service';
import { requireApiSession } from '@/lib/api/guard';
import { apiError, validationError } from '@/lib/api/errors';

// Sets the signed-in user's avatar to an already-uploaded object.
// Flow: POST /api/v1/uploads {purpose:'avatar'} → PUT file → PUT here {key}
export async function PUT(req: Request) {
    const guard = await requireApiSession();
    if (!guard.ok) return guard.response;
    const { session } = guard;

    try {
        const { key } = setAvatarSchema.parse(await req.json());
        await setMyAvatar(session.user.id, key);
        return new NextResponse(null, { status: 204 });
    } catch (err) {
        if (err instanceof SyntaxError) return apiError('BAD_REQUEST', 400);
        if (err instanceof ZodError) return validationError(err);
        if (err instanceof Error && err.message === 'INVALID_IMAGE') {
            return apiError('VALIDATION_ERROR', 422, { details: [{ path: ['key'], message: 'imageInvalid' }] });
        }

        console.error(err);
        return apiError('INTERNAL', 500);
    }
}
