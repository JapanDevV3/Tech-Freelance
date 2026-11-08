import { apiError } from "@/lib/api/errors";
import { requireApiSession } from "@/lib/api/guard";
import { handleRouteError } from "@/lib/api/handle-error";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { updateMeSchema } from "@/lib/validations/user";
import { updateMe } from "@/services/user.service";
import { NextResponse } from "next/server";

// Update the signed-in user's own account. The user id comes from the session only —
// there is no id in the URL, so there is nothing to tamper with (no IDOR surface).
export async function PATCH(req: Request) {
    const guard = await requireApiSession();
    if (!guard.ok) return guard.response;
    const userId = guard.session.user.id;

    const limit = await rateLimit('updateMe', userId);
    if (!limit.success) return rateLimitResponse(limit);

    try {
        const input = updateMeSchema.parse(await req.json());
        const me = await updateMe(userId, input);

        // A still-valid JWT for a deleted user: the caller isn't really signed in
        if (!me) return apiError('UNAUTHENTICATED', 401);
        return NextResponse.json({ data: me });
    } catch (err) {
        return handleRouteError(err);
    }
}
