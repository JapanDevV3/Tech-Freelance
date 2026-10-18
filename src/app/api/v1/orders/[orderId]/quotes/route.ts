import { apiError } from "@/lib/api/errors";
import { requireApiRole } from "@/lib/api/guard";
import { handleRouteError } from "@/lib/api/handle-error";
import { isUuid } from "@/lib/ids";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { sendQuoteSchema } from "@/lib/validations/order";
import { sendQuote } from "@/services/order.service";
import { NextResponse } from "next/server";

export async function POST(req: Request, ctx: { params: Promise<{ orderId: string }> }) {
    const guard = await requireApiRole('technician');
    if (!guard.ok) return guard.response;
    const userId = guard.session.user.id;

    const limit = await rateLimit('sendQuote', userId);
    if (!limit.success) return rateLimitResponse(limit);

    const { orderId } = await ctx.params;
    if (!isUuid(orderId)) return apiError('NOT_FOUND', 404);

    try {
        const input = sendQuoteSchema.parse(await req.json());
        const quote = await sendQuote(userId, orderId, input);
        return NextResponse.json({ data: quote }, { status: 201 })
    } catch (err) {
        return handleRouteError(err);
    }
}