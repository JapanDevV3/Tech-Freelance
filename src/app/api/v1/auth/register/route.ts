import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { registerSchema } from "@/lib/validations/auth";
import { registerUser, EmailTakenError } from "@/services/auth.service";
import { getClientIp, rateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { apiError, validationError } from "@/lib/api/errors";

export async function POST(req: Request) {
    const limit = await rateLimit('register', getClientIp(req));
    if (!limit.success) return rateLimitResponse(limit);

    try {
        const body = await req.json();
        const input = registerSchema.parse(body);

        const user = await registerUser(input);
        return NextResponse.json({ data: user }, { status: 201 });
    } catch (err) {
        if (err instanceof SyntaxError) return apiError('BAD_REQUEST', 400);
        if (err instanceof ZodError) return validationError(err);
        if (err instanceof EmailTakenError) return apiError('EMAIL_TAKEN', 409);

        console.error(err);
        return apiError('INTERNAL', 500);
    }
}