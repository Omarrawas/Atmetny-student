
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
    console.log("[SectionLessonsPage] useEffect for auth and profile triggered.");
    setIsLoadingAuthProfile(true);
    const getSessionAndProfile = async () => {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error("[SectionLessonsPage] Supabase error getting session:", sessionError);
        setError("حدث خطأ أثناء التحقق من جلسة المستخدم.");
        setIsLoadingAuthProfile(false);
        return;
      }

      const user = session?.user ?? null;
      setAuthUser(user);
      console.log("[SectionLessonsPage] Auth user set:", user ? user.id : 'null');

      if (user) {
        try {
          const profile = await getUserProfile(user.id);
          console.log("[SectionLessonsPage] Fetched user profile:", JSON.stringify(profile, null, 2));
          setUserProfile(profile);
        } catch (profileError: any) {
          console.error("[SectionLessonsPage] Error fetching user profile:", profileError);
          setUserProfile(null);
          toast({ title: "خطأ", description: `لم نتمكن من تحميل بيانات المستخدم: ${profileError.message}`, variant: "destructive"});
        }
      } else {
        setUserProfile(null);
        console.log("[SectionLessonsPage] No authenticated user session found.");
      }
      setIsLoadingAuthProfile(false);
      console.log("[SectionLessonsPage] Finished auth and profile loading. isLoadingAuthProfile:", false);
    };

    getSessionAndProfile();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(`[SectionLessonsPage] Auth state changed. Event: ${event}. Session user: ${session?.user?.id || 'null'}`);
      setIsLoadingAuthProfile(true); 
      const user = session?.user ?? null;
      setAuthUser(user);
      if (user) {
        try {
          const profile = await getUserProfile(user.id);
          console.log("[SectionLessonsPage] Fetched user profile on auth change:", JSON.stringify(profile, null, 2));
          setUserProfile(profile);
        } catch (profileError: any) {
          console.error("[SectionLessonsPage] Error fetching user profile on auth change:", profileError);
          setUserProfile(null);
        }
      } else {
        setUserProfile(null);
      }
      setIsLoadingAuthProfile(false);
    });
    return () => {
        console.log("[SectionLessonsPage] Unsubscribing auth listener.");
        authListener.subscription.unsubscribe();
    };
  }, [toast]);

  useEffect(() => {
    console.log(`[SectionLessonsPage] useEffect for data fetching triggered. isLoadingAuthProfile: ${isLoadingAuthProfile}, authUser: ${authUser?.id || 'null'}`);
    if (isLoadingAuthProfile) {
      console.log("[SectionLessonsPage] Data fetching waiting for auth profile to load...");
      return; 
    }

    setIsLoadingData(true);
    setError(null);

    if (subjectId && sectionId) {
      const fetchData = async () => {
        try {
          console.log(`[SectionLessonsPage] Fetching section with ID: ${sectionId} for subject ID: ${subjectId}`);
          const sectionData = await getSectionById(sectionId); 

          if (!sectionData) {
            console.error(`[SectionLessonsPage] Section with ID ${sectionId} not found or access denied.`);
            setError(`لم يتم العثور على القسم بالمعرف: ${sectionId}.`);
            setSection(null);
            setLessons([]);
            setIsLoadingData(false);
            return; 
          }
          
          console.log(`[SectionLessonsPage] Section data found for ID ${sectionId}:`, sectionData);
          setSection(sectionData);

          console.log(`[SectionLessonsPage] Fetching lessons for section ID: ${sectionId}`);
          const lessonsData = await getSectionLessons(sectionId);
          
          console.log(`[SectionLessonsPage] Lessons data fetched for section ID ${sectionId}, count: ${lessonsData.length}`);
          setLessons(lessonsData);

        } catch (e: any) {
          console.error(`[SectionLessonsPage] Error in fetchData for section ${sectionId}:`, e);
          let errorMessage = `فشل تحميل بيانات دروس القسم. ${e.message || ''}`;
          if (e instanceof Error && e.message.startsWith("Failed to fetch sections for subject")) { // More specific error from service
            errorMessage = e.message;
          }
          setError(errorMessage);
          setLessons([]);
        } finally {
          setIsLoadingData(false);
          console.log(`[SectionLessonsPage] Finished data fetching. isLoadingData: false`);
        }
      };
      fetchData();
    } else {
      setIsLoadingData(false);
      setError("معرفات المادة أو القسم غير متوفرة في الرابط.");
      console.error("[SectionLessonsPage] Missing subjectId or sectionId in params.");
    }
  }, [subjectId, sectionId, isLoadingAuthProfile, authUser]);


  const isSubjectActiveForCurrentUser = useMemo(() => {
    console.log("[SectionLessonsPage] Evaluating isSubjectActiveForCurrentUser...");
    console.log("  AuthUser present:", !!authUser);
    if (!authUser) {
      console.log("  isSubjectActiveForCurrentUser: false (no authUser).");
      return false;
    }
    console.log("  UserProfile present:", !!userProfile);
    if (!userProfile) {
      console.log("  isSubjectActiveForCurrentUser: false (no userProfile).");
      return false;
    }
    console.log("  UserProfile.active_subscription present:", !!userProfile.activeSubscription);
    if (!userProfile.activeSubscription) {
      console.log("  isSubjectActiveForCurrentUser: false (no activeSubscription object in profile).");
      return false;
    }

    const sub = userProfile.activeSubscription;
    console.log("  UserProfile.active_subscription (raw):", JSON.stringify(sub, null, 2));
    console.log("  Current subjectId (page param):", subjectId);

    if (sub.status !== 'active') {
      console.log(`  isSubjectActiveForCurrentUser: false (subscription status is ${sub.status}).`);
      return false;
    }

    const now = new Date();
    const endDate = new Date(sub.endDate);

    if (endDate < now) {
      console.log("  isSubjectActiveForCurrentUser: false (subscription expired).");
      console.log(`    Current date: ${now.toISOString()}, End date: ${endDate.toISOString()}`);
      return false;
    }

    // Start date check removed as per user request
    // const startDate = new Date(sub.startDate);
    // if (now < startDate) {
    //     console.log("  isSubjectActiveForCurrentUser: false (subscription start date is in the future).");
    //     console.log(`    Current date: ${now.toISOString()}, Start date: ${startDate.toISOString()}`);
    //     return false;
    // }

    const isGeneralSubscription = !sub.subjectId || sub.subjectId.trim() === "";
    const isSpecificSubjectMatch = sub.subjectId === subjectId; 

    console.log(`  isGeneralSubscription: ${isGeneralSubscription} (sub.subjectId: '${sub.subjectId}')`);
    console.log(`  isSpecificSubjectMatch: ${isSpecificSubjectMatch} (sub.subjectId: '${sub.subjectId}', page subjectId: '${subjectId}')`);
    
    const result = isGeneralSubscription || isSpecificSubjectMatch;
    console.log("  isSubjectActiveForCurrentUser result:", result);
    return result;
  }, [userProfile, subjectId, authUser]);

  if (isLoadingData || isLoadingAuthProfile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">
          {isLoadingAuthProfile ? 'جاري التحقق من المستخدم...' : (isLoadingData ? 'جاري تحميل دروس القسم...' : 'جاري التحميل...')}
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
        <p className="text-lg text-muted-foreground">{error || "لم يتم العثور على القسم. قد يكون قد تم حذفه أو أن الرابط غير صحيح."}</p>
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
          {section.type && (
            <CardDescription className="text-md">
              نوع القسم: {section.type}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          {lessons.length === 0 && !isLoadingData ? ( 
            <div className="text-center py-8 text-muted-foreground">
              <BookText className="h-10 w-10 mx-auto mb-2" />
              <p className="text-lg">لا توجد دروس متاحة لهذا القسم حاليًا.</p>
            </div>
          ) : (
            <ul className="space-y-4">
              {lessons.map((lesson) => {
                const sectionIsLockedByAdmin = section.is_locked === true;

                let effectiveIsLockedByAdmin: boolean;
                if (lesson.is_locked === false) { 
                  effectiveIsLockedByAdmin = false;
                } else if (lesson.is_locked === true) { 
                  effectiveIsLockedByAdmin = true;
                } else { 
                  effectiveIsLockedByAdmin = sectionIsLockedByAdmin;
                }
                
                const displayAsLocked = effectiveIsLockedByAdmin && !isSubjectActiveForCurrentUser;
                
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
        <Button onClick={() => router.push(`/study/${branch}/${subjectId}`)} variant="outline">
          <ChevronRight className="ms-2 h-4 w-4" /> 
          العودة إلى أقسام المادة
        </Button>
      </div>
    </div>
  );
}

