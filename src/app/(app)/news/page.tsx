import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { mockNewsItems } from "@/lib/constants";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NewsPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold font-headline">الأخبار والإعلانات</h1>
        <Button variant="outline" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4 rtl:ml-2 rtl:mr-0" />
            العودة إلى لوحة التحكم
          </Link>
        </Button>
      </div>

      {mockNewsItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockNewsItems.map((item) => (
            <Card key={item.id} className="flex flex-col overflow-hidden hover:shadow-xl transition-shadow duration-300">
              {item.imageUrl && (
                <div className="aspect-[16/9] relative w-full">
                  <Image
                    src={item.imageUrl}
                    alt={item.title}
                    fill
                    className="object-cover"
                    data-ai-hint={item.dataAiHint || "education announcement"}
                  />
                </div>
              )}
              <CardHeader className="flex-grow">
                <CardTitle className="font-headline text-lg">{item.title}</CardTitle>
                <CardDescription>{item.date}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground line-clamp-3">{item.summary}</p>
              </CardContent>
              <CardFooter>
                <Button variant="link" asChild className="text-primary p-0">
                  <Link href={`/news/${item.id}`}>اقرأ المزيد <ArrowLeft className="mr-1 h-3 w-3 rtl:mr-0 rtl:ml-1"/></Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-xl text-muted-foreground">لا توجد أخبار أو إعلانات حالياً.</p>
        </div>
      )}
    </div>
  );
}
