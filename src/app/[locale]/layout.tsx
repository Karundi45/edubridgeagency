import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../globals.css';
import { Toaster } from 'sonner';
import { SessionProvider } from 'next-auth/react';
import { CookieConsent } from '@/components/common/CookieConsent';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: {
    default: 'EduBridge Agency — Discover Opportunities. Build Your Future.',
    template: '%s | EduBridge Agency',
  },
  description:
    'EduBridge Agency helps students in Rwanda, Africa, and internationally discover verified scholarships, fellowships, and educational opportunities to build a better future.',
  keywords: [
    'scholarships for Rwandan students',
    'scholarships for African students',
    'fully funded scholarships',
    'master scholarships',
    'PhD scholarships',
    'scholarships in Germany',
    'scholarships in Canada',
    'scholarships in Europe',
    'educational opportunities Africa',
    'fellowship opportunities',
    'EduBridge Agency',
  ],
  authors: [{ name: 'EduBridge Agency' }],
  creator: 'EduBridge Agency',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    siteName: 'EduBridge Agency',
    title: 'EduBridge Agency — Discover Opportunities. Build Your Future.',
    description:
      'Discover verified scholarships, fellowships, and educational opportunities for students in Rwanda, Africa, and internationally.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'EduBridge Agency',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EduBridge Agency — Discover Opportunities. Build Your Future.',
    description:
      'Discover verified scholarships and educational opportunities for students in Rwanda, Africa, and internationally.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: '',
  },
};

import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import WhatsAppFab from '@/components/layout/WhatsAppFab';
import { connectToDatabase } from '@/lib/db/mongoose';
import SystemSettings from '@/lib/db/models/SystemSettings';

export default async function RootLayout({
  children,
  params
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  const messages = await getMessages();
  
  await connectToDatabase();
  const whatsappNumber = await SystemSettings.get('whatsapp_number') as string || '+250788000000';
  const defaultMessage = await SystemSettings.get('whatsapp_default_message') as string || 'Hello EduBridge Agency, I would like more information about an opportunity I found on your website.';

  return (
    <html lang={locale} className={inter.variable}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#1E40AF" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
        <NextIntlClientProvider messages={messages}>
          <SessionProvider>
            {children}
            <Toaster
              position="bottom-right"
              toastOptions={{
                style: {
                  fontFamily: 'Inter, sans-serif',
                },
                classNames: {
                  success: 'border-accent text-accent',
                  error: 'border-danger text-danger',
                },
              }}
              richColors
            />
            <CookieConsent />
            <WhatsAppFab phoneNumber={whatsappNumber} defaultMessage={defaultMessage} />
          </SessionProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
