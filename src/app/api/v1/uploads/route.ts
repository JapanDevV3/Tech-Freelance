import { NextResponse } from 'next/server';
import { z, ZodError } from 'zod';
import { getStorage } from '@/lib/storage';
import { buildKey } from '@/lib/uploads/keys';
import { IMAGE_CONTENT_TYPES, UPLOAD_PURPOSES } from '@/lib/uploads/constants';
import { rateLimit, rateLimitResponse } from '@/lib/rate-limit';
import { requireApiSession } from '@/lib/api/guard';
import { apiError, validationError } from '@/lib/api/errors';

const bodySchema = z.object({
    purpose: z.enum(Object.keys(UPLOAD_PURPOSES) as [keyof typeof UPLOAD_PURPOSES]),
    contentType: z.enum(IMAGE_CONTENT_TYPES, { error: 'imageType' }),
    size: z.number().int().positive(),
}).strict();

export async function POST(req: Request) {
    const guard = await requireApiSession();
    if (!guard.ok) return guard.response;

    const { session } = guard;

    const limit = await rateLimit('upload', session.user.id);
    if (!limit.success) return rateLimitResponse(limit);

    try {
        const { purpose, contentType, size } = bodySchema.parse(await req.json());
        const rule = UPLOAD_PURPOSES[purpose];
        if (rule.role && session.user.role !== rule.role) {
            return apiError('FORBIDDEN', 403)
        }
        if (size > rule.maxBytes) {
            return apiError('VALIDATION_ERROR', 422, { details: [{ path: ['size'], message: 'imageSize' }] });
        }
        const key = buildKey(purpose, session.user.id, contentType);
        const target = await getStorage().createUploadTarget(key, contentType, size);
        return NextResponse.json({ data: { key, uploadUrl: target.url, headers: target.headers } }, { status: 201 });
    } catch (err) {
        if (err instanceof SyntaxError) return apiError('BAD_REQUEST', 400);
        if (err instanceof ZodError) return validationError(err);

        console.error(err);
        return apiError('INTERNAL', 500);
    }
}