
'use client';

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { QrCode, ScanLine, KeyRound, Loader2, Video, VideoOff, BookOpen, CheckCircle } from "lucide-react";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";
import type { User as SupabaseAuthUser } from '@supabase/supabase-js';
import { 
  checkCodeWithBackend, 
  confirmActivationWithBackend, 
} from "@/lib/activationService";
import type { BackendCodeDetails, BackendConfirmationPayload } from '@/lib/types';
import { getSubjects, type Subject } from "@/lib/examService";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

type ActivationStep = 'enterCode' | 'chooseSubject' | 'activated';

export default function ActivateQrPage() {
  const [manualCode, setManualCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<SupabaseAuthUser | null>(null);
  const { toast } = useToast();

  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);

  const [activationStep, setActivationStep] = useState<ActivationStep>('enterCode');
  const [pendingCodeDetails, setPendingCodeDetails] = useState<BackendCodeDetails | null>(null);
  const [subjectsList, setSubjectsList] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>(""); 
  const [isFetchingSubjects, setIsFetchingSubjects] = useState(false);
  const [subjectChoiceError, setSubjectChoiceError] = useState<string | null>(null);

  useEffect(() => {
    const getSessionUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setCurrentUser(session?.user ?? null);
      if (!session?.user) {
        setActivationStep('enterCode');
        setPendingCodeDetails(null); 
      }
    };
    getSessionUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setCurrentUser(session?.user ?? null);
      if (!session?.user) {
        setActivationStep('enterCode');
        setPendingCodeDetails(null); 
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const requestCamera = async () => {
    if (typeof navigator !== "undefined" && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        setHasCameraPermission(true);
        setMediaStream(stream);
        setIsCameraActive(true);
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        setIsCameraActive(false);
        setMediaStream(null);
        toast({
          variant: 'destructive',
          title: 'فشل الوصول للكاميرا',
          description: 'يرجى تمكين صلاحيات الكاميرا في متصفحك لاستخدام الماسح الضوئي.',
        });
      }
    } else {
      setHasCameraPermission(false);
      setIsCameraActive(false);
      setMediaStream(null);
      toast({
        variant: 'destructive',
        title: 'الكاميرا غير مدعومة',
        description: 'متصفحك لا يدعم الوصول إلى الكاميرا.',
      });
    }
  };

  const stopCamera = () => {
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
      setMediaStream(null);
    }
    // No need to directly manipulate videoRef.current.srcObject here, useEffect will handle it
    setIsCameraActive(false);
  };
  
  useEffect(() => {
    if (isCameraActive && mediaStream && videoRef.current) {
      videoRef.current.srcObject = mediaStream;
      videoRef.current.play().catch(err => {
        console.error("Video play failed:", err);
        // Optionally inform user if play fails, e.g. due to browser restrictions
        toast({
          variant: 'destructive',
          title: 'فشل تشغيل الفيديو',
          description: 'قد تكون هناك قيود من المتصفح تمنع التشغيل التلقائي للفيديو.',
        });
      });
    } else if (!isCameraActive && videoRef.current) {
      videoRef.current.srcObject = null; // Clear stream when camera is not active
    }
  }, [isCameraActive, mediaStream, toast]);


  const handleToggleCamera = () => {
    if (isCameraActive) {
      stopCamera();
    } else {
      requestCamera();
    }
  };

  // Cleanup effect for when the component unmounts
  useEffect(() => {
    return () => {
      stopCamera(); 
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // stopCamera reference is stable

  const fetchSubjects = async () => {
    setIsFetchingSubjects(true);
    setSubjectChoiceError(null);
    try {
      const fetchedSubjects = await getSubjects(); 
      const relevantSubjects = fetchedSubjects.filter(s => s.branch === 'scientific' || s.branch === 'literary' || s.branch === 'common');
      setSubjectsList(relevantSubjects); 
      if (relevantSubjects.length > 0) {
         setSelectedSubject(relevantSubjects[0].id); 
      } else {
        setSelectedSubject(""); 
        if (fetchedSubjects.length === 0) { 
            toast({ title: "تنبيه", description: "قائمة المواد للاختيار تحتاج للتحديث لـ Supabase.", variant: "default" });
        }
      }
    } catch (error) {
      console.error("Error fetching subjects:", error);
      setSubjectChoiceError("فشل تحميل قائمة المواد. يرجى المحاولة مرة أخرى.");
      toast({ title: "خطأ", description: "فشل تحميل قائمة المواد. (الخدمة تحتاج للتحديث لـ Supabase)", variant: "destructive" });
    } finally {
      setIsFetchingSubjects(false);
    }
  };

  const confirmAndFinalizeActivation = async (
    codeDetailsToConfirm: BackendCodeDetails, 
    chosenSubjectId?: string, 
    chosenSubjectName?: string
  ) => {
    if (!currentUser || !currentUser.email) {
      toast({ title: "خطأ", description: "مستخدم غير مسجل أو البريد الإلكتروني مفقود.", variant: "destructive" });
      return;
    }
    setIsLoading(true);

    const payload: BackendConfirmationPayload = {
      userId: currentUser.id,
      email: currentUser.email,
      codeId: codeDetailsToConfirm.id, 
      codeType: codeDetailsToConfirm.type,
      codeValidUntil: codeDetailsToConfirm.validUntil!,
      chosenSubjectId: chosenSubjectId,
      chosenSubjectName: chosenSubjectName,
    };

    try {
      const confirmationResult = await confirmActivationWithBackend(payload);

      if (confirmationResult.success) {
        toast({ 
          title: "تم التفعيل بنجاح!", 
          description: confirmationResult.message, 
          variant: "default",
          duration: 9000
        });
        setManualCode("");
        setActivationStep('activated'); 
        setPendingCodeDetails(null);
        setSelectedSubject("");
      } else {
        toast({ title: "فشل التفعيل", description: confirmationResult.message || "فشل تأكيد تفعيل الرمز.", variant: "destructive" });
      }
    } catch (error) {
      console.error("Activation confirmation error:", error);
      toast({ title: "خطأ", description: "حدث خطأ غير متوقع أثناء تأكيد تفعيل الرمز.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualActivate = async () => {
    if (!currentUser || !currentUser.email) {
      toast({ title: "مستخدم غير مسجل", description: "الرجاء تسجيل الدخول أولاً لتفعيل الاشتراك.", variant: "destructive" });
      return;
    }
    if (!manualCode.trim()) {
      toast({ title: "إدخال ناقص", description: "الرجاء إدخال رمز التفعيل.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    setPendingCodeDetails(null); 
    setActivationStep('enterCode'); 

    try {
      const checkResult = await checkCodeWithBackend(manualCode.trim());

      if (!checkResult.isValid || !checkResult.codeDetails) {
        toast({ title: "رمز غير صالح", description: checkResult.message || "لم يتم العثور على رمز التفعيل المدخل أو أنه غير صالح.", variant: "destructive" });
        setIsLoading(false);
        return;
      }
      
      const codeDetails = checkResult.codeDetails;

      if (checkResult.needsSubjectChoice) {
        setPendingCodeDetails(codeDetails); 
        setActivationStep('chooseSubject');
        await fetchSubjects(); 
        toast({ title: "الخطوة التالية", description: checkResult.message || "يرجى اختيار المادة.", variant: "default" });
      } else {
        await confirmAndFinalizeActivation(codeDetails, codeDetails.subjectId, codeDetails.subjectName);
      }

    } catch (error) {
      console.error("Code check or activation error:", error);
      toast({ title: "خطأ", description: "حدث خطأ غير متوقع أثناء التحقق من الرمز أو تفعيله.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmSubjectChoice = async () => {
    if (!currentUser || !currentUser.email || !pendingCodeDetails || !selectedSubject) {
      toast({ title: "خطأ", description: "معلومات غير كاملة لتفعيل الاشتراك للمادة.", variant: "destructive" });
      return;
    }
    const subjectDetails = subjectsList.find(s => s.id === selectedSubject);
    if (!subjectDetails) {
       toast({ title: "خطأ", description: "لم يتم العثور على تفاصيل المادة المختارة.", variant: "destructive" });
       return;
    }
    
    await confirmAndFinalizeActivation(pendingCodeDetails, subjectDetails.id, subjectDetails.name);
  };

  if (activationStep === 'chooseSubject') {
    return (
      <Card className="max-w-lg mx-auto shadow-lg">
        <CardHeader>
          <BookOpen className="h-10 w-10 text-primary mx-auto mb-3" />
          <CardTitle className="text-2xl font-bold">اختر المادة للتفعيل</CardTitle>
          <CardDescription>رمز التفعيل الذي أدخلته يسمح لك باختيار مادة واحدة للاشتراك.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {isFetchingSubjects ? (
            <div className="flex items-center justify-center">
              <Loader2 className="ms-2 h-6 w-6 animate-spin" />
              <p className="text-muted-foreground">جاري تحميل قائمة المواد...</p>
            </div>
          ) : subjectChoiceError ? (
             <Alert variant="destructive"> <AlertTitle>خطأ</AlertTitle> <AlertDescription>{subjectChoiceError}</AlertDescription> </Alert>
          ) : subjectsList.length === 0 ? (
             <Alert variant="default"> <AlertTitle>لا توجد مواد</AlertTitle> <AlertDescription>لم يتم العثور على مواد علمية أو أدبية للاختيار. يرجى الاتصال بالدعم. (أو الخدمة تحتاج للتحديث لـ Supabase)</AlertDescription> </Alert>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="subject-select" className="text-base">اختر المادة:</Label>
              <Select dir="rtl" value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger id="subject-select"> <SelectValue placeholder="اختر مادة..." /> </SelectTrigger>
                <SelectContent> {subjectsList.map((subject) => ( <SelectItem key={subject.id} value={subject.id}> {subject.name} ({subject.branch === 'scientific' ? 'علمي' : subject.branch === 'literary' ? 'أدبي' : 'مشترك'}) </SelectItem> ))} </SelectContent>
              </Select>
            </div>
          )}
          <Button onClick={handleConfirmSubjectChoice} disabled={isLoading || isFetchingSubjects || !selectedSubject || subjectsList.length === 0} className="w-full" size="lg">
            {isLoading ? <Loader2 className="ms-2 h-5 w-5 animate-spin" /> : <CheckCircle className="ms-2 h-5 w-5" />}
            تأكيد اختيار المادة وتفعيل الاشتراك
          </Button>
        </CardContent>
        <CardFooter> <Button variant="outline" onClick={() => { setActivationStep('enterCode'); setPendingCodeDetails(null); }} className="w-full"> إلغاء والعودة </Button> </CardFooter>
      </Card>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-8">
      <Card className="shadow-lg">
        <CardHeader className="text-center">
          <QrCode className="h-12 w-12 text-primary mx-auto mb-3" />
          <CardTitle className="text-3xl font-bold">تفعيل الاشتراك</CardTitle>
          <CardDescription className="text-lg"> امسح كود QR الموجود على بطاقة الاشتراك الخاصة بك أو أدخل الرمز يدوياً. </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="aspect-video bg-muted rounded-lg flex items-center justify-center p-1 relative overflow-hidden">
            <video
              ref={videoRef}
              className={cn(
                "w-full h-full object-cover rounded-md",
                isCameraActive ? "block" : "hidden" // Control visibility
              )}
              autoPlay
              playsInline
              muted
            />
            {!isCameraActive && (
              <div className="text-center text-muted-foreground space-y-2 absolute inset-0 flex flex-col items-center justify-center bg-muted">
                <ScanLine className="h-16 w-16 mx-auto" />
                <p>اضغط لتشغيل الكاميرا ومسح الكود.</p>
              </div>
            )}
          </div>
          <Button size="lg" onClick={handleToggleCamera} className="w-full"> {isCameraActive ? <VideoOff className="ms-2 h-5 w-5" /> : <Video className="ms-2 h-5 w-5" />} {isCameraActive ? "إيقاف الكاميرا" : "تشغيل الكاميرا لمسح QR"} </Button>
          
          {hasCameraPermission === false && ( <Alert variant="destructive"> <AlertTitle>الوصول إلى الكاميرا مطلوب</AlertTitle> <AlertDescription> يرجى السماح بالوصول إلى الكاميرا في إعدادات المتصفح لاستخدام ميزة مسح QR. </AlertDescription> </Alert> )}
          
          {hasCameraPermission === true && isCameraActive && ( <p className="text-xs text-muted-foreground text-center">وجه الكاميرا نحو رمز QR...</p> )}
          
          <div className="relative flex items-center"> <div className="flex-grow border-t border-border"></div> <span className="flex-shrink mx-4 text-muted-foreground">أو</span> <div className="flex-grow border-t border-border"></div> </div>

          <div>
            <label htmlFor="activation-code" className="block text-sm font-medium text-foreground mb-1">أدخل رمز التفعيل يدوياً</label>
            <div className="flex gap-2">
              <Input id="activation-code" type="text" placeholder="XXXX-XXXX-XXXX-XXXX" className="text-left tracking-widest" value={manualCode} onChange={(e) => setManualCode(e.target.value)} disabled={isLoading || activationStep !== 'enterCode'} />
              <Button onClick={handleManualActivate} variant="secondary" disabled={isLoading || !currentUser || activationStep !== 'enterCode'}> {isLoading && activationStep === 'enterCode' ? <Loader2 className="ms-2 h-4 w-4 animate-spin" /> : <KeyRound className="ms-2 h-4 w-4" />} تفعيل </Button>
            </div>
             {!currentUser && <p className="text-xs text-destructive mt-1">يجب تسجيل الدخول أولاً.</p>}
             {activationStep === 'activated' && <p className="text-sm text-green-600 mt-2 text-center">تم تفعيل اشتراكك بنجاح. يمكنك تفعيل رمز آخر إذا أردت.</p> }
          </div>
        </CardContent>
      </Card>
      <div className="text-center">
        <Image src="https://images.unsplash.com/photo-1595079676339-1534801ad6cf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwzfHxRciUyMGNvZGV8ZW58MHx8fHwxNzUwMjgxNTk2fDA&ixlib=rb-4.1.0&q=80&w=1080" alt="بطاقة اشتراك" width={300} height={200} className="rounded-lg mx-auto shadow-md" data-ai-hint="QR code" />
        <p className="text-sm text-muted-foreground mt-2">مثال لبطاقة الاشتراك التي تحتوي على كود QR.</p>
      </div>
    </div>
  );
}

  

    
