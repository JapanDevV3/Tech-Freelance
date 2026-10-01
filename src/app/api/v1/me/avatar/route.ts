import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { auth } from '@/auth';
import { setAvatarSchema } from '@/lib/validations/upload';
import { setMyAvatar } from '@/services/user.service';

// Sets the signed-in user's avatar to an already-uploaded object.
// Flow: POST /api/v1/uploads {purpose:'avatar'} → PUT file → PUT here {key}
export async function PUT(req: Request) {
    const session = await auth();
    if (!session) return NextResponse.json({ error: { code: 'UNAUTHENTICATED' } }, { status: 401 });

    try {
        const { key } = setAvatarSchema.parse(await req.json());
        await setMyAvatar(session.user.id, key);
        return new NextResponse(null, { status: 204 });
    } catch (err) {
        if (err instanceof ZodError || (err instanceof Error && err.message === 'INVALID_IMAGE')) {
            return NextResponse.json(
                { error: { code: 'VALIDATION_ERROR', details: [{ path: ['key'], message: 'imageInvalid' }] } },
                { status: 422 },
            );
        }
        console.error(err);
        return NextResponse.json({ error: { code: 'INTERNAL' } }, { status: 500 });
    }
}
