import { auth } from '@/auth';
import { Header } from '@/components/layout/header';

// Layout ของ route group (app): ทุกหน้าในกลุ่มนี้ได้ Header + โครงหน้าร่วมอัตโนมัติ
// หมายเหตุ: (app) ไม่มีผลกับ URL -> /dashboard ยังคงเป็น /dashboard
export default async function AppLayout({ children }: { children: React.ReactNode }) {
    const session = await auth();

    return (
        <div className="flex min-h-screen flex-col bg-background">
            <Header user={session?.user ?? null} />
            <main className="flex-1">{children}</main>
        </div>
    );
}
