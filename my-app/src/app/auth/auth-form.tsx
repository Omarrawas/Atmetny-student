
'use client';

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from "@/hooks/use-toast";
// import { auth, googleProvider } from '@/lib/firebase'; // Firebase auth commented out
// import {
//   createUserWithEmailAndPassword,
//   signInWithEmailAndPassword,
//   signInWithPopup,
//   type AuthError,
//   type UserCredential,
//   type User as FirebaseAuthUser,
// } from 'firebase/auth'; // Firebase auth types commented out
import { supabase } from '@/lib/supabaseClient'; // Import Supabase client
import type { AuthError, User as SupabaseAuthUser } from '@supabase/supabase-js';

import { Loader2, Mail, Lock, UserPlus, LogInIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
// import { saveUserProfile } from '@/lib/userProfileService'; // Firebase specific, commented out for now

const loginSchema = z.object({
  email: z.string().email({ message: "الرجاء إدخال بريد إلكتروني صالح." }),
  password: z.string().min(6, { message: "يجب أن تكون كلمة المرور 6 أحرف على الأقل." }),
});

const signupSchema = z.object({
  email: z.string().email({ message: "الرجاء إدخال بريد إلكتروني صالح." }),
  password: z.string().min(6, { message: "يجب أن تكون كلمة المرور 6 أحرف على الأقل." }),
  confirmPassword: z.string().min(6, { message: "يجب أن تكون كلمة المرور 6 أحرف على الأقل." }),
}).refine(data => data.password === data.confirmPassword, {
  message: "كلمتا المرور غير متطابقتين.",
  path: ["confirmPassword"],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type SignupFormValues = z.infer<typeof signupSchema>;

const GoogleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px">
    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
    <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
    <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
    <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l0.002-0.002l6.19,5.238C39.907,35.666,44,30.138,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
  </svg>
);


export function AuthForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false); // Keep for UI, though functionality is commented
  const { toast } = useToast();
  const router = useRouter();

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const signupForm = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { email: '', password: '', confirmPassword: '' },
  });

  const handleAuthSuccess = async (supabaseUser: SupabaseAuthUser | null, action: 'login' | 'signup') => {
    if (supabaseUser) {
      toast({ title: action === 'login' ? "تم تسجيل الدخول بنجاح!" : "تم إنشاء الحساب بنجاح!" });
      // TODO: Implement user profile creation/update in your Supabase 'profiles' table.
      // This might involve calling a Supabase Edge Function or directly inserting/updating.
      // Example (conceptual):
      // if (action === 'signup') {
      //   const { error: profileError } = await supabase.from('profiles').upsert({
      //     id: supabaseUser.id,
      //     email: supabaseUser.email,
      //     name: supabaseUser.email?.split('@')[0] || 'مستخدم جديد',
      //     // Initialize other profile fields as needed
      //   });
      //   if (profileError) console.error("Error creating Supabase profile:", profileError);
      // }
      console.log("Supabase user:", supabaseUser);
    }
    router.push('/');
    router.refresh(); // To re-fetch layout user state if it depends on cookies/session
  };

  const handleAuthError = (error: AuthError | null, defaultMessage: string) => {
    console.error("Supabase Auth Error:", error);
    toast({
      title: "خطأ في المصادقة",
      description: error?.message || defaultMessage,
      variant: "destructive",
    });
  };

  const onLoginSubmit: SubmitHandler<LoginFormValues> = async (data) => {
    setIsLoading(true);
    const { error, data: loginData } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });
    setIsLoading(false);

    if (error) {
      handleAuthError(error, "فشل تسجيل الدخول. يرجى التحقق من بياناتك.");
    } else {
      handleAuthSuccess(loginData.user, 'login');
    }
  };

  const onSignupSubmit: SubmitHandler<SignupFormValues> = async (data) => {
    setIsLoading(true);
    const { error, data: signupData } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      // Supabase handles email confirmation flow if enabled in project settings
    });
    setIsLoading(false);

    if (error) {
      handleAuthError(error, "فشل إنشاء الحساب. قد يكون البريد مستخدماً.");
    } else if (signupData.user) {
        if (signupData.session) { // User is automatically signed in
             handleAuthSuccess(signupData.user, 'signup');
        } else { // Email confirmation might be required
            toast({
                title: "تم إرسال رسالة تأكيد",
                description: "الرجاء التحقق من بريدك الإلكتروني لتأكيد حسابك قبل تسجيل الدخول.",
                variant: "default",
                duration: 9000,
            });
            router.push('/'); // Or a page indicating to check email
        }
    } else {
        handleAuthError(null, "حدث خطأ غير متوقع أثناء إنشاء الحساب.");
    }
  };

  // const handleGoogleSignIn = async () => {
  //   setIsGoogleLoading(true);
  //   // TODO: Implement Google Sign-In with Supabase
  //   // This typically involves:
  //   // const { data, error } = await supabase.auth.signInWithOAuth({
  //   //   provider: 'google',
  //   //   options: { redirectTo: window.location.origin } // Or your specific callback URL
  //   // });
  //   // if (error) handleAuthError(error, "فشل تسجيل الدخول باستخدام جوجل.");
  //   // else if (data.user) handleAuthSuccess(data.user, 'login'); // Or based on new user status
  //   toast({ title: "قيد التطوير", description: "تسجيل الدخول بجوجل مع Supabase قيد التطوير."});
  //   setIsGoogleLoading(false);
  // };

  return (
    <div className="w-full space-y-6">
      <Tabs defaultValue="login" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login">تسجيل الدخول</TabsTrigger>
          <TabsTrigger value="signup">إنشاء حساب</TabsTrigger>
        </TabsList>

        <TabsContent value="login">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">تسجيل الدخول</CardTitle>
              <CardDescription>أدخل بريدك الإلكتروني وكلمة المرور للمتابعة.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                  <FormField
                    control={loginForm.control}
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
                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>كلمة المرور</FormLabel>
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
                  <Button type="submit" disabled={isLoading} className="w-full">
                    {isLoading ? <Loader2 className="ms-2 h-4 w-4 animate-spin" /> : <LogInIcon className="ms-2 h-4 w-4" />}
                    تسجيل الدخول
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="signup">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">إنشاء حساب جديد</CardTitle>
              <CardDescription>املأ النموذج أدناه لإنشاء حسابك.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...signupForm}>
                <form onSubmit={signupForm.handleSubmit(onSignupSubmit)} className="space-y-4">
                  <FormField
                    control={signupForm.control}
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
                  <FormField
                    control={signupForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>كلمة المرور</FormLabel>
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
                    control={signupForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>تأكيد كلمة المرور</FormLabel>
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
                  <Button type="submit" disabled={isLoading} className="w-full">
                    {isLoading ? <Loader2 className="ms-2 h-4 w-4 animate-spin" /> : <UserPlus className="ms-2 h-4 w-4" />}
                    إنشاء حساب
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">أو أكمل باستخدام</span>
        </div>
      </div>

      <Button variant="outline" /* onClick={handleGoogleSignIn} */ disabled={isGoogleLoading || true} className="w-full">
        {isGoogleLoading ? <Loader2 className="ms-2 h-4 w-4 animate-spin" /> : <GoogleIcon />}
        تسجيل الدخول باستخدام جوجل (Supabase - قيد التطوير)
      </Button>
    </div>
  );
}
