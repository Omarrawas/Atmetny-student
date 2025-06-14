import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { mockNewsItems } from "@/lib/constants";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, CalendarDays } from "lucide-react";
import { notFound } from "next/navigation";

interface SingleNewsPageProps {
  params: { id: string };
}

async function getNewsItem(id: string) {
  // In a real app, fetch this from a database or API
  return mockNewsItems.find(item => item.id === id);
}

export default async function SingleNewsPage({ params }: SingleNewsPageProps) {
  const newsItem = await getNewsItem(params.id);

  if (!newsItem) {
    notFound();
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <Button variant="outline" asChild className="mb-6">
          <Link href="/news">
            <ArrowLeft className="mr-2 h-4 w-4 rtl:ml-2 rtl:mr-0" />
            العودة إلى جميع الأخبار
          </Link>
        </Button>

        <Card className="overflow-hidden shadow-lg">
          {newsItem.imageUrl && (
            <div className="aspect-[16/9] relative w-full">
              <Image
                src={newsItem.imageUrl}
                alt={newsItem.title}
                fill
                className="object-cover"
                data-ai-hint={newsItem.dataAiHint || "detailed news"}
              />
            </div>
          )}
          <CardHeader>
            <CardTitle className="font-headline text-3xl mb-2">{newsItem.title}</CardTitle>
            <CardDescription className="flex items-center text-sm text-muted-foreground">
              <CalendarDays className="mr-2 h-4 w-4 rtl:ml-2 rtl:mr-0" />
              <span>نشر في: {newsItem.date}</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <article className="prose dark:prose-invert max-w-none rtl">
              <p className="lead text-lg text-muted-foreground mb-6">{newsItem.summary}</p>
              {newsItem.content ? (
                <div dangerouslySetInnerHTML={{ __html: newsItem.content.replace(/\n/g, '<br />') }} />
              ) : (
                <p>لا يوجد محتوى إضافي لهذا الخبر.</p>
              )}
            </article>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
