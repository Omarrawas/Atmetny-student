
'use client';

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/lib/supabaseClient';
import { Loader2, Mail, KeySquare, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const forgotPasswordSchema = z.object({
  email: z.string().email({ message: "الرجاء إدخال بريد إلكتروني صالح." }),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit: SubmitHandler<ForgotPasswordFormValues> = async (data) => {
    setIsLoading(true);
    setIsSuccess(false);

    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${window.location.origin}/auth/update-password`,
    });

    setIsLoading(false);
    if (error) {
      console.error("Forgot Password Error:", error);
      toast({
        title: "خطأ",
        description: error.message || "فشل إرسال رابط إعادة التعيين. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "تم إرسال الطلب",
        description: "إذا كان البريد الإلكتروني مسجلاً لدينا، فستتلقى رابطًا لإعادة تعيين كلمة المرور قريبًا.",
      });
      setIsSuccess(true);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] py-8">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <KeySquare className="h-12 w-12 text-primary mx-auto mb-3" />
          <CardTitle className="text-3xl font-bold">استعادة كلمة المرور</CardTitle>
          <CardDescription className="text-lg">
            أدخل بريدك الإلكتروني وسنرسل لك رابطًا لإعادة تعيين كلمة مرورك.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isSuccess ? (
            <div className="text-center space-y-4">
              <p className="text-green-600">تم إرسال رابط إعادة تعيين كلمة المرور بنجاح. يرجى التحقق من بريدك الإلكتروني (بما في ذلك مجلد الرسائل غير المرغوب فيها).</p>
              <Button asChild>
                <Link href="/auth">العودة لتسجيل الدخول</Link>
              </Button>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>البريد الإلكتروني</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input dir="ltr" type="email" placeholder="name@example.com" {...field} className="ps-10" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? <Loader2 className="ms-2 h-4 w-4 animate-spin" /> : null}
                  إرسال رابط الاستعادة
                </Button>
              </form>
            </Form>
          )}
        </CardContent>
        <CardFooter>
            <Button variant="link" asChild className="w-full">
                <Link href="/auth">
                    <ArrowRight className="ms-2 h-4 w-4"/>
                    تذكرت كلمة المرور؟ العودة لتسجيل الدخول
                </Link>
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
