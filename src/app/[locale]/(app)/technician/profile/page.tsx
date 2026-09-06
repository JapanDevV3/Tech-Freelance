import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { getMyProfile } from '@/services/technician.service';
import { TechnicianProfileForm } from '@/components/technician/technician-profile-form';
import { Container } from '@/components/layout/container';

export default async function TechnicianProfilePage() {
    const session = await auth();
    if (!session) redirect('/login');
    if (session.user.role !== 'technician') redirect('/dashboard'); // ลูกค้าเข้าไม่ได้

    const profile = await getMyProfile(session.user.id);

    return (
        <Container size="sm">
            <h1 className="text-2xl font-semibold mb-6">โปรไฟล์ช่าง</h1>
            <TechnicianProfileForm
                // key={profile?.updatedAt.toISOString()}
                initial={{
                    displayName: profile?.displayName ?? '',
                    bio: profile?.bio ?? '',
                    skills: profile?.skills ?? [],
                }}
            />
        </Container>
    );
}