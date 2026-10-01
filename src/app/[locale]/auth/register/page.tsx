import { getTranslations } from 'next-intl/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LanguageToggle } from '@/components/language-toggle';
import { RegisterForm } from '@/components/auth/register-form';

export default async function RegisterPage() {
    const t = await getTranslations('auth');

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
                <RegisterForm />
            </CardContent>
        </Card>
    );
}
