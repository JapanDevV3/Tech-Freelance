import { NextResponse } from 'next/server';
import { requireApiRole } from '@/lib/api/guard';
import { apiError } from '@/lib/api/errors';
import { isUuid } from '@/lib/ids';
import { softDeleteService, ServiceNotFoundError } from '@/services/catalog.service';

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