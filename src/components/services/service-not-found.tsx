import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { buttonVariants } from '@/components/ui/button';
import { Container } from '@/components/layout/container';
import { EmptyState } from '@/components/shared/empty-state';

// Shown by the service routes' not-found.tsx. A deleted service's URL can stay in
// the browser history (the app can only replace the *current* entry), so Back
// can land here: keep the 404 status, but say what likely happened and offer a way on.
export function ServiceNotFound({ action }: { action: 'browse' | 'dashboard' }) {
    const t = useTranslations('serviceNotFound');
    return (
        <Container size="md" gutter="lg">
            <EmptyState
                title={t('title')}
                description={t('description')}
                action={
                    <Link href={action === 'browse' ? '/services' : '/dashboard'} className={buttonVariants()}>
                        {action === 'browse' ? t('browse') : t('toDashboard')}
                    </Link>
                }
            />
        </Container>
    );
}
