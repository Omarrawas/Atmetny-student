'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { mockSubjects, mockTeachers } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { BookOpen, User, Settings, Info } from "lucide-react";

const newTestSchema = z.object({
  testName: z.string().min(3, { message: "اسم الاختبار يجب أن لا يقل عن 3 أحرف." }),
  subject: z.string({ required_error: "الرجاء اختيار المادة." }),
  teacher: z.string({ required_error: "الرجاء اختيار المعلم." }),
  numberOfQuestions: z.coerce.number().min(1, { message: "عدد الأسئلة يجب أن يكون 1 على الأقل." }).max(100, { message: "لا يمكن أن يتجاوز عدد الأسئلة 100."}),
  testDuration: z.coerce.number().min(5, { message: "مدة الاختبار يجب أن لا تقل عن 5 دقائق." }).max(180, {message: "مدة الاختبار لا يمكن أن تتجاوز 180 دقيقة."}),
  instructions: z.string().optional(),
});

type NewTestFormValues = z.infer<typeof newTestSchema>;

export default function NewTestPage() {
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<NewTestFormValues>({
    resolver: zodResolver(newTestSchema),
    defaultValues: {
      testName: "",
      numberOfQuestions: 10,
      testDuration: 30,
      instructions: "",
    },
  });

  function onSubmit(data: NewTestFormValues) {
    console.log("New test data:", data);
    // Simulate API call
    toast({
      title: "تم إنشاء الاختبار بنجاح!",
      description: `الاختبار "${data.testName}" جاهز الآن.`,
    });
    // Redirect to the tests page or the newly created test page
    router.push('/tests'); 
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-2xl mx-auto shadow-xl">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">إنشاء اختبار جديد</CardTitle>
          <CardDescription>قم بتخصيص إعدادات اختبارك التدريبي.</CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="testName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center"><Info className="mr-2 rtl:ml-2 rtl:mr-0 h-4 w-4 text-muted-foreground" />اسم الاختبار</FormLabel>
                    <FormControl>
                      <Input placeholder="مثال: اختبار الرياضيات للفصل الأول" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center"><BookOpen className="mr-2 rtl:ml-2 rtl:mr-0 h-4 w-4 text-muted-foreground" />المادة</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر المادة" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {mockSubjects.map((subject) => (
                            <SelectItem key={subject.id} value={subject.id}>{subject.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="teacher"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center"><User className="mr-2 rtl:ml-2 rtl:mr-0 h-4 w-4 text-muted-foreground" />المعلم</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر المعلم" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {mockTeachers.map((teacher) => (
                            <SelectItem key={teacher.id} value={teacher.id}>{teacher.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="numberOfQuestions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center"><Settings className="mr-2 rtl:ml-2 rtl:mr-0 h-4 w-4 text-muted-foreground" />عدد الأسئلة</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="10" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="testDuration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center"><Settings className="mr-2 rtl:ml-2 rtl:mr-0 h-4 w-4 text-muted-foreground" />مدة الاختبار (بالدقائق)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="30" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="instructions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center"><Info className="mr-2 rtl:ml-2 rtl:mr-0 h-4 w-4 text-muted-foreground" />تعليمات إضافية (اختياري)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="اكتب أي تعليمات خاصة بالاختبار هنا..." {...field} />
                    </FormControl>
                    <FormDescription>
                      سيتم عرض هذه التعليمات للطلاب قبل بدء الاختبار.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "جاري الإنشاء..." : "إنشاء الاختبار"}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
