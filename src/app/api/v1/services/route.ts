import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { createServiceSchema } from "@/lib/validations/service";
import { createService } from "@/services/catalog.service";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { requireApiRole } from "@/lib/api/guard";
import { apiError, validationError } from "@/lib/api/errors";

export async function POST(req: Request) {
    const guard = await requireApiRole('technician');
    if (!guard.ok) return guard.response;

    const { session } = guard;
    const limit = await rateLimit('createService', session.user.id);
    if (!limit.success) return rateLimitResponse(limit);

    try {
        const body = await req.json();
        const input = createServiceSchema.parse(body);
        const service = await createService(session.user.id, input);
        return NextResponse.json({ data: service }, { status: 201 })
    } catch (err) {
        if (err instanceof SyntaxError) return apiError('BAD_REQUEST', 400);
        if (err instanceof ZodError) return validationError(err);
        if (err instanceof Error && err.message === 'NO_PROFILE') return apiError('NO_PROFILE', 409);
        if (err instanceof Error && err.message === 'INVALID_IMAGE') {
            return apiError('VALIDATION_ERROR', 422, { details: [{ path: ['imageKeys'], message: 'imageInvalid' }] });
        }

        console.error(err);
        return apiError('INTERNAL', 500);
    }
}