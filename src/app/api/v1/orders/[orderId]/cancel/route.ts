import { NextResponse } from 'next/server';
import { apiError } from '@/lib/api/errors';
import { requireApiSession } from '@/lib/api/guard';
import { handleRouteError } from '@/lib/api/handle-error';
import { isUuid } from '@/lib/ids';
import { cancelOrderSchema } from '@/lib/validations/order';
import { cancelOrder } from '@/services/order.service';

export async function POST(req: Request, ctx: { params: Promise<{ orderId: string }> }) {
    // Either party may cancel — which one is allowed is decided by ORDER_ACTIONS.cancel.by
    const guard = await requireApiSession();
    if (!guard.ok) return guard.response;

    const { orderId } = await ctx.params;
    if (!isUuid(orderId)) return apiError('NOT_FOUND', 404);

    try {
        // The body is optional: cancelling without a reason is valid.
        // req.json() on an empty body throws, so read text first.
        const raw = await req.text();
        const { reason } = cancelOrderSchema.parse(raw ? JSON.parse(raw) : {});
        await cancelOrder(guard.session.user.id, orderId, reason);
        return new NextResponse(null, { status: 204 }); // no body → the client must not call res.json()
    } catch (err) {
        return handleRouteError(err); // malformed JSON still lands as SyntaxError → 400
    }
}