
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { UserCog, Palette, ShieldCheck, Bell, Check } from "lucide-react";
import Link from "next/link";
import { useCustomTheme } from '@/contexts/custom-theme-provider';
import { predefinedThemes, type ColorTheme } from '@/lib/color-themes';
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const { selectedThemeId, selectTheme, themes } = useCustomTheme();

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">الإعدادات</h1>
        <p className="text-muted-foreground">
          قم بإدارة تفضيلات حسابك وإعدادات التطبيق من هنا.
        </p>
      </header>

      <Card className="shadow-md">
        <CardHeader>
          <UserCog className="h-8 w-8 text-primary mb-2" />
          <CardTitle className="text-xl">إعدادات الحساب</CardTitle>
          <CardDescription>
            تعديل معلومات ملفك الشخصي وتفضيلات الحساب.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild variant="outline">
            <Link href="/profile/edit">تعديل الملف الشخصي</Link>
          </Button>
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader>
          <Palette className="h-8 w-8 text-primary mb-2" />
          <CardTitle className="text-xl">إعدادات المظهر والألوان</CardTitle>
          <CardDescription>
            خصص ألوان التطبيق واختر الوضع الليلي/النهاري.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-md font-semibold mb-2">اختيار نظام الألوان:</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {themes.map((themeOption) => (
                <Button
                  key={themeOption.id}
                  variant={selectedThemeId === themeOption.id ? "default" : "outline"}
                  onClick={() => selectTheme(themeOption.id)}
                  className={cn(
                    "w-full justify-between transition-all duration-200 ease-in-out",
                    selectedThemeId === themeOption.id && "ring-2 ring-primary ring-offset-2"
                  )}
                >
                  <span>{themeOption.name}</span>
                  {selectedThemeId === themeOption.id && <Check className="h-4 w-4" />}
                </Button>
              ))}
            </div>
          </div>
          <Separator />
          <div>
            <h3 className="text-md font-semibold mb-2">الوضع العام (فاتح/داكن):</h3>
            <p className="text-sm text-muted-foreground">
              يمكنك تغيير الوضع العام (فاتح/داكن/نظام) من أيقونة الشمس/القمر الموجودة في الشريط العلوي.
            </p>
          </div>
        </CardContent>
      </Card>
      
      <Card className="shadow-md">
        <CardHeader>
          <Bell className="h-8 w-8 text-primary mb-2" />
          <CardTitle className="text-xl">إعدادات الإشعارات (قريباً)</CardTitle>
          <CardDescription>
            تحكم في الإشعارات التي تتلقاها من التطبيق.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            سيتم تفعيل هذه الميزة في التحديثات القادمة.
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader>
          <ShieldCheck className="h-8 w-8 text-primary mb-2" />
          <CardTitle className="text-xl">الخصوصية والأمان (قريباً)</CardTitle>
          <CardDescription>
            مراجعة سياسات الخصوصية وإدارة إعدادات الأمان الخاصة بك.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
             سيتم تفعيل هذه الميزة في التحديثات القادمة.
          </p>
          {/* <Button variant="link" asChild>
            <Link href="/privacy-policy">عرض سياسة الخصوصية</Link>
          </Button> */}
        </CardContent>
      </Card>
    </div>
  );
}
