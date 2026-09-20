import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { registerSchema } from "@/lib/validations/auth";
import { registerUser, EmailTakenError } from "@/services/auth.service";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const input = registerSchema.parse(body);

        const user = await registerUser(input);
        return NextResponse.json({ data: user }, { status: 201 })
    } catch (err) {
        if (err instanceof ZodError) {
            return NextResponse.json(
                { error: { code: 'VALIDATION_ERROR', message: 'Invalid Data', details: err.issues } },
                { status: 422 },
            );
        }
        if (err instanceof EmailTakenError) {
            return NextResponse.json(
                { error: { code: 'EMAIL_TAKEN', message: 'Email existed' } },
                { status: 409 },
            );
        }
        console.error(err);
        return NextResponse.json(
            { error: { code: 'INTERNAL', message: 'An error occurred.' } },
            { status: 500 },
        );
    }
}