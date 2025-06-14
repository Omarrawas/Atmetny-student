'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useState } from "react";

interface AuthFormProps {
  mode: 'login' | 'signup';
}

const loginSchema = z.object({
  email: z.string().email({ message: "الرجاء إدخال بريد إلكتروني صحيح." }),
  password: z.string().min(6, { message: "كلمة المرور يجب أن لا تقل عن 6 أحرف." }),
});

const signupSchema = z.object({
  fullName: z.string().min(3, { message: "الاسم الكامل يجب أن لا يقل عن 3 أحرف." }),
  email: z.string().email({ message: "الرجاء إدخال بريد إلكتروني صحيح." }),
  password: z.string().min(6, { message: "كلمة المرور يجب أن لا تقل عن 6 أحرف." }),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "كلمتا المرور غير متطابقتين.",
  path: ["confirmPassword"],
});

export function AuthForm({ mode }: AuthFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const formSchema = mode === 'login' ? loginSchema : signupSchema;
  type FormValues = z.infer<typeof formSchema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: mode === 'login' 
      ? { email: "", password: "" } 
      : { fullName: "", email: "", password: "", confirmPassword: "" },
  });

  async function onSubmit(data: FormValues) {
    setIsLoading(true);
    console.log(`${mode} data:`, data);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    toast({
      title: mode === 'login' ? "تم تسجيل الدخول بنجاح!" : "تم إنشاء الحساب بنجاح!",
      description: mode === 'login' ? "مرحباً بعودتك." : "يمكنك الآن تسجيل الدخول.",
    });
    setIsLoading(false);
    router.push('/dashboard'); 
  }

  return (
    <Card className="w-full shadow-xl">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">{mode === 'login' ? 'تسجيل الدخول' : 'إنشاء حساب جديد'}</CardTitle>
        <CardDescription>
          {mode === 'login' ? 'أدخل بياناتك للوصول إلى حسابك.' : 'املأ النموذج لإنشاء حساب جديد.'}
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {mode === 'signup' && (
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الاسم الكامل</FormLabel>
                    <FormControl>
                      <Input placeholder="مثال: أحمد محمد" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>البريد الإلكتروني</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="user@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>كلمة المرور</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="********" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {mode === 'signup' && (
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>تأكيد كلمة المرور</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="********" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin rtl:ml-2 rtl:mr-0" />}
              {mode === 'login' ? 'تسجيل الدخول' : 'إنشاء حساب'}
            </Button>
            <p className="text-sm text-muted-foreground">
              {mode === 'login' ? 'ليس لديك حساب؟ ' : 'لديك حساب بالفعل؟ '}
              <Button variant="link" asChild className="p-0 text-primary">
                <Link href={mode === 'login' ? '/auth/signup' : '/auth/login'}>
                  {mode === 'login' ? 'أنشئ حساباً جديداً' : 'سجل الدخول'}
                </Link>
              </Button>
            </p>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
