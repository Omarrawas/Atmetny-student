
'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getSectionById, getSectionLessons } from '@/lib/examService';
import type { SubjectSection, Lesson, UserProfile } from '@/lib/types'; 
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronRight, BookText, Loader2, AlertTriangle, ListChecks, PlayCircle, Lock } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient'; 
import type { User as SupabaseAuthUser } from '@supabase/supabase-js';
import { getUserProfile } from '@/lib/userProfileService';
import { useToast } from "@/hooks/use-toast";
import { cn } from '@/lib/utils';

export default function SectionLessonsPage() {
  const params = useParams();
  const router = useRouter();
  const subjectId = params.subjectId as string; // UUID
  const sectionId = params.sectionId as string; // UUID
  const branch = params.branch as string;

  const [section, setSection] = useState<SubjectSection | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [authUser, setAuthUser] = useState<SupabaseAuthUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoadingAuthProfile, setIsLoadingAuthProfile] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    setIsLoadingData(true);
    setError(null);
    if (subjectId && sectionId) {
      const fetchData = async () => {
        try {
          const [sectionData, lessonsData] = await Promise.all([
            getSectionById(subjectId, sectionId), 
            getSectionLessons(subjectId, sectionId), // This will return [] and log warning
          ]);

          if (!sectionData) {
            setError(`لم يتم العثور على القسم بالمعرف: ${sectionId}.`);
            setSection(null);
            setLessons([]);
            toast({ title: "خطأ", description: `لم يتم العثور على تفاصيل القسم.`, variant: "destructive" });
          } else {
            setSection(sectionData);
          }
          setLessons(lessonsData);
          if (sectionData && lessonsData.length === 0) {
            toast({ title: "تنبيه", description: `قائمة دروس القسم "${sectionData.title}" تحتاج للتحديث لـ Supabase.`, variant: "default" });
          }

        } catch (e: any) {
          console.error("Failed to fetch section lessons data (Supabase):", e);
          setError("فشل تحميل بيانات دروس القسم. يرجى المحاولة مرة أخرى.");
          setSection(null);
          setLessons([]);
          toast({ title: "خطأ فادح", description: "فشل تحميل بيانات دروس القسم.", variant: "destructive" });
        } finally {
          setIsLoadingData(false);
        }
      };
      fetchData();
    } else {
      setIsLoadingData(false);
      setError("معرفات المادة أو القسم غير متوفرة.");
    }
  }, [subjectId, sectionId, toast]);

  useEffect(() => {
    const getSessionAndProfile = async () => {
      setIsLoadingAuthProfile(true);
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user ?? null;
      setAuthUser(user);
      if (user) {
        try {
          const profile = await getUserProfile(user.id);
          setUserProfile(profile);
        } catch (profileError) {
          console.error("Error fetching user profile in SectionLessonsPage:", profileError);
          setUserProfile(null);
          toast({ title: "خطأ", description: "لم نتمكن من تحميل بيانات المستخدم.", variant: "destructive"});
        }
      } else {
        setUserProfile(null);
      }
      setIsLoadingAuthProfile(false);
    };

    getSessionAndProfile();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      const user = session?.user ?? null;
      setAuthUser(user);
      if (user) {
        setIsLoadingAuthProfile(true);
        try {
          const profile = await getUserProfile(user.id);
          setUserProfile(profile);
        } catch (profileError) {
          console.error("Error fetching user profile on auth change in SectionLessonsPage:", profileError);
          setUserProfile(null);
        } finally {
          setIsLoadingAuthProfile(false);
        }
      } else {
        setUserProfile(null);
        setIsLoadingAuthProfile(false);
      }
    });
    return () => authListener.subscription.unsubscribe();
  }, [toast]);

  const isSubjectActiveForCurrentUser = useMemo(() => {
    if (!authUser || !userProfile || !userProfile.activeSubscription) {
      return false;
    }
    const sub = userProfile.activeSubscription;
    const now = new Date(); 
    const endDate = new Date(sub.endDate);

    if (sub.status !== 'active' || endDate < now) {
      return false;
    }

    const isGeneralSubscription = !sub.subjectId || sub.subjectId.trim() === "";
    const isSpecificSubjectMatch = sub.subjectId === subjectId; // subjectId is from route params

    return isGeneralSubscription || isSpecificSubjectMatch;
  }, [userProfile, subjectId, authUser]);

  if (isLoadingData || isLoadingAuthProfile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">
          {isLoadingData ? 'جاري تحميل دروس القسم...' : 'جاري تحميل بيانات المستخدم...'}
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center">
        <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
        <p className="text-lg text-destructive mb-4">{error}</p>
        <Button onClick={() => router.back()} variant="outline">
          العودة
        </Button>
      </div>
    );
  }

  if (!section) {
    return (
      <div className="text-center py-10">
         <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
        <p className="text-lg text-muted-foreground">لم يتم العثور على القسم.</p>
         <Button onClick={() => router.back()} variant="outline" className="mt-4">
          العودة
        </Button>
      </div>
    );
  }
  
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <ListChecks className="h-8 w-8 text-primary" />
            <CardTitle className="text-3xl font-bold">{section.title}</CardTitle>
          </div>
          {/* section.description was removed as it's not in the DB schema */}
          {/* For example, if you wanted to show the section type: */}
          {section.type && (
            <CardDescription className="text-md">
              نوع القسم: {section.type}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          {lessons.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <BookText className="h-10 w-10 mx-auto mb-2" />
              <p className="text-lg">لا توجد دروس متاحة لهذا القسم حاليًا. (أو الخدمة تحتاج للتحديث لـ Supabase)</p>
            </div>
          ) : (
            <ul className="space-y-4">
              {lessons.map((lesson, index) => {
                const isFirstLesson = index === 0;
                // Use section.is_locked for section-level lock, and lesson.isLocked for lesson-level lock
                const sectionIsLockedByAdmin = section.is_locked === true;
                const lessonIsLockedByAdminSetting = lesson.isLocked === true || String(lesson.isLocked).toLowerCase() === "true";
                const lessonIsOpenByAdminSetting = lesson.isLocked === false || String(lesson.isLocked).toLowerCase() === "false";

                // Determine if lesson is locked by its own admin setting, or inherits section lock
                let effectiveIsLockedByAdmin: boolean;
                if (lessonIsOpenByAdminSetting) { // Lesson explicitly open
                  effectiveIsLockedByAdmin = false; 
                } else if (lessonIsLockedByAdminSetting) { // Lesson explicitly locked
                  effectiveIsLockedByAdmin = true; 
                } else { // Lesson inherits lock status
                    // If section itself is locked by admin, all its lessons (without explicit open) are locked
                    // If section is not locked by admin, then only non-first lessons (without explicit open) are locked by default
                    effectiveIsLockedByAdmin = sectionIsLockedByAdmin ? true : !isFirstLesson;
                }
                
                // Determine if the lesson should be displayed as locked to the current user
                let displayAsLocked;
                if (effectiveIsLockedByAdmin === false) { // If admin set it as open, it's always open
                  displayAsLocked = false;
                } else { // Otherwise, check user's subscription
                  displayAsLocked = !isSubjectActiveForCurrentUser;
                }
                
                const lessonPath = `/study/${branch}/${subjectId}/${sectionId}/${lesson.id}`;
                const linkHref = displayAsLocked ? '#' : lessonPath;

                const handleLessonClick = (e: React.MouseEvent) => {
                  if (displayAsLocked) {
                    e.preventDefault();
                    if (!authUser) {
                        toast({
                            title: "تسجيل الدخول مطلوب",
                            description: "يرجى تسجيل الدخول أولاً ثم تفعيل المادة للوصول لهذا الدرس.",
                            variant: "destructive",
                            action: ( <Button onClick={() => router.push('/auth')} size="sm"> تسجيل الدخول </Button> ),
                        });
                    } else { 
                        toast({
                        title: "الدرس مقفل",
                        description: "يرجى تفعيل اشتراكك في هذه المادة أو اشتراك عام للوصول لهذا الدرس.",
                        variant: "default", 
                        action: ( <Button onClick={() => router.push('/activate-qr')} size="sm"> تفعيل الاشتراك الآن </Button> ),
                        });
                    }
                  }
                };
                
                return (
                  <li key={lesson.id}>
                    <Link
                      href={linkHref}
                      onClick={handleLessonClick}
                      passHref
                      aria-disabled={displayAsLocked}
                      className={cn("block", displayAsLocked && "cursor-default" )}
                    >
                      <Card className={cn("transition-shadow group", displayAsLocked ? "bg-muted/60 hover:shadow-none opacity-70" : "hover:shadow-md cursor-pointer")}>
                        <CardContent className="p-4 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {displayAsLocked ? ( <Lock className="h-5 w-5 text-primary" /> ) : ( <PlayCircle className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" /> )}
                            <h3 className={cn("text-xl font-semibold transition-colors", !displayAsLocked && "group-hover:text-primary")}> {lesson.title} </h3>
                          </div>
                          {!displayAsLocked && <ChevronRight className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />}
                          {displayAsLocked && <span className="text-xs text-muted-foreground pe-2">(مقفل)</span>}
                        </CardContent>
                      </Card>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
       <div className="text-center mt-8">
        <Button onClick={() => router.back()} variant="outline">
          <ChevronRight className="ms-2 h-4 w-4" /> 
          العودة إلى الأقسام
        </Button>
      </div>
    </div>
  );
}

