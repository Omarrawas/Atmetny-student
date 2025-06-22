
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/lib/supabaseClient';
import { Loader2, Lock, KeyRound, AlertTriangle } from 'lucide-react';
import type { Session } from '@supabase/supabase-js';

const updatePasswordSchema = z.object({
  password: z.string().min(6, { message: "يجب أن تكون كلمة المرور 6 أحرف على الأقل." }),
  confirmPassword: z.string().min(6),
}).refine(data => data.password === data.confirmPassword, {
  message: "كلمتا المرور غير متطابقتين.",
  path: ["confirmPassword"],
});

type UpdatePasswordFormValues = z.infer<typeof updatePasswordSchema>;

export default function UpdatePasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<UpdatePasswordFormValues>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  useEffect(() => {
    // Supabase's onAuthStateChange with PASSWORD_RECOVERY event is the key.
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setSession(session);
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const onSubmit: SubmitHandler<UpdatePasswordFormValues> = async (data) => {
    setIsLoading(true);
    setError(null);
    const { error } = await supabase.auth.updateUser({ password: data.password });

    setIsLoading(false);
    if (error) {
      setError(error.message);
      toast({
        title: "خطأ في تحديث كلمة المرور",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "تم بنجاح",
        description: "تم تحديث كلمة المرور بنجاح. يمكنك الآن تسجيل الدخول.",
      });
      // Sign out to clear the recovery session
      await supabase.auth.signOut();
      router.push('/auth');
    }
  };

  // If a session does not exist, it means the user hasn't come from a recovery link
  // We wait for a moment to see if the session gets set by the auth listener.
  // After a short timeout, if still no session, we show the message.
  const [showWaitingMessage, setShowWaitingMessage] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!session) {
        setShowWaitingMessage(true);
      }
    }, 1500); // Wait 1.5 seconds

    return () => clearTimeout(timer);
  }, [session]);

  if (!session && showWaitingMessage) {
    return (
       <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] py-8">
        <Card className="w-full max-w-md shadow-xl text-center">
            <CardHeader>
                 <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-3" />
                 <CardTitle>في انتظار رابط الاستعادة</CardTitle>
            </CardHeader>
            <CardContent>
                <p>يجب الوصول إلى هذه الصفحة من خلال رابط إعادة تعيين كلمة المرور الذي تم إرساله إلى بريدك الإلكتروني.</p>
            </CardContent>
        </Card>
      </div>
    );
  }

  if (!session && !showWaitingMessage) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] py-8">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">التحقق من جلسة استعادة كلمة المرور...</p>
        </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] py-8">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <KeyRound className="h-12 w-12 text-primary mx-auto mb-3" />
          <CardTitle className="text-3xl font-bold">تحديث كلمة المرور</CardTitle>
          <CardDescription className="text-lg">
            أدخل كلمة المرور الجديدة لحسابك.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>كلمة المرور الجديدة</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input dir="ltr" type="password" placeholder="********" {...field} className="ps-10" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>تأكيد كلمة المرور الجديدة</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input dir="ltr" type="password" placeholder="********" {...field} className="ps-10" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? <Loader2 className="ms-2 h-4 w-4 animate-spin" /> : null}
                تحديث كلمة المرور
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
