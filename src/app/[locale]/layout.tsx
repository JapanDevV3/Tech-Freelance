import type { Metadata } from 'next';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import { IBM_Plex_Sans_Thai } from 'next/font/google';
import { routing } from '@/i18n/routing';
import { ThemeProvider } from '@/components/theme-provider';
import '../globals.css';
import { getTranslations } from 'next-intl/server';

// One typeface for both locales: IBM Plex Sans Thai covers Thai and Latin,
// so switching language never changes the rhythm of the layout.
const font = IBM_Plex_Sans_Thai({
  subsets: ['thai', 'latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

type LocaleLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Pick<LocaleLayoutProps, 'params'>): Promise<Metadata> {
  const { locale } = await params;
  // Pass the locale explicitly: metadata is resolved separately from the layout render
  const t = await getTranslations({ locale, namespace: 'common' });
  const appName = t('appName');

  return {
    // Child pages set only their own title; the template appends the brand
    title: { default: appName, template: `%s · ${appName}` },
    description: t('appDescription'),
  };
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();


  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${font.className} antialiased`}>
        <NextIntlClientProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            {children}
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}