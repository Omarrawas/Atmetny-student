'use client';

import { useState, useTransition } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { analyzeStudentPerformance, AnalyzeStudentPerformanceInput, AnalyzeStudentPerformanceOutput } from '@/ai/flows/analyze-student-performance';
import { useToast } from '@/hooks/use-toast';
import { Brain, Lightbulb, Loader2, AlertTriangle, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';

const performanceAnalysisSchema = z.object({
  testResults: z.string().min(10, { message: "الرجاء إدخال بيانات نتائج الاختبار." }),
  studentGoals: z.string().min(5, { message: "الرجاء إدخال أهداف الطالب." }),
});

type PerformanceAnalysisFormValues = z.infer<typeof performanceAnalysisSchema>;

async function analyzePerformanceAction(data: AnalyzeStudentPerformanceInput): Promise<AnalyzeStudentPerformanceOutput | { error: string }> {
  try {
    const result = await analyzeStudentPerformance(data);
    return result;
  } catch (error) {
    console.error("AI Analysis Error:", error);
    return { error: "حدث خطأ أثناء تحليل الأداء. يرجى المحاولة مرة أخرى." };
  }
}

export function PerformanceAnalysisSection() {
  const [analysisResult, setAnalysisResult] = useState<AnalyzeStudentPerformanceOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const form = useForm<PerformanceAnalysisFormValues>({
    resolver: zodResolver(performanceAnalysisSchema),
    defaultValues: {
      testResults: "", // Example: '{ "q1": { "answer": "A", "correct": "B" }, "q2": { "answer": "C", "correct": "C" } }'
      studentGoals: "", // Example: 'Improve understanding of topic X, score above 80%'
    },
  });

  function onSubmit(data: PerformanceAnalysisFormValues) {
    setError(null);
    setAnalysisResult(null);
    startTransition(async () => {
      const result = await analyzePerformanceAction(data);
      if ('error' in result) {
        setError(result.error);
        toast({ title: "خطأ في التحليل", description: result.error, variant: "destructive" });
      } else {
        setAnalysisResult(result);
        toast({ title: "اكتمل التحليل", description: "تم تحليل أدائك بنجاح.", variant: "default" });
      }
    });
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-xl flex items-center">
          <Brain className="mr-2 rtl:ml-2 rtl:mr-0 h-6 w-6 text-primary" />
          تحليل الأداء بالذكاء الاصطناعي
        </CardTitle>
        <CardDescription>
          أدخل نتائج اختبارك وأهدافك للحصول على تحليل مفصل ومقترحات للتحسين.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="testResults"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>نتائج الاختبار</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='أدخل نتائج الاختبار هنا (يفضل بصيغة JSON، مثال: {"question1": {"studentAnswer": "A", "correctAnswer": "B"}, ...})'
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="studentGoals"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>أهداف الطالب</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="مثال: فهم أفضل لموضوع الجبر، الحصول على درجة أعلى من 85% في الاختبار القادم."
                      className="min-h-[60px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin rtl:ml-2 rtl:mr-0" />
                  جاري التحليل...
                </>
              ) : (
                <>
                  <Lightbulb className="mr-2 h-4 w-4 rtl:ml-2 rtl:mr-0" />
                  ابدأ التحليل
                </>
              )}
            </Button>
          </form>
        </Form>

        {isPending && !analysisResult && !error && (
          <div className="mt-6 space-y-4">
            <Skeleton className="h-8 w-1/2 rounded-md" />
            <Skeleton className="h-20 w-full rounded-md" />
            <Skeleton className="h-8 w-1/3 rounded-md" />
            <Skeleton className="h-16 w-full rounded-md" />
          </div>
        )}

        {error && (
          <Alert variant="destructive" className="mt-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>خطأ</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {analysisResult && !error && (
          <div className="mt-8 space-y-6">
            <Alert variant="default" className="bg-primary/10 border-primary/30">
               <CheckCircle className="h-5 w-5 text-primary" />
              <AlertTitle className="font-headline text-primary">ملخص التحليل الشامل</AlertTitle>
              <AlertDescription className="text-foreground/80">
                {analysisResult.overallFeedback}
              </AlertDescription>
            </Alert>

            <div>
              <h3 className="font-semibold text-lg mb-2 font-headline text-destructive">مجالات تحتاج إلى تحسين:</h3>
              <p className="text-muted-foreground whitespace-pre-line">{analysisResult.areasToImprove}</p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2 font-headline text-green-600">نقاط القوة:</h3>
              <p className="text-muted-foreground whitespace-pre-line">{analysisResult.strengths}</p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2 font-headline text-primary">مقترحات خطة الدراسة:</h3>
              <p className="text-muted-foreground whitespace-pre-line">{analysisResult.studyPlanSuggestions}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
