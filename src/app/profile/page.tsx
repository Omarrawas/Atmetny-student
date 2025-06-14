
'use client';

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge as UiBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import * as Icons from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { UserProfile, Badge, Reward, LucideIconName } from '@/lib/types';
import { supabase } from "@/lib/supabaseClient"; // Changed from Firebase
import type { User as SupabaseAuthUser } from '@supabase/supabase-js'; // Supabase user type
import { getUserProfile } from "@/lib/userProfileService"; // Supabase version
import { Skeleton } from "@/components/ui/skeleton"; 
import { useRouter } from "next/navigation"; // For redirect

// Helper function to get Lucide icon component by name
const getIcon = (iconName?: LucideIconName): React.ElementType => {
  if (!iconName) return Icons.HelpCircle; 
  const IconComponent = Icons[iconName as keyof typeof Icons];
  return IconComponent || Icons.HelpCircle; 
};

// Helper to format ISO date string to a readable date string
const formatDate = (isoDateString: string | undefined): string => {
  if (!isoDateString) return 'غير محدد';
  try {
    return new Date(isoDateString).toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' });
  } catch (e) {
    console.error("Error formatting date:", e, "Input was:", isoDateString);
    return "تاريخ غير صالح";
  }
};


export default function ProfilePage() {
  const [authUser, setAuthUser] = useState<SupabaseAuthUser | null>(null); // Supabase auth user
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const getSessionAndProfile = async () => {
      setIsLoading(true);
      setError(null);
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        console.error("Error getting Supabase session:", sessionError);
        setError("حدث خطأ في الاتصال بالمصادقة.");
        setIsLoading(false);
        return;
      }

      if (session?.user) {
        setAuthUser(session.user);
        try {
          const profile = await getUserProfile(session.user.id);
          if (profile) {
            setUserProfile(profile);
          } else {
            // Profile might not exist yet if it's a new signup and profile creation is pending
            // Or if there's an issue with profile table/permissions
            console.log("Profile not found for user, might be new or an issue fetching.");
            // We could try to create a default one here, or show a message.
            // For now, AppLayout might show basic info.
            // If using RLS, ensure policies allow the user to read their own profile.
          }
        } catch (e) {
          console.error("Error fetching Supabase profile:", e);
          setError("حدث خطأ أثناء تحميل ملفك الشخصي.");
        }
      } else {
        setAuthUser(null);
        setUserProfile(null);
        // router.push('/auth'); // Redirect if no session
      }
      setIsLoading(false);
    };

    getSessionAndProfile();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Supabase auth state changed in ProfilePage. Event:", event, "Session:", session);
      const currentUser = session?.user ?? null;
      setAuthUser(currentUser);
      if (currentUser) {
        setIsLoading(true); // Start loading when auth user changes
        try {
          const profile = await getUserProfile(currentUser.id);
          setUserProfile(profile);
        } catch (e) {
          console.error("Error fetching profile on auth state change:", e);
          setError("خطأ في تحديث بيانات الملف الشخصي.");
          setUserProfile(null);
        } finally {
          setIsLoading(false);
        }
      } else {
        setUserProfile(null);
        setIsLoading(false); // No user, so loading is complete
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [router]);

  if (isLoading) {
    return (
      <div className="space-y-8">
        <Card className="overflow-hidden shadow-lg">
          <Skeleton className="h-32 md:h-40 w-full" />
          <div className="p-6 flex flex-col md:flex-row items-center md:items-end gap-6 -mt-16 md:-mt-20 relative z-10">
            <Skeleton className="h-32 w-32 rounded-full border-4 border-background shadow-md" />
            <div className="text-center md:text-start flex-grow">
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-5 w-64" />
            </div>
            <Skeleton className="h-10 w-36 rounded-md" />
          </div>
          <CardContent className="pt-0">
            <Skeleton className="h-4 w-full mb-1" />
            <Skeleton className="h-4 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-destructive-foreground bg-destructive p-4 rounded-md">{error}</div>;
  }
  
  if (!authUser) { // Check authUser (from Supabase session) instead of currentUser
     return (
      <div className="text-center py-10">
        <p className="text-lg text-muted-foreground mb-4">الرجاء تسجيل الدخول لعرض ملفك الشخصي.</p>
        <Button asChild>
          <Link href="/auth">تسجيل الدخول</Link>
        </Button>
      </div>
    );
  }

  const displayName = userProfile?.name || authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || "مستخدم";
  const displayEmail = userProfile?.email || authUser.email || "لا يوجد بريد إلكتروني";
  const displayAvatarUrl = userProfile?.avatarUrl || authUser.user_metadata?.avatar_url || `https://placehold.co/150x150.png?text=${displayName.charAt(0).toUpperCase()}`;
  const displayAvatarHint = userProfile?.avatarHint || 'person avatar';
  
  const displayLevel = userProfile?.level ?? 1;
  const displayProgress = userProfile?.progressToNextLevel ?? 0;
  const displayPoints = userProfile?.points ?? 0;
  const displayBadges = userProfile?.badges ?? [];
  const displayRewards = userProfile?.rewards ?? [];


  return (
    <div className="space-y-8">
      <Card className="overflow-hidden shadow-lg">
        <div className="bg-gradient-to-br from-primary to-secondary h-32 md:h-40" />
        <div className="p-6 flex flex-col md:flex-row items-center md:items-end gap-6 -mt-16 md:-mt-20 relative z-10">
          <Avatar className="h-32 w-32 border-4 border-background shadow-md">
            <AvatarImage src={displayAvatarUrl} alt={displayName} data-ai-hint={displayAvatarHint}/>
            <AvatarFallback>{displayName.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="text-center md:text-start flex-grow">
            <h1 className="text-3xl font-bold">{displayName}</h1>
            <p className="text-muted-foreground">{displayEmail}</p>
            <UiBadge variant="outline" className="mt-1">المستوى {displayLevel}</UiBadge>
          </div>
          <Button variant="outline" asChild>
            <Link href="/profile/edit">
              <Icons.Edit3 className="ms-2 h-4 w-4" />
              تعديل الملف الشخصي
            </Link>
          </Button>
        </div>
        <CardContent className="pt-0">
          <div className="mb-4">
            <div className="flex justify-between text-sm text-muted-foreground mb-1">
              <span>التقدم للمستوى التالي ({displayLevel + 1})</span>
              <span>{displayProgress}%</span>
            </div>
            <Progress value={displayProgress} aria-label={`التقدم للمستوى ${displayLevel + 1}`} />
          </div>
          {userProfile?.createdAt && (
            <p className="text-xs text-muted-foreground">تاريخ الإنشاء: {formatDate(userProfile.createdAt)}</p>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icons.Star className="text-yellow-500" />
              النقاط
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-5xl font-bold text-center text-primary">{displayPoints.toLocaleString('ar-SA')}</p>
            <p className="text-sm text-muted-foreground text-center mt-2">استمر في التعلم لجمع المزيد من النقاط!</p>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icons.Award className="text-orange-500" />
              الشارات المكتسبة
            </CardTitle>
            <CardDescription>عرض الشارات التي حصلت عليها لإنجازاتك.</CardDescription>
          </CardHeader>
          <CardContent>
            {displayBadges.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {displayBadges.map(badge => {
                  const BadgeIcon = getIcon(badge.iconName); 
                  return (
                    <div key={badge.id} className="flex flex-col items-center text-center p-3 border rounded-lg hover:shadow-md transition-shadow">
                      <Image src={badge.image} alt={badge.name} width={64} height={64} className="mb-2 rounded-full" data-ai-hint={badge.imageHint} />
                      <p className="text-sm font-medium">{badge.name}</p>
                      <p className="text-xs text-muted-foreground">مكتسبة في: {formatDate(badge.date)}</p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">لم تحصل على أي شارات بعد. ابدأ بحل الاختبارات!</p>
            )}
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icons.Gift className="text-green-500" />
            المكافآت والخصومات
          </CardTitle>
          <CardDescription>تحقق من المكافآت التي يمكنك استخدامها.</CardDescription>
        </CardHeader>
        <CardContent>
          {displayRewards.length > 0 ? (
            <ul className="space-y-3">
              {displayRewards.map(reward => {
                const RewardIcon = getIcon(reward.iconName);
                return (
                  <li key={reward.id} className="flex items-center justify-between p-3 border rounded-lg bg-secondary/30">
                    <div className="flex items-center gap-3">
                      <RewardIcon className="h-6 w-6 text-green-600" />
                      <div>
                        <p className="font-medium">{reward.name}</p>
                        <p className="text-xs text-muted-foreground">صالح حتى: {formatDate(reward.expiry)}</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">استخدام</Button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-muted-foreground text-center py-4">لا توجد مكافآت متاحة حالياً. أكمل التحديات لربح المزيد!</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Icons.Briefcase /> الجامعة والتخصص</CardTitle>
        </CardHeader>
        <CardContent>
            <p><strong>الجامعة:</strong> {userProfile?.university || 'غير محدد'}</p>
            <p><strong>التخصص:</strong> {userProfile?.major || 'غير محدد'}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Icons.Target /> أهدافي الدراسية</CardTitle>
          <CardDescription>حدد أهدافك وتتبع تقدمك نحوها.</CardDescription>
        </CardHeader>
        <CardContent className="text-center text-muted-foreground py-6">
            <p>{userProfile?.studentGoals || 'لم يتم تحديد أهداف دراسية بعد.'}</p>
            <Button variant="link" className="mt-2" asChild><Link href="/profile/edit">تعديل الأهداف</Link></Button>
        </CardContent>
      </Card>
    </div>
  );
}
