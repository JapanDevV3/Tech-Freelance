import { NextResponse } from 'next/server';
import { apiError } from '@/lib/api/errors';
import { requireApiRole } from '@/lib/api/guard';
import { handleRouteError } from '@/lib/api/handle-error';
import { isUuid } from '@/lib/ids';
import { acceptQuoteSchema } from '@/lib/validations/order';
import { acceptQuote } from '@/services/order.service';

export async function POST(req: Request, ctx: { params: Promise<{ orderId: string }> }) {
    // Layer 1: only customers accept. A technician is stopped here with 403,
    // before the domain even loads the order.
    const guard = await requireApiRole('customer');
    if (!guard.ok) return guard.response;

    const { orderId } = await ctx.params;
    if (!isUuid(orderId)) return apiError('NOT_FOUND', 404);

    try {
        // The client names the quote it saw — "accept THIS one", never "accept the latest"
        const { quoteId } = acceptQuoteSchema.parse(await req.json());
        const result = await acceptQuote(guard.session.user.id, orderId, quoteId);
        return NextResponse.json({ data: result });
    } catch (err) {
        return handleRouteError(err); // QUOTE_STALE / INVALID_STATE → 409, not yours → 404
    }
}