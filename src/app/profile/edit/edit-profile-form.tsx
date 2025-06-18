
'use client';

import { useEffect, useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from "@/hooks/use-toast";
import { useRouter } from 'next/navigation';
import { Loader2, Save, XCircle, Upload } from 'lucide-react';
import type { UserProfileWriteData } from '@/lib/types';
import { supabase } from '@/lib/supabaseClient';
import type { User as SupabaseAuthUser } from '@supabase/supabase-js';
import { saveUserProfile, getUserProfile } from '@/lib/userProfileService';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const profileFormSchema = z.object({
  name: z.string().min(2, { message: "يجب أن يكون الاسم حرفين على الأقل." }).max(50, { message: "يجب ألا يتجاوز الاسم 50 حرفًا." }),
  avatarUrl: z.string().url({ message: "الرجاء إدخال رابط صورة صالح للصورة الرمزية." }).optional().or(z.literal('')), // Will store the path from API
  avatarHint: z.string().max(100, {message: "تلميح الصورة طويل جدًا"}).optional().or(z.literal('')),
  university: z.string().max(100, { message: "اسم الجامعة طويل جدًا"}).optional().or(z.literal('')),
  major: z.string().max(100, { message: "اسم التخصص طويل جدًا"}).optional().or(z.literal('')),
  studentGoals: z.string().max(500, { message: "الأهداف طويلة جدًا"}).optional().or(z.literal('')),
  branch: z.enum(['scientific', 'literary', 'common', 'undetermined']).optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export function EditProfileForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingProfile, setIsFetchingProfile] = useState(true);
  const [authUser, setAuthUser] = useState<SupabaseAuthUser | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState<string | null>(null);

  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: '',
      avatarUrl: '',
      avatarHint: '',
      university: '',
      major: '',
      studentGoals: '',
      branch: 'undetermined',
    },
  });

  useEffect(() => {
    const getSessionAndProfile = async () => {
      setIsFetchingProfile(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setAuthUser(session.user);
        try {
          const profile = await getUserProfile(session.user.id);
          if (profile) {
            form.reset({
              name: profile.name || session.user.email?.split('@')[0] || '',
              avatarUrl: profile.avatar_url || '', // Use avatar_url from Supabase profile
              avatarHint: profile.avatar_hint || 'person avatar',
              university: profile.university || '',
              major: profile.major || '',
              studentGoals: profile.student_goals || '',
              branch: profile.branch || 'undetermined',
            });
            setCurrentAvatarUrl(profile.avatar_url || null); // Set currentAvatarUrl from profile.avatar_url
            setPreview(profile.avatar_url || null); // Initialize preview with current avatar
          } else {
             const defaultName = session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || '';
             const defaultAvatar = session.user.user_metadata?.avatar_url || '';
             form.reset({
                name: defaultName,
                avatarUrl: defaultAvatar,
                avatarHint: 'person avatar',
                university: '',
                major: '',
                studentGoals: '',
                branch: 'undetermined',
             });
             setCurrentAvatarUrl(defaultAvatar || null);
             setPreview(defaultAvatar || null);
          }
        } catch (e) {
          console.error("Failed to fetch profile for editing (Supabase):", e);
          toast({ title: "خطأ", description: "لم نتمكن من تحميل بيانات ملفك الشخصي للتعديل.", variant: "destructive" });
        }
      } else {
        router.push('/auth');
      }
      setIsFetchingProfile(false);
    };
    
    getSessionAndProfile();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        router.push('/auth');
      } else if (session?.user) {
        setAuthUser(session.user);
      } else {
        setAuthUser(null);
        router.push('/auth');
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };

  }, [form, router, toast]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      form.setValue('avatarHint', file.name, { shouldValidate: true }); 
    } else {
      setSelectedFile(null);
      setPreview(currentAvatarUrl); // Revert to current avatar if file selection is cancelled
    }
  };

  const onSubmit: SubmitHandler<ProfileFormValues> = async (data) => {
    if (!authUser || !authUser.email) {
      toast({ title: "خطأ", description: "يجب أن تكون مسجلاً الدخول لتحديث ملفك الشخصي والبريد الإلكتروني مطلوب.", variant: "destructive" });
      return;
    }
    setIsLoading(true);

    let uploadedFilePath: string | undefined = data.avatarUrl || undefined; // Keep existing if no new file

    if (selectedFile) {
      const formData = new FormData();
      formData.append('avatar', selectedFile);

      try {
        const response = await fetch('/api/upload-avatar', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const errorResult = await response.json();
          throw new Error(errorResult.message || 'فشل رفع الصورة.');
        }

        const result = await response.json();
        uploadedFilePath = result.filePath; // This should be like "/uploads/avatars/filename.png"
        toast({ title: "نجاح", description: "تم رفع الصورة المختارة." });
      } catch (uploadError: any) {
        console.error("Avatar upload error:", uploadError);
        toast({ title: "خطأ في رفع الصورة", description: uploadError.message, variant: "destructive" });
        setIsLoading(false);
        return;
      }
    }

    try {
      const profileToSave: UserProfileWriteData = {
        id: authUser.id,
        email: authUser.email,
        name: data.name,
        avatar_url: uploadedFilePath, 
        avatar_hint: selectedFile ? selectedFile.name : data.avatarHint, // Use new filename if uploaded
        university: data.university,
        major: data.major,
        student_goals: data.studentGoals,
        branch: data.branch,
      };

      await saveUserProfile(profileToSave);
      toast({
        title: "تم حفظ التغييرات",
        description: "تم تحديث معلومات ملفك الشخصي بنجاح.",
      });
      setCurrentAvatarUrl(uploadedFilePath || null); // Update currentAvatarUrl for immediate UI feedback if possible
      router.push('/profile');
      router.refresh(); // Refresh to ensure profile page shows updated avatar
    } catch (error) {
      console.error("Supabase profile update error:", error);
      toast({ title: "خطأ في الحفظ", description: "حدث خطأ أثناء محاولة حفظ التغييرات.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetchingProfile) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col items-center space-y-2">
            <Skeleton className="h-24 w-24 rounded-full" />
            <Skeleton className="h-8 w-32" />
        </div>
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <div className="flex gap-3 pt-4">
          <Skeleton className="h-10 flex-auto" />
          <Skeleton className="h-10 flex-auto" />
        </div>
      </div>
    );
  }
  
  // Prioritize preview of selected file, then current DB avatar, then placeholder
  const displayAvatar = preview || `https://placehold.co/150x150.png?text=${(form.getValues('name') || authUser?.email || 'U').charAt(0).toUpperCase()}`;
  const displayHint = selectedFile ? selectedFile.name : (form.getValues('avatarHint') || 'person avatar');


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex flex-col items-center space-y-3 mb-6">
          <Avatar className="h-24 w-24">
            <AvatarImage src={displayAvatar} alt={form.getValues('name') || "User Avatar"} data-ai-hint={displayHint}/>
            <AvatarFallback>{(form.getValues('name') || authUser?.email || 'U').substring(0,2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <Button type="button" variant="outline" size="sm" onClick={() => document.getElementById('avatarUpload')?.click()}>
            <Upload className="ms-2 h-4 w-4" />
            تغيير الصورة
          </Button>
          <Input
            id="avatarUpload"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          {selectedFile && <p className="text-xs text-muted-foreground">الملف المختار: {selectedFile.name}</p>}
        </div>

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>الاسم الكامل</FormLabel>
              <FormControl>
                <Input placeholder="الاسم الكامل" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormItem>
            <FormLabel>البريد الإلكتروني</FormLabel>
            <FormControl>
            <Input type="email" placeholder="البريد الإلكتروني" value={authUser?.email || ''} disabled />
            </FormControl>
            <FormDescription>
            لا يمكن تغيير البريد الإلكتروني من هنا.
            </FormDescription>
        </FormItem>
        
        <FormField
          control={form.control}
          name="avatarHint"
          render={({ field }) => (
            <FormItem>
              <FormLabel>تلميح الصورة الرمزية (اختياري)</FormLabel>
              <FormControl>
                <Input placeholder="مثال: شخص يدرس, أيقونة مستخدم" {...field} 
                       value={selectedFile ? selectedFile.name : field.value} // Show filename if selected
                       readOnly={!!selectedFile} // Make read-only if file is selected
                />
              </FormControl>
              <FormDescription>يساعد في تحسين عمليات البحث عن الصور إذا تم استخدام صور الذكاء الاصطناعي. يتم تحديثه تلقائيًا باسم الملف عند اختيار صورة.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="university"
          render={({ field }) => (
            <FormItem>
              <FormLabel>الجامعة (اختياري)</FormLabel>
              <FormControl>
                <Input placeholder="مثال: جامعة دمشق" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="major"
          render={({ field }) => (
            <FormItem>
              <FormLabel>التخصص (اختياري)</FormLabel>
              <FormControl>
                <Input placeholder="مثال: هندسة المعلوماتية" {...field} />
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
              <FormLabel>الأهداف الدراسية (اختياري)</FormLabel>
              <FormControl>
                <Textarea placeholder="صف أهدافك الدراسية هنا..." {...field} className="min-h-[100px]" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="branch"
          render={({ field }) => (
            <FormItem>
              <FormLabel>الفرع الدراسي (اختياري)</FormLabel>
               <select {...field} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                <option value="undetermined">غير محدد</option>
                <option value="scientific">علمي</option>
                <option value="literary">أدبي</option>
                <option value="common">مشترك</option>
              </select>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button type="submit" disabled={isLoading || isFetchingProfile} className="w-full sm:flex-auto">
            {isLoading ? (
              <>
                <Loader2 className="ms-2 h-4 w-4 animate-spin" />
                جاري الحفظ...
              </>
            ) : (
              <>
                <Save className="ms-2 h-4 w-4" />
                حفظ التغييرات
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/profile')}
            disabled={isLoading || isFetchingProfile}
            className="w-full sm:flex-auto"
          >
             <XCircle className="ms-2 h-4 w-4" />
            إلغاء
          </Button>
        </div>
      </form>
    </Form>
  );
}
    

    