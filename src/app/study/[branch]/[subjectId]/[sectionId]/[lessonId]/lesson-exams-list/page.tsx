
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getLessonById, getExamsByIds } from '@/lib/examService';
import type { Lesson, Exam } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Loader2, AlertTriangle, ListChecks, Settings, ChevronRight, FileText, Clock, User } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Separator } from '@/components/ui/separator';
import { useToast } from "@/hooks/use-toast";

export default function LessonExamsListPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { branch, subjectId, sectionId, lessonId } = params as { 
    branch: string;
    subjectId: string;
    sectionId: string;
    lessonId: string;
  };

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [linkedExams, setLinkedExams] = useState<Exam[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (lessonId) {
      const fetchData = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const lessonData = await getLessonById(lessonId); 
          if (lessonData) {
            setLesson(lessonData);
            if (lessonData.linked_exam_ids && lessonData.linked_exam_ids.length > 0) {
              const examsData = await getExamsByIds(lessonData.linked_exam_ids); 
              const filteredExams = examsData.filter(exam => exam.published);
              setLinkedExams(filteredExams);
              if (filteredExams.length === 0 && examsData.length > 0) {
                toast({ title: "تنبيه", description: "بعض الاختبارات المرتبطة بالدرس غير منشورة.", variant: "default"});
              } else if (examsData.length === 0 && lessonData.linked_exam_ids.length > 0) {
                 toast({ title: "تنبيه", description: `لم يتم العثور على الاختبارات المرتبطة بدرس "${lessonData.title}".`, variant: "default"});
              }
            } else {
              setLinkedExams([]);
            }
          } else {
            setError(`لم نتمكن من العثور على تفاصيل الدرس (المعرف: ${lessonId}).`);
            toast({ title: "خطأ", description: `تفاصيل الدرس "${lessonId}" غير موجودة.`, variant: "destructive" });
          }
        } catch (e: any) {
          console.error("Error fetching lesson exams data:", e);
          setError("حدث خطأ أثناء تحميل بيانات اختبارات الدرس. حاول مرة أخرى.");
           toast({ title: "خطأ فادح", description: e.message || "فشل تحميل بيانات اختبارات الدرس.", variant: "destructive" });
        } finally {
          setIsLoading(false);
        }
      };
      fetchData();
    }
  }, [lessonId, toast]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">جاري تحميل اختبارات الدرس...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center">
        <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
        <p className="text-lg text-destructive mb-4">{error}</p>
        <Button onClick={() => router.back()} variant="outline">
          العودة إلى الدرس
        </Button>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="text-center py-10">
        <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
        <p className="text-lg text-muted-foreground">لم يتم العثور على بيانات الدرس.</p>
        <Button onClick={() => router.back()} variant="outline" className="mt-4">
          العودة إلى الدرس
        </Button>
      </div>
    );
  }
  
  const lessonPagePath = `/study/${branch}/${lesson.subject_id}/${lesson.section_id}/${lesson.id}`;


  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <ListChecks className="h-8 w-8 text-primary" />
            <CardTitle className="text-2xl md:text-3xl font-bold">
              اختبارات لدرس: {lesson.title}
            </CardTitle>
          </div>
          <CardDescription>
            اختر أحد الاختبارات المقترحة أو قم بإعداد اختبار مخصص.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {linkedExams.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold mb-4 text-primary">الاختبارات المقترحة للدرس:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {linkedExams.map((exam) => (
                  <Card key={exam.id} className="flex flex-col overflow-hidden hover:shadow-xl transition-shadow duration-300">
                    {exam.image && ( <div className="relative h-40 w-full"> <Image src={exam.image} alt={exam.title} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" data-ai-hint={exam.image_hint || "exam cover"} /> </div> )}
                    <CardHeader> <CardTitle className="text-lg">{exam.title}</CardTitle> <CardDescription>{exam.subjectName}</CardDescription> </CardHeader>
                    <CardContent className="flex-grow space-y-1 text-sm text-muted-foreground"> <div className="flex items-center"> <User className="ms-1 h-4 w-4" /> <span>الأستاذ: {exam.teacher_name || 'غير محدد'}</span> </div> <div className="flex items-center"> <Clock className="ms-1 h-4 w-4" /> <span>المدة: {exam.duration ? `${exam.duration} دقيقة` : 'غير محدد'}</span> </div> <div className="flex items-center"> <FileText className="ms-1 h-4 w-4" /> <span>عدد الأسئلة: {exam.totalQuestions ?? 'غير محدد'}</span> </div> </CardContent>
                    <CardFooter> <Button asChild className="w-full"> <Link href={`/exams/${exam.id}/setup`}> <Settings className="ms-2 h-4 w-4" /> إعداد وبدء الاختبار </Link> </Button> </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {(linkedExams.length === 0 && !isLoading) && (
             <p className="text-center text-muted-foreground py-4">لا توجد اختبارات مقترحة لهذا الدرس حالياً.</p>
          )}

          <Separator />

          <div>
            <h3 className="text-xl font-semibold mb-3 text-primary">أو</h3>
            <Button asChild size="lg" className="w-full" variant="outline">
              <Link href={`/study/${branch}/${lesson.subject_id}/${lesson.section_id}/${lesson.id}/lesson-exam-setup`}>
                <Settings className="ms-2 h-5 w-5" />
                قم بإعداد اختبار مخصص لهذا الدرس
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="text-center mt-6">
        <Button onClick={() => router.push(lessonPagePath)} variant="outline">
          <ChevronRight className="ms-2 h-4 w-4" />
          العودة إلى الدرس
        </Button>
      </div>
    </div>
  );
}
