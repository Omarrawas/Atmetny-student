
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { AppLayout } from '@/components/layout/app-layout';
import { Toaster } from '@/components/ui/toaster';
import { SidebarProvider } from '@/components/ui/sidebar';
import { ThemeProvider } from '@/components/theme-provider';
import Head from 'next/head'; // Import Head
import { getAppSettings } from '@/lib/serverExamService';
import { AppSettingsProvider } from '@/contexts/app-settings-context'; // Import the provider

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin', 'arabic'], // Added 'arabic' subset if available, it will fallback.
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin', 'arabic'], // Added 'arabic' subset if available.
});

// Generate metadata dynamically
export async function generateMetadata(): Promise<Metadata> {
  const appSettings = await getAppSettings();
  const appNameOrDefault = appSettings?.app_name || 'Atmetny';
  
  const defaultSiteDescription = `✨ اجعل النجاح عادة!
منصتك التعليمية الشاملة للدراسة الذكية والاستعداد للاختبارات المؤتمتة في سوريا.
📚 ابدأ الآن وكن من صُنّاع التفوق.`;
  
  // Use homepage_description from settings if available and not empty, otherwise use the default.
  const siteDescription = appSettings?.homepage_description && appSettings.homepage_description.trim() !== ''
    ? appSettings.homepage_description
    : defaultSiteDescription;

  return {
    title: {
      default: appNameOrDefault,
      template: `%s | ${appNameOrDefault}`, // For page-specific titles
    },
    description: siteDescription,
    // Add other metadata like icons if app_logo_url is available and suitable for favicon
    // icons: {
    //   icon: appSettings?.app_logo_url || '/favicon.ico', // Example
    // },
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
          <AppSettingsProvider fetchedSettings={appSettings}>
            <SidebarProvider defaultOpen={true}>
              <AppLayout>
                {children}
              </AppLayout>
            </SidebarProvider>
          </AppSettingsProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
