import { apiError } from "@/lib/api/errors";
import { requireApiSession } from "@/lib/api/guard";
import { isUuid } from "@/lib/ids";
import { getOrderForUser } from "@/services/order.service";
import { NextResponse } from "next/server";

export async function GET(_req: Request, ctx: { params: Promise<{ orderId: string }> }) {
    const guard = await requireApiSession();
    if (!guard.ok) return guard.response;

    const { orderId } = await ctx.params;
    if (!isUuid(orderId)) return apiError('NOT_FOUND', 404);

    const order = await getOrderForUser(guard.session.user.id, orderId);
    if (!order) return apiError('NOT_FOUND', 404);

    return NextResponse.json({ data: order });
}