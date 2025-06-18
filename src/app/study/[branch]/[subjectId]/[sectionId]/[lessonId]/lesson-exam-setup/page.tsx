
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getLessonById } from '@/lib/examService'; 
import type { Lesson } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Loader2, AlertTriangle, Settings, ListChecks, Hash, Zap, TimerIcon, Eye, Play, BookOpen } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { subjects as allSubjectsFromConstants, allQuestions as mockQuestionsBank } from "@/lib/constants"; 

const MAX_QUESTIONS_LIMIT = 50;

export default function LessonExamSetupPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();

  // subjectId, sectionId, branch are kept for constructing back/navigation links if needed
  const subjectIdFromRoute = params.subjectId as string;
  const lessonId = params.lessonId as string;
  const sectionIdFromRoute = params.sectionId as string;
  const branchFromRoute = params.branch as string;

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [isLoadingLesson, setIsLoadingLesson] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);

  const [availableTopics, setAvailableTopics] = useState<string[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [numQuestions, setNumQuestions] = useState(10);
  const [questionOrder, setQuestionOrder] = useState<'sequential' | 'random'>('sequential');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'all' | 'easy' | 'medium' | 'hard'>('all');
  const [timerEnabled, setTimerEnabled] = useState(true);
  
  const [isStartingExam, setIsStartingExam] = useState(false);

  useEffect(() => {
    if (lessonId) {
      const fetchLessonDetails = async () => {
        setIsLoadingLesson(true);
        setPageError(null);
        try {
          const lessonData = await getLessonById(lessonId);
          if (lessonData) {
            setLesson(lessonData);
            // Topic selection logic still relies on mockQuestionsBank for now
            // This needs to be updated if topics are stored in DB per lesson/question
            const topicsForSubject = mockQuestionsBank
              .filter(q => q.subjectId === lessonData.subject_id && q.topic) // Use lessonData.subject_id
              .map(q => q.topic as string);
            const uniqueTopics = Array.from(new Set(topicsForSubject));
            setAvailableTopics(uniqueTopics);
            
            if (lessonData.title && uniqueTopics.includes(lessonData.title)) {
              setSelectedTopics([lessonData.title]);
            } else if (uniqueTopics.length > 0) {
              setSelectedTopics(uniqueTopics); 
            } else {
              setSelectedTopics([]);
              // Potentially toast if no topics are found but questions might exist for the subject broadly
            }
          } else {
            setPageError(`لم نتمكن من العثور على تفاصيل الدرس (المعرف: ${lessonId}).`);
            toast({ title: "خطأ", description: `تفاصيل الدرس "${lessonId}" غير موجودة.`, variant: "destructive" });
          }
        } catch (error: any) {
          console.error("Error fetching lesson details for exam setup:", error);
          setPageError("حدث خطأ أثناء تحميل تفاصيل الدرس. حاول مرة أخرى.");
          toast({ title: "خطأ فادح", description: error.message || "فشل تحميل تفاصيل الدرس.", variant: "destructive" });
        } finally {
          setIsLoadingLesson(false);
        }
      };
      fetchLessonDetails();
    }
  }, [lessonId, toast]);

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
    if (availableTopics.length > 0 && selectedTopics.length === 0) { // Check only if topics were available
      toast({ title: "خطأ في الإعدادات", description: "الرجاء اختيار موضوع واحد على الأقل من القائمة.", variant: "destructive" });
      return;
    }
    if (numQuestions <= 0 || numQuestions > MAX_QUESTIONS_LIMIT) {
      toast({ title: "خطأ في الإعدادات", description: `يجب أن يكون عدد الأسئلة بين 1 و ${MAX_QUESTIONS_LIMIT}.`, variant: "destructive" });
      return;
    }
    setIsStartingExam(true);
    const examConfig = {
      lessonId,
      subjectId: lesson?.subject_id,
      selectedTopics: selectedTopics.length > 0 ? selectedTopics : null, // Send null if no topics selected (means all for subject)
      numQuestions,
      questionOrder,
      selectedDifficulty,
      timerEnabled,
    };
    console.log("Starting exam with config:", examConfig);
    toast({ title: "بدء الاختبار (قيد الإنشاء)", description: "سيتم توجيهك للاختبار بالإعدادات المحددة." });
    // Actual navigation should pass config to an exam-taking page
    // Example: router.push(`/study/take-lesson-exam?config=${encodeURIComponent(JSON.stringify(examConfig))}`);
    // For now, this part remains conceptual until the exam taking page for lessons is built.
    setIsStartingExam(false);
  };

  const handleBrowseQuestions = () => {
    console.log("Browsing questions with config:", {
      lessonId,
      subjectId: lesson?.subject_id,
      selectedTopics,
      selectedDifficulty,
    });
    toast({ title: "تصفح الأسئلة (قيد الإنشاء)", description: "سيتم عرض الأسئلة للتصفح." });
    // TODO: Navigate to a browse questions page or display them in a modal/section
  };

  if (isLoadingLesson) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">جاري تحميل إعدادات اختبار الدرس...</p>
      </div>
    );
  }

  if (pageError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center">
        <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
        <p className="text-lg text-destructive mb-4">{pageError}</p>
        <Button onClick={() => router.back()} variant="outline">
          العودة إلى الدرس
        </Button>
      </div>
    );
  }

  if (!lesson) {
     return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center">
        <AlertTriangle className="h-12 w-12 text-yellow-500 mb-4" />
        <p className="text-lg text-muted-foreground">لم يتم العثور على الدرس.</p>
        <Button onClick={() => router.back()} variant="outline">
          العودة إلى الدرس
        </Button>
      </div>
    );
  }
  
  const lessonSubjectDetails = allSubjectsFromConstants.find(s => s.id === lesson.subject_id); // Still uses constants for subject name
  const lessonSubjectName = lessonSubjectDetails?.name || lesson.subject_id; // Fallback to ID if name not found

  const lessonPagePath = `/study/${branchFromRoute}/${lesson.subject_id}/${lesson.section_id}/${lesson.id}`;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <BookOpen className="h-8 w-8 text-primary" />
            <div>
                <CardTitle className="text-2xl md:text-3xl font-bold">إعداد اختبار لدرس: {lesson.title}</CardTitle>
                <CardDescription>
                    مادة: {lessonSubjectName}
                </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {availableTopics.length > 0 ? (
            <div className="space-y-3">
              <Label className="text-lg font-semibold flex items-center gap-2"><ListChecks /> اختر المواضيع من هذه المادة:</Label>
              <div className="flex items-center space-x-2 space-x-reverse mb-2">
                <Checkbox
                  id="select-all-topics-lesson"
                  checked={selectedTopics.length === availableTopics.length && availableTopics.length > 0}
                  onCheckedChange={(checked) => handleSelectAllTopics(checked as boolean)}
                />
                <Label htmlFor="select-all-topics-lesson" className="cursor-pointer">اختيار كل المواضيع المتاحة</Label>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto p-2 border rounded-md">
                {availableTopics.map(topic => (
                  <div key={topic} className="flex items-center space-x-2 space-x-reverse">
                    <Checkbox
                      id={`topic-lesson-${topic.replace(/\s+/g, '-')}`} 
                      checked={selectedTopics.includes(topic)}
                      onCheckedChange={() => handleTopicChange(topic)}
                    />
                    <Label htmlFor={`topic-lesson-${topic.replace(/\s+/g, '-')}`} className="cursor-pointer text-sm">{topic}</Label>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              لا توجد مواضيع محددة لهذه المادة في قاعدة الأسئلة النموذجية. سيتم اختيار الأسئلة من كامل المادة ({lessonSubjectName}).
            </p>
          )}

          <div className="space-y-2">
            <Label htmlFor="num-questions-lesson" className="text-lg font-semibold flex items-center gap-2"><Hash /> عدد الأسئلة:</Label>
            <Input
              id="num-questions-lesson"
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
            <Label htmlFor="question-order-lesson" className="text-lg font-semibold flex items-center gap-2"><Settings /> ترتيب الأسئلة:</Label>
            <Select dir="rtl" value={questionOrder} onValueChange={(value) => setQuestionOrder(value as 'sequential' | 'random')}>
              <SelectTrigger id="question-order-lesson" className="max-w-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sequential">ترتيبي (كما هي)</SelectItem>
                <SelectItem value="random">عشوائي</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="difficulty-lesson" className="text-lg font-semibold flex items-center gap-2"><Zap /> مستوى الصعوبة:</Label>
            <Select dir="rtl" value={selectedDifficulty} onValueChange={(value) => setSelectedDifficulty(value as any)}>
              <SelectTrigger id="difficulty-lesson" className="max-w-xs">
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
            <Switch id="timer-enabled-lesson" checked={timerEnabled} onCheckedChange={setTimerEnabled} />
            <Label htmlFor="timer-enabled-lesson" className="text-lg font-semibold flex items-center gap-2"><TimerIcon /> تفعيل المؤقت</Label>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-3">
          <Button onClick={handleStartExam} disabled={isStartingExam} className="w-full sm:flex-auto text-lg py-3">
            {isStartingExam ? <Loader2 className="ms-2 h-5 w-5 animate-spin" /> : <Play className="ms-2 h-5 w-5" />}
            ابدأ الاختبار
          </Button>
          <Button onClick={handleBrowseQuestions} variant="outline" className="w-full sm:flex-auto">
            <Eye className="ms-2 h-5 w-5" />
            تصفح الأسئلة
          </Button>
        </CardFooter>
      </Card>
      <div className="text-center">
        <Button onClick={() => router.push(lessonPagePath)} variant="outline">
            العودة إلى الدرس
        </Button>
      </div>
    </div>
  );
}
