import { redirect } from '@/i18n/navigation';
import { LoginForm } from '@/components/auth/login-form';
import { toSafeCallbackPath } from '@/lib/callback-url';
import { auth } from '@/auth';

export default async function LoginPage({ params, searchParams }: PageProps<'/[locale]/auth/login'>) {
    const { locale } = await params;
    const { callbackUrl } = await searchParams;

    // ?callbackUrl=a&callbackUrl=b arrives as an array — treat it as invalid
    const callbackPath = toSafeCallbackPath(typeof callbackUrl === 'string' ? callbackUrl : null);

    // Already signed in: skip the form and go straight to the destination
    const session = await auth();
    if (session) redirect({ href: callbackPath, locale });

    return <LoginForm callbackPath={callbackPath} />;
}