import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { mockNewsItems, mockTests } from "@/lib/constants";
import { ArrowLeft, BarChart3, Newspaper, PlusCircle, FileText } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function DashboardPage() {
  const latestNews = mockNewsItems.slice(0, 2);
  const recentTests = mockTests.slice(0, 2);

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">مرحباً بك في أتقني!</CardTitle>
          <CardDescription>
            منصتك التعليمية المتكاملة. ابدأ رحلتك نحو التميز الأكاديمي.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>استكشف اختباراتك، تابع تقدمك، وابق على اطلاع دائم بآخر الأخبار والإعلانات.</p>
        </CardContent>
      </Card>

      <section aria-labelledby="quick-actions-title">
        <h2 id="quick-actions-title" className="text-xl font-semibold mb-4 font-headline">إجراءات سريعة</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إنشاء اختبار جديد</CardTitle>
              <PlusCircle className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">ابدأ الآن</div>
              <p className="text-xs text-muted-foreground">
                خصص اختبارك حسب المادة والمعلم.
              </p>
            </CardContent>
            <CardFooter>
              <Button asChild size="sm" className="w-full">
                <Link href="/tests/new">إنشاء اختبار</Link>
              </Button>
            </CardFooter>
          </Card>
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">اختباراتي السابقة</CardTitle>
              <FileText className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">راجع أدائك</div>
              <p className="text-xs text-muted-foreground">
                استعرض نتائج اختباراتك السابقة.
              </p>
            </CardContent>
            <CardFooter>
              <Button asChild size="sm" variant="outline" className="w-full">
                <Link href="/tests">عرض الاختبارات</Link>
              </Button>
            </CardFooter>
          </Card>
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">تحليل الأداء</CardTitle>
              <BarChart3 className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent-foreground">اكتشف نقاط قوتك</div>
              <p className="text-xs text-muted-foreground">
                احصل على تحليل مفصل لأدائك. (قريباً)
              </p>
            </CardContent>
             <CardFooter>
              <Button size="sm" variant="secondary" className="w-full" disabled>
                عرض التحليل
              </Button>
            </CardFooter>
          </Card>
        </div>
      </section>

      <section aria-labelledby="latest-news-title">
        <div className="flex items-center justify-between mb-4">
          <h2 id="latest-news-title" className="text-xl font-semibold font-headline">آخر الأخبار والإعلانات</h2>
          <Button variant="link" asChild className="text-primary">
            <Link href="/news">عرض الكل <ArrowLeft className="mr-2 h-4 w-4 rtl:mr-0 rtl:ml-2" /></Link>
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {latestNews.map((item) => (
            <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              {item.imageUrl && (
                <Image
                  src={item.imageUrl}
                  alt={item.title}
                  width={600}
                  height={300}
                  className="w-full h-48 object-cover"
                  data-ai-hint={item.dataAiHint || "education news"}
                />
              )}
              <CardHeader>
                <CardTitle className="font-headline text-lg">{item.title}</CardTitle>
                <CardDescription>{item.date}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{item.summary}</p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" asChild size="sm">
                  <Link href={`/news/${item.id}`}>اقرأ المزيد</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>

      <section aria-labelledby="recent-tests-title">
        <div className="flex items-center justify-between mb-4">
          <h2 id="recent-tests-title" className="text-xl font-semibold font-headline">أحدث اختباراتك</h2>
           <Button variant="link" asChild className="text-primary">
            <Link href="/tests">عرض الكل <ArrowLeft className="mr-2 h-4 w-4 rtl:mr-0 rtl:ml-2" /></Link>
          </Button>
        </div>
        {recentTests.length > 0 ? (
          <div className="grid gap-4">
            {recentTests.map((test) => (
              <Card key={test.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-md">{test.subject}</CardTitle>
                  <CardDescription>المعلم: {test.teacher} - بتاريخ: {test.dateTaken}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>الحالة: {test.status === 'Completed' ? `مكتمل - الدرجة: ${test.score}%` : 'قيد الانتظار'}</p>
                </CardContent>
                <CardFooter>
                  <Button asChild size="sm" variant={test.status === 'Completed' ? "default" : "secondary"}>
                    <Link href={`/tests/${test.id}`}>{test.status === 'Completed' ? 'عرض النتائج' : 'عرض الاختبار'}</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">ليس لديك اختبارات حديثة.</p>
        )}
      </section>
    </div>
  );
}
