
'use client'

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ChevronLeft, ChevronRight, Send, AlertCircle, Loader2, AlertTriangle, Settings, Hash, AlertOctagon, TimerIcon, Zap } from "lucide-react"; 
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react"; 
import { Progress } from "@/components/ui/progress";
import { saveExamAttempt, getSubjectById, getQuestionsBySubject } from "@/lib/examService"; // Supabase version
import type { Question as QuestionType, Subject } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient"; 
import type { User as SupabaseAuthUser } from '@supabase/supabase-js'; 

const MAX_QUESTIONS_LIMIT = 50; 
const DEFAULT_SECONDS_PER_QUESTION_PRACTICE = 120; // Longer for practice

export default function SubjectExamPage() {
  const params = useParams();
  const router = useRouter();
  const subjectId = params.subjectId as string; // This will be a UUID
  const { toast } = useToast();

  const [authUser, setAuthUser] = useState<SupabaseAuthUser | null>(null); 
  const [currentSubject, setCurrentSubject] = useState<Subject | null>(null);
  const [isLoadingSubject, setIsLoadingSubject] = useState(true);
  
  const [configMode, setConfigMode] = useState(true);
  const [numQuestions, setNumQuestions] = useState(10);
  const [selectedDifficulty, setSelectedDifficulty] = useState<QuestionType['difficulty'] | 'all'>('all');
  const [timerEnabled, setTimerEnabled] = useState(false); // Default to no timer for practice

  const [configuredQuestions, setConfiguredQuestions] = useState<QuestionType[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false); 
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [timeLeftInSeconds, setTimeLeftInSeconds] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  useEffect(() => {
    const getSessionUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setAuthUser(session.user);
      } else {
        setAuthUser(null);
        toast({ title: "خطأ", description: "يجب تسجيل الدخول لأداء الاختبار.", variant: "destructive" });
        router.push('/auth');
      }
    };
    getSessionUser();
    
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setAuthUser(session.user);
      } else {
        setAuthUser(null);
        if (window.location.pathname.startsWith('/study/exam/')) {
             toast({ title: "خطأ", description: "يجب تسجيل الدخول لأداء الاختبار.", variant: "destructive" });
             router.push('/auth');
        }
      }
    });
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [router, toast]);
  
  useEffect(() => {
    if (subjectId) {
      setIsLoadingSubject(true);
      getSubjectById(subjectId)
        .then(subjectDetails => {
          if (subjectDetails) {
            setCurrentSubject(subjectDetails);
          } else {
            setError("لم يتم العثور على المادة المحددة.");
            toast({ title: "خطأ", description: "المادة المطلوبة غير موجودة.", variant: "destructive"});
          }
        })
        .catch(err => {
          console.error("Error fetching subject details:", err);
          setError("خطأ في تحميل بيانات المادة.");
           toast({ title: "خطأ", description: "فشل تحميل تفاصيل المادة.", variant: "destructive"});
        })
        .finally(() => {
          setIsLoadingSubject(false);
        });
    }
    setConfigMode(true);
    setConfiguredQuestions([]);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setError(null);
  }, [subjectId, toast]);


  const handleStartExam = async () => {
    if (numQuestions <= 0 || numQuestions > MAX_QUESTIONS_LIMIT) {
      toast({ title: "خطأ في الإعدادات", description: `يجب أن يكون عدد الأسئلة بين 1 و ${MAX_QUESTIONS_LIMIT}.`, variant: "destructive" });
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
        let fetchedQuestions = await getQuestionsBySubject(subjectId, MAX_QUESTIONS_LIMIT); // Fetch more initially for filtering

        if (selectedDifficulty !== 'all') {
          fetchedQuestions = fetchedQuestions.filter(q => q.difficulty === selectedDifficulty);
        }
        
        const shuffled = fetchedQuestions.sort(() => 0.5 - Math.random());
        const questionsToDisplay = shuffled.slice(0, numQuestions);

        if (questionsToDisplay.length === 0) {
          setError("لم يتم العثور على أسئلة تطابق معاييرك. الرجاء تعديل إعدادات الاختبار أو التأكد من توفر أسئلة لهذه المادة.");
          setConfiguredQuestions([]);
        } else {
          setConfiguredQuestions(questionsToDisplay);
          setStartTime(new Date());
          setConfigMode(false);
          if (timerEnabled && questionsToDisplay.length > 0) {
            const duration = questionsToDisplay.length * DEFAULT_SECONDS_PER_QUESTION_PRACTICE;
            setTimeLeftInSeconds(duration);
            setIsTimerRunning(true);
          } else {
            setIsTimerRunning(false);
            setTimeLeftInSeconds(0);
          }
        }
    } catch (e: any) {
        console.error("Error starting subject exam:", e);
        setError(e.message || "فشل في بدء اختبار المادة.");
        toast({title: "خطأ", description: e.message || "فشل بدء اختبار المادة.", variant: "destructive"});
    } finally {
        setIsLoading(false);
    }
  };

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    if (isTimerRunning && timeLeftInSeconds > 0) {
      intervalId = setInterval(() => {
        setTimeLeftInSeconds(prevTime => prevTime - 1);
      }, 1000);
    } else if (isTimerRunning && timeLeftInSeconds <= 0) { 
      setIsTimerRunning(false);
      if (!isSubmitting) { // Ensure handleSubmit is not already in progress
        toast({
          title: "انتهى الوقت!",
          description: "سيتم تسليم إجاباتك تلقائياً.",
          variant: "destructive",
        });
        handleSubmit(); 
      }
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isTimerRunning, timeLeftInSeconds, handleSubmit, toast, isSubmitting]);


  if (!authUser || isLoadingSubject) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <p className="ms-4 text-xl">{!authUser ? "يجب تسجيل الدخول..." : `جاري تحميل مادة ${subjectId}...`}</p>
      </div>
    );
  }

  const subjectDisplayName = currentSubject?.name || "المادة المحددة";

  if (configMode) {
    return (
      <Card className="max-w-3xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <Settings className="h-8 w-8 text-primary" />
            إعدادات اختبار تدريبي لمادة {subjectDisplayName}
          </CardTitle>
          <CardDescription>اختر عدد الأسئلة، مستوى الصعوبة، والمؤقت.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <div className="p-4 bg-destructive/10 text-destructive border border-destructive rounded-md flex items-center gap-2">
              <AlertOctagon className="h-5 w-5" />
              <p>{error}</p>
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="num-questions" className="text-lg font-semibold flex items-center gap-2"><Hash /> عدد الأسئلة:</Label>
            <Input
              id="num-questions"
              type="number"
              value={numQuestions}
              onChange={(e) => setNumQuestions(Math.max(1, Math.min(MAX_QUESTIONS_LIMIT, parseInt(e.target.value) || 1)))}
              min="1"
              max={MAX_QUESTIONS_LIMIT.toString()}
              className="max-w-xs"
            />
            <p className="text-xs text-muted-foreground">الحد الأقصى {MAX_QUESTIONS_LIMIT} سؤال.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="difficulty" className="text-lg font-semibold flex items-center gap-2"><Zap /> مستوى الصعوبة:</Label>
            <Select dir="rtl" value={selectedDifficulty} onValueChange={(value) => setSelectedDifficulty(value as any)}>
              <SelectTrigger id="difficulty" className="max-w-xs">
                <SelectValue placeholder="اختر مستوى الصعوبة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الكل</SelectItem>
                <SelectItem value="easy">سهل</SelectItem>
                <SelectItem value="medium">متوسط</SelectItem>
                <SelectItem value="hard">صعب</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2 space-x-reverse">
            <Switch id="timer-enabled" checked={timerEnabled} onCheckedChange={setTimerEnabled} />
            <Label htmlFor="timer-enabled" className="text-lg font-semibold flex items-center gap-2"><TimerIcon /> تفعيل المؤقت</Label>
          </div>
          {timerEnabled && <p className="text-xs text-muted-foreground ps-8">سيتم تخصيص دقيقتين لكل سؤال ({DEFAULT_SECONDS_PER_QUESTION_PRACTICE / 60} دقيقة).</p>}
        </CardContent>
        <CardFooter>
          <Button onClick={handleStartExam} disabled={isLoading || isLoadingSubject} className="w-full text-lg py-3">
            {(isLoading || isLoadingSubject) ? <Loader2 className="ms-2 h-5 w-5 animate-spin" /> : "ابدأ الاختبار التدريبي"}
          </Button>
        </CardFooter>
      </Card>
    );
  }
  
  if (isLoading && !configMode) { 
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <p className="ms-4 text-xl">جاري تحضير أسئلة مادة {subjectDisplayName}...</p>
      </div>
    );
  }

  if (error && !configMode) { 
    return (
      <div className="flex flex-col justify-center items-center min-h-[calc(100vh-200px)] text-center">
        <AlertTriangle className="h-16 w-16 text-destructive mb-4" />
        <h2 className="text-2xl font-semibold text-destructive mb-2">حدث خطأ</h2>
        <p className="text-lg text-muted-foreground mb-6">{error}</p>
        <Button onClick={() => { setConfigMode(true); setError(null); }}>العودة للإعدادات</Button>
      </div>
    );
  }

  if (configuredQuestions.length === 0 && !configMode) {
    return (
      <div className="max-w-3xl mx-auto text-center space-y-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl md:text-3xl font-bold">اختبار تدريبي في مادة {subjectDisplayName}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center space-y-4 py-10">
            <AlertCircle className="h-16 w-16 text-yellow-500" />
            <p className="text-xl text-muted-foreground">
              عذراً، لا توجد أسئلة تطابق إعداداتك حالياً لهذه المادة.
            </p>
            <Button onClick={() => { setConfigMode(true); setError(null); }}>العودة للإعدادات</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = configuredQuestions[currentQuestionIndex];
  const progressPercentage = ((currentQuestionIndex + 1) / configuredQuestions.length) * 100;

  const handleNext = () => {
    if (!answers[currentQuestion.id]) {
      toast({
        title: "تنبيه",
        description: "الرجاء الإجابة على السؤال الحالي قبل الانتقال للسؤال التالي.",
        variant: "default",
      });
      return;
    }
    if (currentQuestionIndex < configuredQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleAnswerChange = (questionId: string, optionId: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: optionId }));
  };

  const handleSubmit = useCallback(async () => { 
     if (!authUser) { 
      toast({ title: "خطأ", description: "يجب تسجيل الدخول لتسليم الإجابات.", variant: "destructive" });
      return;
    }
    if (!startTime) {
      toast({ title: "خطأ", description: "لم يتم تسجيل وقت بدء الاختبار.", variant: "destructive" });
      return;
    }
    if(isSubmitting) return; 

    setIsSubmitting(true);
    setIsTimerRunning(false);
    try {
      let correctAnswersCount = 0;
      const submittedAnswersData = configuredQuestions.map(q => {
        const selectedOptionId = answers[q.id];
        const isCorrect = selectedOptionId === q.correct_option_id;
        if (isCorrect) correctAnswersCount++;
        return { questionId: q.id, selectedOptionId: selectedOptionId || null, isCorrect };
      });

      const score = configuredQuestions.length > 0 ? (correctAnswersCount / configuredQuestions.length) * 100 : 0;

      await saveExamAttempt({ 
        userId: authUser.id, 
        subjectId: subjectId, 
        examType: 'subject_practice',
        score: parseFloat(score.toFixed(2)),
        correctAnswersCount,
        totalQuestionsAttempted: configuredQuestions.length,
        answers: submittedAnswersData,
        startedAt: startTime,
        completedAt: new Date(),
      });
      
      toast({ title: "تم التسليم", description: "تم تسليم إجاباتك بنجاح." });
      router.push(`/study/exam/${subjectId}/results?score=${score.toFixed(0)}&correct=${correctAnswersCount}&total=${configuredQuestions.length}`);
    } catch (e: any) {
      console.error("Failed to submit subject exam (Supabase context):", e);
      toast({ title: "خطأ في التسليم", description: e.message || "فشل تسليم إجاباتك. يرجى المحاولة مرة أخرى.", variant: "destructive" });
      setIsSubmitting(false); 
    }
  }, [authUser, startTime, configuredQuestions, answers, toast, router, subjectId, isSubmitting]); 

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl md:text-3xl font-bold">اختبار تدريبي في مادة {subjectDisplayName}</CardTitle>
          <div className="flex justify-between items-center mt-1">
             <CardDescription>السؤال {currentQuestionIndex + 1} من {configuredQuestions.length}</CardDescription>
            {isTimerEnabled && isTimerRunning && (
              <div className="flex items-center text-lg font-semibold text-primary">
                <TimerIcon className="ms-2 h-5 w-5" />
                <span>{formatTime(timeLeftInSeconds)}</span>
              </div>
            )}
             {isTimerEnabled && !isTimerRunning && timeLeftInSeconds <= 0 && (
                 <div className="flex items-center text-lg font-semibold text-destructive">
                    <TimerIcon className="ms-2 h-5 w-5" />
                    <span>انتهى الوقت</span>
                </div>
            )}
          </div>
          <Progress value={progressPercentage} className="w-full mt-2" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold mb-4">{currentQuestion.question_text}</h3> 
            <p className="text-xs text-muted-foreground mb-2">الصعوبة: {currentQuestion.difficulty || 'غير محدد'}</p>
            {currentQuestion.options && currentQuestion.options.length > 0 && (
                <RadioGroup
                dir="rtl"
                value={answers[currentQuestion.id] || ""}
                onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}
                className="space-y-3"
                >
                {currentQuestion.options.map((option) => (
                    <div key={option.id} className="flex items-center space-x-2 space-x-reverse">
                    <RadioGroupItem value={option.id} id={`${currentQuestion.id}-${option.id}`} />
                    <Label htmlFor={`${currentQuestion.id}-${option.id}`} className="text-lg cursor-pointer">{option.text}</Label>
                    </div>
                ))}
                </RadioGroup>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between items-center">
          <Button onClick={handlePrevious} disabled={currentQuestionIndex === 0 || isSubmitting} variant="outline">
            <ChevronRight className="ms-2 h-4 w-4" />
            السابق
          </Button>
          {currentQuestionIndex === configuredQuestions.length - 1 ? (
            <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700" disabled={isSubmitting || !answers[currentQuestion.id]}>
              {isSubmitting ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <Send className="me-2 h-4 w-4" />}
              {isSubmitting ? 'جاري التسليم...' : 'تسليم الإجابات'}
            </Button>
          ) : (
            <Button onClick={handleNext} disabled={isSubmitting}>
              التالي
              <ChevronLeft className="me-2 h-4 w-4" />
            </Button>
          )}
        </CardFooter>
      </Card>
      <div className="text-center">
        <Button variant="outline" onClick={() => { setConfigMode(true); setError(null); }}>العودة إلى إعدادات الاختبار</Button>
      </div>
    </div>
  );
}
