
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, Brain, FileText, Gift, Sparkles, Star, Users, BookOpen, Newspaper, Megaphone, LogIn } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useAppSettings } from "@/contexts/app-settings-context";
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { User as SupabaseAuthUser } from '@supabase/supabase-js';
import type { UserProfile, Badge as UserBadgeType, Reward as UserRewardType } from '@/lib/types';
import { getUserProfile } from '@/lib/userProfileService';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from "@/lib/utils"; // Import cn for conditional classes

export default function HomePage() {
  const { settings } = useAppSettings();
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
          setUserProfile(null); // Ensure profile is null on error
        }
      } else {
        setUserProfile(null); // No user, so no profile
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

  return (
    <div className="space-y-8">
      <header className="relative rounded-lg overflow-hidden p-8 md:p-12 min-h-[350px] flex flex-col justify-center items-center text-center bg-gradient-to-br from-primary to-secondary shadow-lg">
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="relative z-10">
          <h1 className={cn(
            "text-4xl md:text-5xl font-bold mb-4",
            "text-gradient-primary" // Always apply primary text gradient for homepage title
          )}>
            مرحباً بك في {appName}!
          </h1>
          <p className="text-lg md:text-xl text-primary-foreground/90 max-w-2xl mx-auto mb-8 whitespace-pre-line">
            {homepageText}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild size="lg">
              <Link href="/study">
                <BookOpen className="ms-2 h-5 w-5" />
                الدراسة
              </Link>
            </Button>
            <Button asChild size="lg">
              <Link href="/news">
                <Newspaper className="ms-2 h-5 w-5" />
                آخر الأخبار
              </Link>
            </Button>
            <Button asChild size="lg">
              <Link href="/announcements">
                <Megaphone className="ms-2 h-5 w-5" />
                الإعلانات
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <FileText className="h-10 w-10 text-primary mb-2" />
            <CardTitle>الاختبارات التدريبية</CardTitle>
            <CardDescription>اكتشف مجموعة واسعة من الاختبارات المخصصة.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>تدرب على أسئلة متنوعة من إعداد أفضل المدرسين في مختلف المواد الدراسية.</p>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/exams">تصفح الاختبارات</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card className="hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <Sparkles className="h-10 w-10 text-primary mb-2" />
            <CardTitle>تحليل الأداء الذكي</CardTitle>
            <CardDescription>احصل على رؤى مخصصة لتحسين أدائك.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>استخدم الذكاء الاصطناعي لتحليل نتائج اختباراتك وتحديد نقاط القوة والضعف.</p>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/ai-analysis">ابدأ التحليل الآن</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card className="hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <Users className="h-10 w-10 text-primary mb-2" />
            <CardTitle>مجتمع تفاعلي</CardTitle>
            <CardDescription>تواصل مع الطلاب والمعلمين.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>شارك في النقاشات، اطرح الأسئلة، وتبادل المعرفة مع زملائك ومعلميك.</p>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/community">انضم إلى المجتمع</Link>
            </Button>
          </CardFooter>
        </Card>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4 text-center">إنجازاتك وجوائزك</h2>
        {isLoadingProfile ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="bg-accent/20">
              <CardContent className="pt-6 flex items-center gap-4">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div>
                  <Skeleton className="h-5 w-32 mb-1" />
                  <Skeleton className="h-7 w-24" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-accent/20">
              <CardContent className="pt-6 flex items-center gap-4">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div>
                  <Skeleton className="h-5 w-28 mb-1" />
                  <Skeleton className="h-6 w-36" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-accent/20">
              <CardContent className="pt-6 flex items-center gap-4">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div>
                  <Skeleton className="h-5 w-24 mb-1" />
                  <Skeleton className="h-6 w-32" />
                </div>
              </CardContent>
            </Card>
          </div>
        ) : authUser && userProfile ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card className="bg-accent/20">
                <CardContent className="pt-6 flex items-center gap-4">
                  <Star className="h-8 w-8 text-accent-foreground" />
                  <div>
                    <p className="text-lg font-semibold">نقاطك الحالية</p>
                    <p className="text-2xl font-bold text-accent-foreground">{displayPoints.toLocaleString('ar-SA')} نقطة</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-accent/20">
                <CardContent className="pt-6 flex items-center gap-4">
                  <Award className="h-8 w-8 text-accent-foreground" />
                  <div>
                    <p className="text-lg font-semibold">أحدث شارة</p>
                    <p className="text-xl font-bold text-accent-foreground">{latestBadgeName}</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-accent/20">
                <CardContent className="pt-6 flex items-center gap-4">
                  <Gift className="h-8 w-8 text-accent-foreground" />
                  <div>
                    <p className="text-lg font-semibold">المكافآت</p>
                    <p className="text-xl font-bold text-accent-foreground">{latestRewardName}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="mt-4 text-center">
              <Button variant="link" asChild>
                <Link href="/profile">عرض كل الإنجازات</Link>
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
             <Card className="bg-accent/20">
                <CardContent className="pt-6 flex items-center gap-4">
                  <Star className="h-8 w-8 text-accent-foreground" />
                  <div>
                    <p className="text-lg font-semibold">نقاطك الحالية</p>
                    <p className="text-2xl font-bold text-accent-foreground">0 نقطة</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-accent/20">
                <CardContent className="pt-6 flex items-center gap-4">
                  <Award className="h-8 w-8 text-accent-foreground" />
                  <div>
                    <p className="text-lg font-semibold">أحدث شارة</p>
                    <p className="text-xl font-bold text-accent-foreground">ابدأ التعلم!</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-accent/20">
                <CardContent className="pt-6 flex items-center gap-4">
                  <Gift className="h-8 w-8 text-accent-foreground" />
                  <div>
                    <p className="text-lg font-semibold">المكافآت</p>
                    <p className="text-xl font-bold text-accent-foreground">لا مكافآت بعد</p>
                  </div>
                </CardContent>
              </Card>
            </div>
             <div className="mt-4 text-center">
                <p className="text-sm text-muted-foreground mb-2">سجل الدخول لعرض إنجازاتك وتتبع تقدمك.</p>
                <Button asChild>
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
    
