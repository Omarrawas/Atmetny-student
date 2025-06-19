
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getLessonById } from '@/lib/examService';
import type { Lesson } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronRight, Loader2, AlertTriangle, Puzzle, ToyBrick } from 'lucide-react';
// ReactMarkdown and its plugins are no longer needed here if only using dangerouslySetInnerHTML
// import ReactMarkdown from 'react-markdown';
// import remarkMath from 'remark-math';
// import rehypeKatex from 'rehype-katex';
// import rehypeRaw from 'rehype-raw'; // Not needed if using dangerouslySetInnerHTML directly
// import 'katex/dist/katex.min.css'; // Only if math is still rendered some other way
import { useToast } from "@/hooks/use-toast";

export default function LessonInteractiveAppPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();

  const lessonId = params.lessonId as string;
  const branch = params.branch as string;
  const subjectId = params.subjectId as string;
  const sectionId = params.sectionId as string;

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (lessonId) {
      const fetchLessonData = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const lessonData = await getLessonById(lessonId); 
          if (lessonData) {
            setLesson(lessonData);
          } else {
            setError("لم يتم العثور على الدرس بالمعرف: " + lessonId + ".");
            toast({ title: "خطأ", description: "التطبيق التفاعلي للدرس " + lessonId + " غير موجود أو تعذر تحميله.", variant: "destructive" });
          }
        } catch (e: any) {
          console.error("Failed to fetch lesson data for interactive app:", e);
          setError("فشل تحميل بيانات الدرس لعرض التطبيق التفاعلي. يرجى المحاولة مرة أخرى.");
          toast({ title: "خطأ فادح", description: e.message || "فشل تحميل التطبيق التفاعلي للدرس.", variant: "destructive" });
        } finally {
          setIsLoading(false);
        }
      };
      fetchLessonData();
    }
  }, [lessonId, toast]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">جاري تحميل التطبيق التفاعلي...</p>
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

  if (!lesson) {
    return (
      <div className="text-center py-10">
        <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
        <p className="text-lg text-muted-foreground">لم يتم العثور على بيانات الدرس.</p>
        <Button onClick={() => router.back()} variant="outline" className="mt-4">
          العودة
        </Button>
      </div>
    );
  }

  const lessonPagePath = `/study/${branch}/${subjectId}/${sectionId}/${lesson.id}`;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <Puzzle className="h-8 w-8 text-primary" />
            <CardTitle className="text-3xl font-bold">تطبيق تفاعلي لدرس: {lesson.title}</CardTitle>
          </div>
          <CardDescription>
            استكشف المحتوى التفاعلي المتعلق بالدرس.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {lesson.interactive_app_content && lesson.interactive_app_content.trim() !== '' ? (
            <div 
              dir="ltr" 
              className="w-full overflow-auto"
              dangerouslySetInnerHTML={{ __html: lesson.interactive_app_content }}
            />
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <ToyBrick className="h-10 w-10 mx-auto mb-2" />
              <p className="text-lg">لا يوجد تطبيق تفاعلي متاح لهذا الدرس حاليًا.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="text-center mt-8">
        <Button onClick={() => router.push(lessonPagePath)} variant="outline">
          <ChevronRight className="ms-2 h-4 w-4" />
          العودة إلى الدرس
        </Button>
      </div>
    </div>
  );
}
