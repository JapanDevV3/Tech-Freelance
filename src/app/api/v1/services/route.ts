import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { auth } from "@/auth";
import { createServiceSchema } from "@/lib/validations/service";
import { createService } from "@/services/catalog.service";

export async function POST(req: Request) {
    const session = await auth();
    if (!session) return NextResponse.json({ error: { code: 'UNAUTHENTICATED', message: 'Unauthentication' } }, { status: 401 });
    if (session.user.role !== 'technician') return NextResponse.json({ error: { code: 'FORBIDDEN', message: 'Technician Only' } }, { status: 403 })

    try {
        const body = await req.json();
        const input = createServiceSchema.parse(body);
        const service = await createService(session.user.id, input);
        return NextResponse.json({ data: service }, { status: 201 })
    } catch (err) {
        if (err instanceof ZodError) {
            return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: 'The information is incorrect.', details: err.issues } }, { status: 422 });
        }

        if (err instanceof Error && err.message === 'NO_PROFILE') {
            return NextResponse.json({ error: { code: 'NO_PROFILE', message: 'Please create a technician profile first.' } }, { status: 409 });
        }

        if (err instanceof Error && err.message === 'INVALID_IMAGE') {
            return NextResponse.json({ error: { code: 'VALIDATION_ERROR', details: [{ path: ['imageKeys'], message: 'imageInvalid' }] } }, { status: 422 });
        }

        console.error(err);
        return NextResponse.json({ error: { code: 'INTERNAL', message: 'An error occurred.' } }, { status: 500 });
    }
}