import { getTranslations } from 'next-intl/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LanguageToggle } from '@/components/language-toggle';
import { RegisterForm } from '@/components/auth/register-form';
import { toSafeCallbackPath } from '@/lib/callback-url';
import { auth } from '@/auth';
import { redirect } from '@/i18n/navigation';

export default async function RegisterPage({ params, searchParams }: PageProps<'/[locale]/auth/register'>) {
    const t = await getTranslations('auth');
    const { locale } = await params;
    const { callbackUrl } = await searchParams;

    // ?callbackUrl=a&callbackUrl=b arrives as an array — treat it as invalid
    const callbackPath = toSafeCallbackPath(typeof callbackUrl === 'string' ? callbackUrl : null);

    // Already signed in: skip the form and go straight to the destination
    const session = await auth();
    if (session) redirect({ href: callbackPath, locale });
    
    return (
        <Card className="w-full max-w-lg">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="text-lg">{t('createAccountTitle')}</CardTitle>
                    <p className="mt-1 text-xs text-muted-foreground">{t('createAccountSubtitle')}</p>
                </div>
                <LanguageToggle />
            </CardHeader>
            <CardContent>
                <RegisterForm callbackPath={callbackPath} />
            </CardContent>
        </Card>
    );
}
