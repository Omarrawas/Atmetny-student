
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
          console.error("[SectionLessonsPage] Error fetching user profile:", profileError);
          setUserProfile(null);
          // toast({ title: "خطأ", description: "لم نتمكن من تحميل بيانات المستخدم.", variant: "destructive"});
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
        setIsLoadingAuthProfile(true); // Re-set loading when auth changes to re-fetch profile
        try {
          const profile = await getUserProfile(user.id);
          setUserProfile(profile);
        } catch (profileError) {
          console.error("[SectionLessonsPage] Error fetching user profile on auth change:", profileError);
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
  }, []); // Removed toast from dependencies here as it's stable

  useEffect(() => {
    if (isLoadingAuthProfile) {
      console.log("[SectionLessonsPage] Waiting for auth profile to load...");
      return; // Wait for authentication check to complete
    }

    // At this point, authUser is either set or definitively null.
    // RLS policies will be evaluated by Supabase based on the current session state.

    setIsLoadingData(true);
    setError(null);

    if (subjectId && sectionId) {
      const fetchData = async () => {
        try {
          console.log(`[SectionLessonsPage] Fetching section with ID: ${sectionId} for subject ID: ${subjectId}`);
          const sectionData = await getSectionById(sectionId); // subjectId is implicitly checked by section's subject_id

          if (!sectionData) {
            console.error(`[SectionLessonsPage] Section with ID ${sectionId} not found or access denied.`);
            setError(`لم يتم العثور على القسم بالمعرف: ${sectionId}. قد لا يكون موجودًا أو لا تملك صلاحية الوصول إليه.`);
            setSection(null);
            setLessons([]);
            toast({ title: "خطأ في القسم", description: `تفاصيل القسم (المعرف: ${sectionId}) غير موجودة أو الوصول إليها مرفوض.`, variant: "destructive" });
            setIsLoadingData(false);
            return; // Exit early if section not found
          }
          
          console.log(`[SectionLessonsPage] Section data found for ID ${sectionId}:`, sectionData);
          setSection(sectionData); // Set section data immediately

          console.log(`[SectionLessonsPage] Fetching lessons for section ID: ${sectionId}`);
          const lessonsData = await getSectionLessons(sectionId);
          
          console.log(`[SectionLessonsPage] Lessons data fetched for section ID ${sectionId}, count: ${lessonsData.length}`);
          setLessons(lessonsData);

          if (sectionData && lessonsData.length === 0) {
            // This toast can be noisy if sections genuinely have no lessons yet.
            // Consider making it more contextual or removing if sections can be legitimately empty.
            // toast({ title: "تنبيه", description: `لا توجد دروس متاحة للقسم "${sectionData.title}" حالياً.`, variant: "default" });
          }

        } catch (e: any) {
          console.error(`[SectionLessonsPage] Error in fetchData for section ${sectionId}:`, e);
          let errorMessage = "فشل تحميل بيانات دروس القسم. يرجى المحاولة مرة أخرى.";
          if (e.message && e.message.toLowerCase().includes('failed to fetch')) {
            errorMessage = "فشل الاتصال بالخادم لجلب بيانات القسم أو الدروس. يرجى التحقق من اتصالك بالإنترنت وإعدادات CORS في Supabase.";
          } else if (e.message) {
            errorMessage = e.message;
          }
          setError(errorMessage);
          // setSection(null); // Keep section if it was fetched before lessons error, or clear if section fetch failed
          setLessons([]);
          toast({ title: "خطأ فادح", description: errorMessage, variant: "destructive" });
        } finally {
          setIsLoadingData(false);
        }
      };
      fetchData();
    } else {
      setIsLoadingData(false);
      setError("معرفات المادة أو القسم غير متوفرة في الرابط.");
      console.error("[SectionLessonsPage] Missing subjectId or sectionId in params.");
    }
  }, [subjectId, sectionId, isLoadingAuthProfile, authUser, toast]);


  const isSubjectActiveForCurrentUser = useMemo(() => {
    if (!authUser || !userProfile || !userProfile.active_subscription) {
      return false;
    }
    const sub = userProfile.active_subscription;
    const now = new Date(); 
    const endDate = new Date(sub.endDate);

    if (sub.status !== 'active' || endDate < now) {
      return false;
    }

    const isGeneralSubscription = !sub.subjectId || sub.subjectId.trim() === "";
    const isSpecificSubjectMatch = sub.subjectId === subjectId; 

    return isGeneralSubscription || isSpecificSubjectMatch;
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

  if (!section) { // This will be true if setError was called with the "Section not found" message
    return (
      <div className="text-center py-10">
         <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
        <p className="text-lg text-muted-foreground">{error || "لم يتم العثور على القسم."}</p>
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
          {lessons.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <BookText className="h-10 w-10 mx-auto mb-2" />
              <p className="text-lg">لا توجد دروس متاحة لهذا القسم حاليًا.</p>
            </div>
          ) : (
            <ul className="space-y-4">
              {lessons.map((lesson, index) => {
                const sectionIsLockedByAdmin = section.is_locked === true;

                let effectiveIsLockedByAdmin: boolean;
                if (lesson.is_locked === false) { // Lesson explicitly open
                  effectiveIsLockedByAdmin = false;
                } else if (lesson.is_locked === true) { // Lesson explicitly locked
                  effectiveIsLockedByAdmin = true;
                } else { // lesson.is_locked is null, inherit from section
                  effectiveIsLockedByAdmin = sectionIsLockedByAdmin;
                }
                
                // Final lock status depends on admin lock AND user subscription
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
        <Button onClick={() => router.back()} variant="outline">
          <ChevronRight className="ms-2 h-4 w-4" /> 
          العودة إلى الأقسام
        </Button>
      </div>
    </div>
  );
}

    