import { auth } from '@/auth';
import { Header, type HeaderUser } from '@/components/layout/header';
import { getStorage } from '@/lib/storage';
import { getMe } from '@/services/user.service';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
    const session = await auth();
    // Name and avatar are read from the DB, not the JWT: an edit then shows after
    // router.refresh(), instead of after the next sign-in.
    const me = session ? await getMe(session.user.id) : null;
    const user: HeaderUser = session
        ? {
            name: me?.name ?? '',
            role: session.user.role,
            avatarUrl: me?.avatarKey ? getStorage().publicUrl(me.avatarKey) : null,
        }
        : null;

    return (
        <div className="flex min-h-screen flex-col bg-background">
            <Header user={user} />
            <main className="flex-1">{children}</main>
        </div>
    );
}
