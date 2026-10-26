import { auth } from '@/auth';
import { Header, type HeaderUser } from '@/components/layout/header';
import { getStorage } from '@/lib/storage';
import { getMyAvatarKey } from '@/services/user.service';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
    const session = await auth();
    // The avatar key is read from the DB, not stored in the JWT: a new upload then
    // shows after the uploader's router.refresh(), instead of after the next sign-in.
    const avatarKey = session ? await getMyAvatarKey(session.user.id) : null;
    const user: HeaderUser = session
        ? {
            name: session.user.name ?? '',
            role: session.user.role,
            avatarUrl: avatarKey ? getStorage().publicUrl(avatarKey) : null,
        }
        : null;

    return (
        <div className="flex min-h-screen flex-col bg-background">
            <Header user={user} />
            <main className="flex-1">{children}</main>
        </div>
    );
}
