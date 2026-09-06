import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getMyProfile } from "@/services/technician.service";
import { ServiceForm } from "@/components/technician/service-form";
import { Container } from "@/components/layout/container";

export default async function NewServicePage() {
    const session = await auth();
    if (!session) redirect('/login');
    if (session.user.role !== 'technician') redirect('/dashboard');

    // Don't have profile. Redirect to create profile.
    const profile = await getMyProfile(session.user.id);
    if (!profile) redirect('/technician/profile');

    return (
        <Container size="sm">
            <h1 className="text-2xl font-semibold mb-6">New service launched.</h1>
            <ServiceForm />
        </Container>
    );
}