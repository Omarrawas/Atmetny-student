
'use client'

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ChevronLeft, ChevronRight, Send, AlertCircle, Loader2, AlertTriangle, Settings, ListChecks, Hash, AlertOctagon, TimerIcon, Zap } from "lucide-react"; 
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react"; 
import { Progress } from "@/components/ui/progress";
import { allQuestions as mockQuestionsBank } from "@/lib/constants"; // Mock data for questions
import { saveExamAttempt, getSubjectById } from "@/lib/examService"; // Supabase version
import type { Question as QuestionType, Subject } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient"; // Supabase client
import type { User as SupabaseAuthUser } from '@supabase/supabase-js'; // Supabase user type

const MAX_QUESTIONS_LIMIT = 50; 

export default function SubjectExamPage() {
  const params = useParams();
  const router = useRouter();
  const subjectId = params.subjectId as string; // This will be a UUID
  const { toast } = useToast();

  const [authUser, setAuthUser] = useState<SupabaseAuthUser | null>(null); 
  const [currentSubject, setCurrentSubject] = useState<Subject | null>(null);
  const [isLoadingSubject, setIsLoadingSubject] = useState(true);
  const [availableTopics, setAvailableTopics] = useState<string[]>([]);
  
  const [configMode, setConfigMode] = useState(true);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [numQuestions, setNumQuestions] = useState(10);
  const [selectedDifficulty, setSelectedDifficulty] = useState<'all' | 'easy' | 'medium' | 'hard'>('all');
  const [timerEnabled, setTimerEnabled] = useState(true);

  const [configuredQuestions, setConfiguredQuestions] = useState<QuestionType[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false); 
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);

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
        toast({ title: "خطأ", description: "يجب تسجيل الدخول لأداء الاختبار.", variant: "destructive" });
        router.push('/auth');
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
            // For now, topics are still derived from mockQuestionsBank based on the UUID subjectId
            const topicsForSubject = mockQuestionsBank
              .filter(q => q.subjectId === subjectId && q.topic) // This linkage might break if mockQuestionsBank subjectIds are not UUIDs
              .map(q => q.topic as string);
            const uniqueTopics = Array.from(new Set(topicsForSubject));
            setAvailableTopics(uniqueTopics);
            // setSelectedTopics(uniqueTopics); // Default to all topics. Consider if this is desired.
             if (uniqueTopics.length > 0) {
              setSelectedTopics(uniqueTopics);
            } else {
              // If no topics found in mock data for this UUID, it implies a mismatch or data issue
              // For now, allow proceeding with all questions of the subject (filtered later in handleStartExam)
              setSelectedTopics([]); 
              console.warn(`No specific topics found in mockQuestionsBank for subjectId (UUID): ${subjectId}. Exam will use all questions for this subject if available.`);
            }

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

  const handleTopicChange = (topic: string) => {
    setSelectedTopics(prev => 
      prev.includes(topic) ? prev.filter(t => t !== topic) : [...prev, topic]
    );
  };

  const handleSelectAllTopics = (checked: boolean) => {
    if (checked) {
      setSelectedTopics(availableTopics);
    } else {
      setSelectedTopics([]);
    }
  };

  const handleStartExam = () => {
    if (selectedTopics.length === 0 && availableTopics.length > 0) { 
      toast({ title: "خطأ في الإعدادات", description: "الرجاء اختيار درس واحد على الأقل.", variant: "destructive" });
      return;
    }
    if (numQuestions <= 0 || numQuestions > MAX_QUESTIONS_LIMIT) {
      toast({ title: "خطأ في الإعدادات", description: `يجب أن يكون عدد الأسئلة بين 1 و ${MAX_QUESTIONS_LIMIT}.`, variant: "destructive" });
      return;
    }

    setIsLoading(true);
    setError(null);
    
    // Note: mockQuestionsBank.filter(q => q.subjectId === subjectId) will likely fail if mockQuestionsBank uses string IDs and subjectId is UUID.
    // This part needs to be refactored to fetch questions from Supabase by subject_id (UUID) and topic.
    // For this step, we'll assume mockQuestionsBank still contains questions linked by the OLD string IDs,
    // or that you intend to update mockQuestionsBank to use UUIDs if this page is to continue using it.
    // Ideally, questions are fetched from Supabase directly.
    let filtered = mockQuestionsBank.filter(q => q.subjectId === subjectId); // This line is problematic with UUIDs
    console.warn(`Filtering mockQuestionsBank with subjectId (UUID): ${subjectId}. This might yield no questions if mock data uses string IDs.`);


    if (selectedTopics.length > 0 && selectedTopics.length < availableTopics.length) { 
      filtered = filtered.filter(q => q.topic && selectedTopics.includes(q.topic));
    }

    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(q => q.difficulty === selectedDifficulty);
    }
    
    const shuffled = filtered.sort(() => 0.5 - Math.random());
    const questionsToDisplay = shuffled.slice(0, numQuestions);

    if (questionsToDisplay.length === 0) {
      setError("لم يتم العثور على أسئلة تطابق معاييرك. الرجاء تعديل إعدادات الاختبار أو التأكد من توفر أسئلة لهذه المادة/الأبحاث (قد تكون المشكلة بسبب استخدام معرفات UUID مع بيانات نموذجية قديمة).");
      setConfiguredQuestions([]);
    } else {
      setConfiguredQuestions(questionsToDisplay);
      setStartTime(new Date());
      setConfigMode(false);
    }
    setCurrentQuestionIndex(0);
    setAnswers({});
    setIsLoading(false);
  };


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
            إعدادات اختبار مادة {subjectDisplayName}
          </CardTitle>
          <CardDescription>اختر الدروس، عدد الأسئلة، مستوى الصعوبة، والمؤقت.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <div className="p-4 bg-destructive/10 text-destructive border border-destructive rounded-md flex items-center gap-2">
              <AlertOctagon className="h-5 w-5" />
              <p>{error}</p>
            </div>
          )}
          {availableTopics.length > 0 ? (
            <div className="space-y-3">
              <Label className="text-lg font-semibold flex items-center gap-2"><ListChecks /> اختر الدروس (الأبحاث):</Label>
              <div className="flex items-center space-x-2 space-x-reverse mb-2">
                <Checkbox
                  id="select-all-topics"
                  checked={selectedTopics.length === availableTopics.length && availableTopics.length > 0}
                  onCheckedChange={(checked) => handleSelectAllTopics(checked as boolean)}
                />
                <Label htmlFor="select-all-topics" className="cursor-pointer">اختيار كل الدروس</Label>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-60 overflow-y-auto p-2 border rounded-md">
                {availableTopics.map(topic => (
                  <div key={topic} className="flex items-center space-x-2 space-x-reverse">
                    <Checkbox
                      id={`topic-${topic.replace(/\s+/g, '-')}`}
                      checked={selectedTopics.includes(topic)}
                      onCheckedChange={() => handleTopicChange(topic)}
                    />
                    <Label htmlFor={`topic-${topic.replace(/\s+/g, '-')}`} className="cursor-pointer text-sm">{topic}</Label>
                  </div>
                ))}
              </div>
            </div>
          ) : (
             <p className="text-sm text-muted-foreground">لا توجد أبحاث محددة لهذه المادة في البيانات النموذجية. سيتم اختيار الأسئلة من كامل المادة إذا توفرت.</p>
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
        </CardContent>
        <CardFooter>
          <Button onClick={handleStartExam} disabled={isLoading || isLoadingSubject} className="w-full text-lg py-3">
            {(isLoading || isLoadingSubject) ? <Loader2 className="ms-2 h-5 w-5 animate-spin" /> : "ابدأ الاختبار"}
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
            <CardTitle className="text-2xl md:text-3xl font-bold">اختبار في مادة {subjectDisplayName}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center space-y-4 py-10">
            <AlertCircle className="h-16 w-16 text-yellow-500" />
            <p className="text-xl text-muted-foreground">
              عذراً، لا توجد أسئلة تطابق إعداداتك حالياً.
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
    try {
      let correctAnswersCount = 0;
      const submittedAnswers = configuredQuestions.map(q => {
        const selectedOptionId = answers[q.id];
        const isCorrect = selectedOptionId === q.correctOptionId;
        if (isCorrect) correctAnswersCount++;
        return { questionId: q.id, selectedOptionId: selectedOptionId || "N/A", isCorrect };
      });

      const score = (correctAnswersCount / configuredQuestions.length) * 100;

      await saveExamAttempt({ 
        userId: authUser.id, 
        subjectId: subjectId, // subjectId is UUID here
        examType: 'subject_practice',
        score: parseFloat(score.toFixed(2)),
        correctAnswersCount,
        totalQuestionsAttempted: configuredQuestions.length,
        answers: submittedAnswers,
        startedAt: startTime,
        completedAt: new Date(),
      });
      
      toast({ title: "تم التسليم", description: "تم تسليم إجاباتك بنجاح." });
      router.push(`/study/exam/${subjectId}/results?score=${score.toFixed(0)}&correct=${correctAnswersCount}&total=${configuredQuestions.length}`);
    } catch (e) {
      console.error("Failed to submit subject exam (Supabase context):", e);
      toast({ title: "خطأ في التسليم", description: "فشل تسليم إجاباتك. يرجى المحاولة مرة أخرى.", variant: "destructive" });
      setIsSubmitting(false); 
    }
  }, [authUser, startTime, configuredQuestions, answers, toast, router, subjectId, isSubmitting]); 

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl md:text-3xl font-bold">اختبار في مادة {subjectDisplayName}</CardTitle>
          <CardDescription>السؤال {currentQuestionIndex + 1} من {configuredQuestions.length}</CardDescription>
          <Progress value={progressPercentage} className="w-full mt-2" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold mb-4">{currentQuestion.questionText}</h3> 
            <p className="text-xs text-muted-foreground mb-2">الموضوع: {currentQuestion.topic || 'غير محدد'} - الصعوبة: {currentQuestion.difficulty || 'غير محدد'}</p>
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
      <Button variant="outline" onClick={() => { setConfigMode(true); setError(null); }}>العودة إلى إعدادات الاختبار</Button>
    </div>
  );
}
