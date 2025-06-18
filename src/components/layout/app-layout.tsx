
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import { useState, useEffect } from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarFooter,
  useSidebar,
  SidebarInset,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { mainNavItems } from '@/lib/constants';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LogOut, Moon, Sun, ArrowRight, UserCircle, ExternalLink } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useTheme } from 'next-themes';
import { supabase } from '@/lib/supabaseClient';
import type { User as SupabaseAuthUser, Session as SupabaseSession } from '@supabase/supabase-js';
import { Skeleton } from '@/components/ui/skeleton';
import { useAppSettings } from '@/contexts/app-settings-context';
import Image from 'next/image';

export function AppLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { state, isMobile, setOpenMobile } = useSidebar();
  const { theme, setTheme } = useTheme();
  const { settings: appSettings } = useAppSettings();

  const [authUser, setAuthUser] = useState<SupabaseAuthUser | null>(null);
  const [session, setSession] = useState<SupabaseSession | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [customLogoLoadError, setCustomLogoLoadError] = useState(false);

  const currentAppName = appSettings?.app_name || 'Atmetny';
  const currentAppLogoUrl = appSettings?.app_logo_url;
  const currentAppLogoHint = appSettings?.app_logo_hint;

  useEffect(() => {
    setIsLoadingUser(true);
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthUser(session?.user ?? null);
      setIsLoadingUser(false);
    }).catch(error => {
      console.error("Error getting initial Supabase session:", error);
      setIsLoadingUser(false);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      const currentUser = session?.user ?? null;
      setAuthUser(currentUser);
      setIsLoadingUser(false);
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    // Reset logo error state if the URL changes
    setCustomLogoLoadError(false);
    if (currentAppLogoUrl && currentAppLogoUrl.trim() !== "") {
      console.log(`[AppLayout] Attempting to load custom logo from URL: ${currentAppLogoUrl}`);
      if (!currentAppLogoUrl.startsWith('/') && !currentAppLogoUrl.startsWith('data:')) {
         console.warn(`[AppLayout] The logo URL "${currentAppLogoUrl}" is external. Ensure its hostname is whitelisted in next.config.ts's images.remotePatterns.`);
      }
    } else if (currentAppLogoUrl === "") {
      console.warn("[AppLayout] app_logo_url from settings is an empty string. Fallback SVG will be used.");
    } else {
      console.log("[AppLayout] app_logo_url is null or undefined. Fallback SVG will be used.");
    }
  }, [currentAppLogoUrl]);

  const handleLinkClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.push('/auth');
      if (isMobile) {
        setOpenMobile(false);
      }
    } catch (error) {
      console.error("Error signing out with Supabase: ", error);
    }
  };

  const displayName = authUser?.user_metadata?.full_name || authUser?.email?.split('@')[0] || "مستخدم";
  const displayEmail = authUser?.email || "";
  const avatarUrl = authUser?.user_metadata?.avatar_url;
  const avatarHint = 'person avatar';
  const avatarFallback = (displayName.length > 1 ? displayName.substring(0, 2) : displayName.charAt(0) || 'U').toUpperCase();

  const showCustomLogo = currentAppLogoUrl && currentAppLogoUrl.trim() !== "" && !customLogoLoadError;

  return (
    <>
      <Sidebar side="right" variant="sidebar" collapsible="icon">
        <SidebarHeader className="p-4 border-b border-sidebar-border">
          <Link href="/" className="flex items-center gap-2" onClick={handleLinkClick}>
            {showCustomLogo ? (
              <Image
                src={currentAppLogoUrl!} // Assert non-null because showCustomLogo checks it
                alt={`${currentAppName} Logo`}
                width={32}
                height={32}
                className="rounded-sm"
                data-ai-hint={currentAppLogoHint || 'application logo'}
                onError={(e) => {
                  console.error(`[AppLayout] Error loading logo image from ${currentAppLogoUrl}:`, (e.target as HTMLImageElement).src);
                  setCustomLogoLoadError(true);
                }}
              />
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-sidebar-primary">
                <path d="M12 .75a8.25 8.25 0 00-6.065 2.663A8.25 8.25 0 003.75 12c0 3.97 2.807 7.283 6.495 8.015A8.25 8.25 0 0012 21.75a8.25 8.25 0 008.25-8.25c0-4.019-2.863-7.34-6.635-8.092A8.255 8.255 0 0012 .75zM8.25 12a3.75 3.75 0 117.5 0 3.75 3.75 0 01-7.5 0z" />
                <path d="M8.625 9.375a.375.375 0 11-.75 0 .375.375 0 01.75 0zM15.375 9.375a.375.375 0 11-.75 0 .375.375 0 01.75 0zM11.25 12.375a.375.375 0 01.375-.375h.75a.375.375 0 01.375.375V15a.375.375 0 01-.375.375h-.75a.375.375 0 01-.375-.375V12.375z" />
              </svg>
            )}
            {state === 'expanded' && <h1 className="text-xl font-semibold text-sidebar-foreground">{currentAppName}</h1>}
          </Link>
        </SidebarHeader>
        <SidebarContent className="p-0">
          <ScrollArea className="h-full">
            <SidebarMenu className="p-4">
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <Link href={item.href} passHref>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === item.href}
                      tooltip={{ children: item.label, className: "text-xs" }}
                      onClick={handleLinkClick}
                    >
                      <span>
                        <item.icon />
                        <span>{item.label}</span>
                      </span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </ScrollArea>
        </SidebarContent>
        <SidebarFooter className="p-4 border-t border-sidebar-border">
          {isLoadingUser ? (
            <div className="flex items-center gap-3 mb-3 p-2">
              <Skeleton className="h-10 w-10 rounded-full" />
              {state === 'expanded' && (
                <div className="flex flex-col gap-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-32" />
                </div>
              )}
            </div>
          ) : authUser ? (
            <Link href="/profile" passHref onClick={handleLinkClick}>
              <div className="flex items-center gap-3 mb-3 cursor-pointer hover:bg-sidebar-accent/20 p-2 rounded-md transition-colors">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={avatarUrl} alt={displayName} data-ai-hint={avatarHint} />
                  <AvatarFallback>{avatarFallback}</AvatarFallback>
                </Avatar>
                {state === 'expanded' && (
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-sm font-medium text-sidebar-foreground truncate">{displayName}</span>
                    <span className="text-xs text-sidebar-foreground/70 truncate">{displayEmail}</span>
                  </div>
                )}
              </div>
            </Link>
          ) : (
             <Link href="/auth" passHref onClick={handleLinkClick}>
                <div className="flex items-center gap-3 mb-3 cursor-pointer hover:bg-sidebar-accent/20 p-2 rounded-md transition-colors">
                    <UserCircle className="h-10 w-10 text-sidebar-foreground/70"/>
                    {state === 'expanded' && (
                    <div className="flex flex-col">
                        <span className="text-sm font-medium text-sidebar-foreground">تسجيل الدخول</span>
                         <span className="text-xs text-sidebar-foreground/70">للوصول لميزاتك</span>
                    </div>
                    )}
                </div>
            </Link>
          )}
          {authUser && (
            <Button
              variant="ghost"
              className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              onClick={handleLogout}
            >
              <LogOut className="ms-2 h-4 w-4" />
              {state === 'expanded' && <span>تسجيل الخروج</span>}
            </Button>
          )}
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <header className="sticky top-0 z-10 flex items-center justify-between h-16 px-4 bg-background/80 backdrop-blur-sm border-b">
          <div className="flex items-center gap-1">
            {pathname !== '/' && (
              <Button variant="ghost" size="icon" aria-label="الرجوع" onClick={() => router.back()}>
                <ArrowRight />
              </Button>
            )}
            <SidebarTrigger className="md:hidden" />
          </div>
          <div className="flex-1 text-center md:text-start px-2">
            {/* Current Page Title Can Go Here */}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" aria-label="Toggle Theme" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
               <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
               <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
               <span className="sr-only">Toggle theme</span>
            </Button>
            <SidebarTrigger className="hidden md:flex" />
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          {children}
        </main>
        <footer className="py-4 px-6 border-t text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} {currentAppName}. جميع الحقوق محفوظة.
        </footer>
      </SidebarInset>
    </>
  );
}
