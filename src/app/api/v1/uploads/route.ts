import { NextResponse } from 'next/server';
import { z, ZodError } from 'zod';
import { auth } from '@/auth';
import { getStorage } from '@/lib/storage';
import { buildKey } from '@/lib/uploads/keys';
import { IMAGE_CONTENT_TYPES, UPLOAD_PURPOSES } from '@/lib/uploads/constants';

const bodySchema = z.object({
    purpose: z.enum(Object.keys(UPLOAD_PURPOSES) as [keyof typeof UPLOAD_PURPOSES]),
    contentType: z.enum(IMAGE_CONTENT_TYPES, { error: 'imageType' }),
    size: z.number().int().positive(),
}).strict();

export async function POST(req: Request) {
    const session = await auth();
    if (!session) return NextResponse.json({ error: { code: 'UNAUTHENTICATED' } }, { status: 401 });

    try {
        const { purpose, contentType, size } = bodySchema.parse(await req.json());
        const rule = UPLOAD_PURPOSES[purpose];
        if (rule.role && session.user.role !== rule.role) {
            return NextResponse.json({ error: { code: 'FORBIDDEN' } }, { status: 403 });
        }
        if (size > rule.maxBytes) {
            return NextResponse.json({ error: { code: 'VALIDATION_ERROR', details: [{ path: ['size'], message: 'imageSize' }] } }, { status: 422 });
        }
        const key = buildKey(purpose, session.user.id, contentType);
        const target = await getStorage().createUploadTarget(key, contentType, size);
        return NextResponse.json({ data: { key, uploadUrl: target.url, headers: target.headers } }, { status: 201 });
    } catch (err) {
        if (err instanceof ZodError) {
            return NextResponse.json({ error: { code: 'VALIDATION_ERROR', details: err.issues } }, { status: 422 });
        }
        console.error(err);
        return NextResponse.json({ error: { code: 'INTERNAL' } }, { status: 500 });
    }
}