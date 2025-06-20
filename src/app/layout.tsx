
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { AppLayout } from '@/components/layout/app-layout';
import { Toaster } from '@/components/ui/toaster';
import { SidebarProvider } from '@/components/ui/sidebar';
import { ThemeProvider } from '@/components/theme-provider';
import { CustomThemeProvider } from '@/contexts/custom-theme-provider';
import Head from 'next/head';
import { getAppSettings } from '@/lib/serverExamService';
import { AppSettingsProvider } from '@/contexts/app-settings-context';
import { AuthAndProfileProvider } from '@/contexts/auth-profile-context'; // Import AuthAndProfileProvider

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin', 'arabic'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin', 'arabic'],
});

export async function generateMetadata(): Promise<Metadata> {
  const appSettings = await getAppSettings();
  const appNameOrDefault = appSettings?.app_name || 'Atmetny';
  
  const defaultSiteDescription = `✨ اجعل النجاح عادة!
منصتك التعليمية الشاملة للدراسة الذكية والاستعداد للاختبارات المؤتمتة في سوريا.
📚 ابدأ الآن وكن من صُنّاع التفوق.`;
  
  const siteDescription = appSettings?.homepage_description && appSettings.homepage_description.trim() !== ''
    ? appSettings.homepage_description
    : defaultSiteDescription;

  return {
    title: {
      default: appNameOrDefault,
      template: `%s | ${appNameOrDefault}`,
    },
    description: siteDescription,
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const appSettings = await getAppSettings();

  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <Head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css"
          integrity="sha384-n8MVd4RsNIU0KOVcNqOIIJGEcymbAoisMZRLMgMFjOkPMGKtcMDc4makAUgtOLVT"
          crossOrigin="anonymous"
        />
      </Head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthAndProfileProvider> {/* MOVED HERE to wrap all consumers */}
            <AppSettingsProvider fetchedSettings={appSettings}>
              <CustomThemeProvider>
                  <SidebarProvider defaultOpen={true}>
                    <AppLayout> {/* AppLayout now consumes the context from above */}
                      {children}
                    </AppLayout>
                  </SidebarProvider>
              </CustomThemeProvider>
            </AppSettingsProvider>
          </AuthAndProfileProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
