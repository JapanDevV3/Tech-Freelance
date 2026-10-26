import { requireApiSession } from "@/lib/api/guard";
import { handleRouteError } from "@/lib/api/handle-error";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { createOrderSchema } from "@/lib/validations/order";
import { createOrder, listMyOrders } from "@/services/order.service";
import { NextResponse } from "next/server";

export async function GET() {
    const guard = await requireApiSession();
    if (!guard.ok) return guard.response;
    const { id, role } = guard.session.user;
    // Party comes from the session, never from a ?role= query the client could flip
    return NextResponse.json({ data: await listMyOrders(id, role) });
}

export async function POST(req: Request) {
    const guard = await requireApiSession();
    if (!guard.ok) return guard.response;
    const userId = guard.session.user.id

    const limit = await rateLimit('createOrder', userId);
    if (!limit.success) return rateLimitResponse(limit);

    try {
        const input = createOrderSchema.parse(await req.json());
        return NextResponse.json({ data: await createOrder(userId, input) }, { status: 201 });
    } catch (err) {
        return handleRouteError(err);
    }
}