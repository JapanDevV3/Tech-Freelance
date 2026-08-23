import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { auth } from '@/auth';
import { profileSchema } from '@/lib/validations/technician';
import { getMyProfile, upsertMyProfile } from '@/services/technician.service';

/* Get Technician Data */
export async function GET() {
    const session = await auth();
    if (!session) {
        return NextResponse.json({ error: { code: 'UNAUTHENTICATED', message: 'ต้องเข้าสู่ระบบ' } }, { status: 401 });
    }
    const profile = await getMyProfile(session.user.id);
    return NextResponse.json({ data: profile ?? null });
}

/* Update and insert */
export async function POST(req: Request) {
    const session = await auth();

    if (!session) {
        return NextResponse.json({ error: { code: 'UNAUTHENTICATED', message: 'ต้องเข้าสู่ระบบ' } }, { status: 401 });
    }

    if (session.user.role !== 'technician') {
        return NextResponse.json({ error: { code: 'FORBIDDEN', message: 'เฉพาะช่างเท่านั้น' } }, { status: 403 });
    }

    try {
        const body = await req.json();
        const input = profileSchema.parse(body);
        const profile = await upsertMyProfile(session.user.id, input);
        return NextResponse.json({ data: profile });
    } catch (err) {
        if (err instanceof ZodError) {
            return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: 'ข้อมูลไม่ถูกต้อง', details: err.issues } }, { status: 422 });
        }
        console.error(err);
        return NextResponse.json({ error: { code: 'INTERNAL', message: 'เกิดข้อผิดพลาด' } }, { status: 500 });
    }
}