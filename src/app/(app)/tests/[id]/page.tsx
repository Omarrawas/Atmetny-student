import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PerformanceAnalysisSection } from "@/components/results/PerformanceAnalysisSection";
import { ShareTestResult } from "@/components/results/ShareTestResult";
import { mockTests } from "@/lib/constants"; // Using mock data for now
import { ArrowLeft, BarChart3, CalendarCheck2, CheckCircle, HelpCircle, Percent } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { notFound } from "next/navigation";

interface TestResultPageProps {
  params: { id: string };
}

// Simulate fetching test data
async function getTestDetails(id: string) {
  // In a real app, fetch this from a database or API
  const test = mockTests.find(t => t.id === id);
  if (!test) {
    return null;
  }
  // Simulate adding more details for the result page
  return {
    ...test,
    questions: [ // Example detailed questions, normally fetched
      { id: 'q1', text: 'ما هي عاصمة فرنسا؟', studentAnswer: 'باريس', correctAnswer: 'باريس', score: 1 },
      { id: 'q2', text: '2 + 2 = ?', studentAnswer: '5', correctAnswer: '4', score: 0 },
    ],
    totalQuestions: 20,
    correctAnswers: test.score ? Math.round(test.score/100 * 20) : 0, // Assuming score is percentage
    timeTaken: "45 دقيقة",
  };
}


export default async function TestResultPage({ params }: TestResultPageProps) {
  const testDetails = await getTestDetails(params.id);

  if (!testDetails) {
    notFound(); // Or redirect to a 404 page
  }
  
  const isCompleted = testDetails.status === 'Completed' && typeof testDetails.score === 'number';

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold font-headline">
          نتائج اختبار: {testDetails.subject}
        </h1>
        <Button variant="outline" asChild>
          <Link href="/tests">
            <ArrowLeft className="mr-2 h-4 w-4 rtl:ml-2 rtl:mr-0" />
            العودة إلى قائمة الاختبارات
          </Link>
        </Button>
      </div>

      {!isCompleted && (
         <Alert variant="default" className="bg-accent/50 border-accent">
            <HelpCircle className="h-5 w-5 text-accent-foreground" />
            <AlertTitle className="font-headline text-accent-foreground">الاختبار غير مكتمل</AlertTitle>
            <AlertDescription>
              هذا الاختبار لم يتم إكماله بعد أو لم يتم تصحيحه. لا تتوفر نتائج مفصلة في الوقت الحالي.
              {testDetails.status === 'Pending' && (
                <Button asChild size="sm" className="mt-2">
                  <Link href={`/tests/take/${testDetails.id}`}>بدء الاختبار الآن</Link>
                </Button>
              )}
               {testDetails.status === 'In Progress' && (
                <Button asChild size="sm" className="mt-2">
                  <Link href={`/tests/take/${testDetails.id}`}>متابعة الاختبار</Link>
                </Button>
              )}
            </AlertDescription>
          </Alert>
      )}

      {isCompleted && (
        <>
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="font-headline text-xl flex items-center">
                <BarChart3 className="mr-2 rtl:ml-2 rtl:mr-0 h-6 w-6 text-primary" />
                ملخص الأداء
              </CardTitle>
              <CardDescription>
                نظرة عامة على أدائك في اختبار مادة {testDetails.subject} الذي أجري بتاريخ {testDetails.dateTaken}.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="flex items-center space-x-3 rtl:space-x-reverse p-4 bg-muted/50 rounded-lg">
                <div className="p-3 rounded-full bg-primary/20 text-primary">
                  <Percent className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">الدرجة النهائية</p>
                  <p className="text-2xl font-bold">{testDetails.score}%</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 rtl:space-x-reverse p-4 bg-muted/50 rounded-lg">
                <div className="p-3 rounded-full bg-green-500/20 text-green-600">
                  <CheckCircle className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">الإجابات الصحيحة</p>
                  <p className="text-2xl font-bold">{testDetails.correctAnswers} / {testDetails.totalQuestions}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 rtl:space-x-reverse p-4 bg-muted/50 rounded-lg">
                <div className="p-3 rounded-full bg-yellow-500/20 text-yellow-600">
                  <CalendarCheck2 className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">الوقت المستغرق</p>
                  <p className="text-2xl font-bold">{testDetails.timeTaken}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <PerformanceAnalysisSection />
          <ShareTestResult testId={params.id} score={testDetails.score} subject={testDetails.subject} />
        </>
      )}
    </div>
  );
}

// Fallback for notFound, can be customized
export function TestNotFound() {
  return (
    <div className="text-center py-10">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="text-xl text-muted-foreground">لم يتم العثور على الاختبار المطلوب.</p>
      <Button asChild className="mt-4">
        <Link href="/tests">العودة إلى قائمة الاختبارات</Link>
      </Button>
    </div>
  );
}
