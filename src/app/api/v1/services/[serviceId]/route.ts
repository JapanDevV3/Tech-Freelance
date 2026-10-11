import { NextResponse } from 'next/server';
import { requireApiRole } from '@/lib/api/guard';
import { apiError, validationError } from '@/lib/api/errors';
import { isUuid } from '@/lib/ids';
import { softDeleteService, ServiceNotFoundError, updateService } from '@/services/catalog.service';
import { rateLimit, rateLimitResponse } from '@/lib/rate-limit';
import { updateServiceSchema } from '@/lib/validations/service';
import { ZodError } from 'zod';

export async function DELETE(_req: Request, ctx: { params: Promise<{ serviceId: string }> }) {
    const guard = await requireApiRole('technician');
    if (!guard.ok) return guard.response;

    const { serviceId } = await ctx.params;
    if (!isUuid(serviceId)) return apiError('NOT_FOUND', 404);

    try {
        await softDeleteService(guard.session.user.id, serviceId);
        return new NextResponse(null, { status: 204 }); // no body → the client must not call res.json()
    } catch (err) {
        if (err instanceof ServiceNotFoundError) return apiError('NOT_FOUND', 404);
        console.error(err);
        return apiError('INTERNAL', 500);
    }
}

export async function PUT(req: Request, ctx: { params: Promise<{ serviceId: string }> }) {
    const guard = await requireApiRole('technician');
    if(!guard.ok) return guard.response;
    const userId = guard.session.user.id;

    const limit = await rateLimit('updateService', userId);
    if(!limit.success) return rateLimitResponse(limit);

    const { serviceId } = await ctx.params;
    if(!isUuid(serviceId)) return apiError('NOT_FOUND', 404);

    try{
        const input = updateServiceSchema.parse(await req.json());
        const service = await updateService(userId, serviceId, input);
        return NextResponse.json({data: service});
    } catch (err) {
        if (err instanceof SyntaxError) return apiError('BAD_REQUEST', 400);
        if (err instanceof ZodError) return validationError(err);
        if (err instanceof ServiceNotFoundError) return apiError('NOT_FOUND', 404);
        if (err instanceof Error && err.message === 'INVALID_IMAGE') {
            return apiError('VALIDATION_ERROR', 422, { details: [{ path: ['imageKeys'], message: 'imageInvalid' }] });
        }
        console.error(err);
        return apiError('INTERNAL', 500);
    }
}