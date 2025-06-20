
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, FileText, Gift, Sparkles, Star, Users, LogIn, Zap, BookMarked, Medal } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useAppSettings } from "@/contexts/app-settings-context";
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { User as SupabaseAuthUser } from '@supabase/supabase-js';
import type { UserProfile, Badge as UserBadgeType, Reward as UserRewardType } from '@/lib/types';
import { getUserProfile } from '@/lib/userProfileService';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from "@/lib/utils";
import { useCustomTheme } from "@/contexts/custom-theme-provider"; // Import theme hook

export default function HomePage() {
  const { settings } = useAppSettings();
  const { selectedThemeId } = useCustomTheme(); // Get selected theme
  const appName = settings?.app_name || "Atmetny";

  const [authUser, setAuthUser] = useState<SupabaseAuthUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  useEffect(() => {
    const fetchUserAndProfile = async () => {
      setIsLoadingProfile(true);
      const { data: { session } } = await supabase.auth.getSession();
      setAuthUser(session?.user ?? null);

      if (session?.user) {
        try {
          const profile = await getUserProfile(session.user.id);
          setUserProfile(profile);
        } catch (error) {
          console.error("Error fetching user profile for homepage:", error);
          setUserProfile(null);
        }
      } else {
        setUserProfile(null);
      }
      setIsLoadingProfile(false);
    };

    fetchUserAndProfile();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setIsLoadingProfile(true);
      const currentUser = session?.user ?? null;
      setAuthUser(currentUser);
      if (currentUser) {
        try {
          const profile = await getUserProfile(currentUser.id);
          setUserProfile(profile);
        } catch (error) {
          console.error("Error fetching profile on auth change for homepage:", error);
          setUserProfile(null);
        }
      } else {
        setUserProfile(null);
      }
      setIsLoadingProfile(false);
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const displayPoints = userProfile?.points ?? 0;
  const latestBadgeName = userProfile?.badges && userProfile.badges.length > 0
    ? userProfile.badges[0].name
    : "لا شارات بعد";
  const latestRewardName = userProfile?.rewards && userProfile.rewards.length > 0
    ? userProfile.rewards[0].name
    : "لا مكافآت بعد";

  const defaultHomepageDescription = `✨ اجعل النجاح عادة!
منصتك التعليمية الشاملة للدراسة الذكية والاستعداد للاختبارات المؤتمتة في سوريا.
📚 ابدأ الآن وكن من صُنّاع التفوق.`;

  const homepageText = settings?.homepage_description && settings.homepage_description.trim() !== ''
    ? settings.homepage_description
    : defaultHomepageDescription;

  const isAtmetyTechTheme = selectedThemeId === 'atmety-tech';

  return (
    <div className="space-y-8">
      <header className={cn(
        "relative rounded-lg overflow-hidden p-8 md:p-12 min-h-[350px] flex flex-col justify-center items-center text-center shadow-lg",
        !isAtmetyTechTheme && "bg-gradient-to-br from-primary to-secondary" // Apply default gradient only if not Atmety Tech
        // Atmety Tech theme will apply its own body background via globals.css (--app-bg-actual)
      )}>
        {!isAtmetyTechTheme && <div className="absolute inset-0 bg-black/30"></div>}
        <div className={cn("relative z-10", isAtmetyTechTheme && "mt-0")}>
          <h1 className={cn(
            "text-4xl md:text-5xl font-bold mb-4",
            isAtmetyTechTheme ? "gradient-text" : "text-gradient-primary" // Use user's .gradient-text for Atmety Tech
          )}>
            مرحباً بك في {appName}!
          </h1>
          <p className={cn(
            "text-lg md:text-xl max-w-2xl mx-auto mb-8 whitespace-pre-line",
            isAtmetyTechTheme ? "text-[var(--user-text-secondary)]" : "text-primary-foreground/90"
          )}>
            {homepageText}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button
              asChild
              size="lg"
              className={cn(isAtmetyTechTheme && "gradient-bg-primary-button gradient-bg-primary-button-hover modern-shadow-light hover:shadow-lg transform hover:scale-105")}
            >
              <Link href="/study">
                <BookMarked className="ms-2 h-5 w-5" />
                الدراسة
              </Link>
            </Button>
             <Button
              asChild
              size="lg"
              variant={isAtmetyTechTheme ? "outline" : "default"}
              className={cn(isAtmetyTechTheme && "border-[var(--user-gradient-accent-start)] text-[var(--user-gradient-accent-start)] hover:gradient-bg-primary-button hover:text-white modern-shadow-light hover:shadow-md transform hover:scale-105")}
            >
              <Link href="/exams">
                 <FileText className="ms-2 h-5 w-5" />
                الاختبارات العامة
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant={isAtmetyTechTheme ? "outline" : "default"}
              className={cn(isAtmetyTechTheme && "border-[var(--user-gradient-accent-start)] text-[var(--user-gradient-accent-start)] hover:gradient-bg-primary-button hover:text-white modern-shadow-light hover:shadow-md transform hover:scale-105")}
            >
               <Link href={authUser ? "/profile" : "/auth"}>
                <Medal className="ms-2 h-5 w-5" />
                الإنجازات
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Section with Community, AI Analysis, and Training Exams cards has been removed */}

      <section className="mt-12">
        <h2 className={cn("text-3xl font-bold mb-8 text-center", isAtmetyTechTheme ? "gradient-text" : "text-foreground")}>إنجازاتك وجوائزك</h2>
        {isLoadingProfile ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className={cn("text-center", isAtmetyTechTheme && "card-gradient-background modern-shadow-light")}>
                <CardContent className="pt-6 flex flex-col items-center gap-2">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-5 w-24 mb-1" />
                  <Skeleton className="h-4 w-20" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : authUser && userProfile ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className={cn("text-center hover:shadow-xl transition-shadow duration-300 transform hover:scale-105", isAtmetyTechTheme && "card-gradient-background modern-shadow-light")}>
                <CardContent className="pt-5 flex flex-col items-center">
                  <Star className={cn("h-8 w-8 mb-2", isAtmetyTechTheme ? "text-[var(--user-gradient-accent-start)]" : "text-accent-foreground")} />
                  <h4 className={cn("font-semibold", isAtmetyTechTheme && "text-[var(--user-gradient-red-start)]")}>نقاطك الحالية</h4>
                  <p className={cn("text-sm", isAtmetyTechTheme ? "text-[var(--user-text-secondary)]" : "text-muted-foreground")}>{displayPoints.toLocaleString('ar-SA')} نقطة</p>
                </CardContent>
              </Card>
              <Card className={cn("text-center hover:shadow-xl transition-shadow duration-300 transform hover:scale-105", isAtmetyTechTheme && "card-gradient-background modern-shadow-light")}>
                <CardContent className="pt-5 flex flex-col items-center">
                  <Award className={cn("h-8 w-8 mb-2", isAtmetyTechTheme ? "text-[var(--user-gradient-accent-end)]" : "text-accent-foreground")} />
                  <h4 className={cn("font-semibold", isAtmetyTechTheme && "text-[var(--user-gradient-red-start)]")}>أحدث شارة</h4>
                  <p className={cn("text-sm", isAtmetyTechTheme ? "text-[var(--user-text-secondary)]" : "text-muted-foreground")}>{latestBadgeName}</p>
                </CardContent>
              </Card>
              <Card className={cn("text-center hover:shadow-xl transition-shadow duration-300 transform hover:scale-105", isAtmetyTechTheme && "card-gradient-background modern-shadow-light")}>
                <CardContent className="pt-5 flex flex-col items-center">
                  <Gift className={cn("h-8 w-8 mb-2", isAtmetyTechTheme ? "text-[var(--user-gradient-accent-start)]" : "text-accent-foreground")} />
                  <h4 className={cn("font-semibold", isAtmetyTechTheme && "text-[var(--user-gradient-red-start)]")}>المكافآت</h4>
                  <p className={cn("text-sm", isAtmetyTechTheme ? "text-[var(--user-text-secondary)]" : "text-muted-foreground")}>{latestRewardName}</p>
                </CardContent>
              </Card>
               <Card className={cn("text-center hover:shadow-xl transition-shadow duration-300 transform hover:scale-105", isAtmetyTechTheme && "card-gradient-background modern-shadow-light")}>
                <CardContent className="pt-5 flex flex-col items-center">
                  <Zap className={cn("h-8 w-8 mb-2", isAtmetyTechTheme ? "text-[var(--user-gradient-red-end)]" : "text-accent-foreground")} />
                   <h4 className={cn("font-semibold", isAtmetyTechTheme && "text-[var(--user-gradient-red-start)]")}>سلسلة الأيام</h4>
                  <p className={cn("text-sm", isAtmetyTechTheme ? "text-[var(--user-text-secondary)]" : "text-muted-foreground")}>0 أيام</p>
                </CardContent>
              </Card>
            </div>
            <div className="mt-4 text-center">
              <Button variant="link" asChild className={cn(isAtmetyTechTheme && "text-[var(--user-gradient-accent-start)] hover:text-[var(--user-gradient-accent-end)]")}>
                <Link href="/profile">عرض كل الإنجازات</Link>
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
             <Card className={cn("text-center", isAtmetyTechTheme && "card-gradient-background modern-shadow-light")}>
                <CardContent className="pt-5 flex flex-col items-center">
                  <Star className={cn("h-8 w-8 mb-2", isAtmetyTechTheme ? "text-[var(--user-gradient-accent-start)]" : "text-accent-foreground")} />
                   <h4 className={cn("font-semibold", isAtmetyTechTheme && "text-[var(--user-gradient-red-start)]")}>نقاطك الحالية</h4>
                  <p className={cn("text-sm", isAtmetyTechTheme ? "text-[var(--user-text-secondary)]" : "text-muted-foreground")}>0 نقطة</p>
                </CardContent>
              </Card>
              <Card className={cn("text-center", isAtmetyTechTheme && "card-gradient-background modern-shadow-light")}>
                <CardContent className="pt-5 flex flex-col items-center">
                  <Award className={cn("h-8 w-8 mb-2", isAtmetyTechTheme ? "text-[var(--user-gradient-accent-end)]" : "text-accent-foreground")} />
                  <h4 className={cn("font-semibold", isAtmetyTechTheme && "text-[var(--user-gradient-red-start)]")}>أحدث شارة</h4>
                  <p className={cn("text-sm", isAtmetyTechTheme ? "text-[var(--user-text-secondary)]" : "text-muted-foreground")}>ابدأ التعلم!</p>
                </CardContent>
              </Card>
              <Card className={cn("text-center", isAtmetyTechTheme && "card-gradient-background modern-shadow-light")}>
                <CardContent className="pt-5 flex flex-col items-center">
                  <Gift className={cn("h-8 w-8 mb-2", isAtmetyTechTheme ? "text-[var(--user-gradient-accent-start)]" : "text-accent-foreground")} />
                  <h4 className={cn("font-semibold", isAtmetyTechTheme && "text-[var(--user-gradient-red-start)]")}>المكافآت</h4>
                  <p className={cn("text-sm", isAtmetyTechTheme ? "text-[var(--user-text-secondary)]" : "text-muted-foreground")}>لا مكافآت بعد</p>
                </CardContent>
              </Card>
              <Card className={cn("text-center", isAtmetyTechTheme && "card-gradient-background modern-shadow-light")}>
                <CardContent className="pt-5 flex flex-col items-center">
                  <Zap className={cn("h-8 w-8 mb-2", isAtmetyTechTheme ? "text-[var(--user-gradient-red-end)]" : "text-accent-foreground")} />
                   <h4 className={cn("font-semibold", isAtmetyTechTheme && "text-[var(--user-gradient-red-start)]")}>سلسلة الأيام</h4>
                  <p className={cn("text-sm", isAtmetyTechTheme ? "text-[var(--user-text-secondary)]" : "text-muted-foreground")}>0 أيام</p>
                </CardContent>
              </Card>
            </div>
             <div className="mt-4 text-center">
                <p className={cn("text-sm mb-2", isAtmetyTechTheme ? "text-[var(--user-text-secondary)]" : "text-muted-foreground")}>سجل الدخول لعرض إنجازاتك وتتبع تقدمك.</p>
                <Button asChild className={cn(isAtmetyTechTheme && "gradient-bg-primary-button gradient-bg-primary-button-hover modern-shadow-light")}>
                  <Link href="/auth">
                    <LogIn className="ms-2 h-4 w-4"/>
                    تسجيل الدخول
                  </Link>
                </Button>
              </div>
          </>
        )}
      </section>

    </div>
  );
}
