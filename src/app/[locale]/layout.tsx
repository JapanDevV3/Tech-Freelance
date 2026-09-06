import type { Metadata } from 'next';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import { Noto_Sans_Thai } from 'next/font/google';
import { Roboto_Mono } from 'next/font/google';
import { routing } from '@/i18n/routing';
import { ThemeProvider } from '@/components/theme-provider';
import '../globals.css';

const thaiFont = Noto_Sans_Thai({ subsets: ['thai', 'latin'], display: 'swap' });
const enFont = Roboto_Mono({ subsets: ['latin'], display: 'swap' });

export const metadata: Metadata = {
  title: 'TechLance',
  description: 'รับซ่อม/ประกอบคอมพิวเตอร์',
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  const font = locale === 'th' ? thaiFont : enFont;

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