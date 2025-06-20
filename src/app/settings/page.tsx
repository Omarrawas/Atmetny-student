
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { UserCog, Palette, ShieldCheck, Bell, Check, Eye, Edit } from "lucide-react";
import Link from "next/link";
import { useCustomTheme } from '@/contexts/custom-theme-provider';
import type { ColorTheme } from '@/lib/color-themes';
import { cn } from "@/lib/utils";
import { ThemeColorEditor } from "@/components/theme-editor/theme-color-editor";

// Helper function to render a color swatch or gradient info
const ColorDisplay = ({
  themeId,
  mode,
  colorKey,
  label,
  value,
  isGradient = false,
}: {
  themeId: string;
  mode: 'light' | 'dark';
  colorKey: keyof ColorTheme['colors']['light'];
  label: string;
  value?: string;
  isGradient?: boolean;
}) => {
  if (!value) return null;

  const commonClasses = "text-xs p-1 rounded max-w-[150px] truncate";
  let displayElement;

  if (isGradient) {
    displayElement = <span className={`${commonClasses} bg-muted text-muted-foreground`} title={value}>{value}</span>;
  } else if (value.startsWith("hsl(") || value.startsWith("#") || value.match(/^\d{1,3}\s\d{1,3}%\s\d{1,3}%$/)) {
    const bgColorStyle = value.startsWith("hsl(") || value.startsWith("#") ? value : `hsl(${value})`;
    displayElement = (
      <div className="flex items-center gap-2">
        <div style={{ backgroundColor: bgColorStyle }} className="h-4 w-4 rounded border shrink-0"></div>
        <span className={`${commonClasses} bg-muted text-muted-foreground`} title={value}>{value}</span>
      </div>
    );
  } else {
    displayElement = <span className={`${commonClasses} bg-muted text-muted-foreground`} title={value}>{value}</span>;
  }

  return (
    <div className="flex justify-between items-center text-sm py-1 group">
      <span className="text-muted-foreground">{label}:</span>
      <div className="flex items-center gap-2">
        {displayElement}
        <ThemeColorEditor
            themeId={themeId}
            colorMode={mode}
            colorKey={colorKey}
            initialValue={String(value)} // Ensure initialValue is string
        >
            <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity">
                <Edit className="h-3.5 w-3.5" />
            </Button>
        </ThemeColorEditor>
      </div>
    </div>
  );
};


export default function SettingsPage() {
  const { selectedThemeId, selectTheme, themes, getActiveThemeDefinition } = useCustomTheme();
  const activeTheme = getActiveThemeDefinition();

  const renderThemeColors = (themeDefinition: ColorTheme, mode: 'light' | 'dark', modeName: string) => {
    const modeColors = themeDefinition.colors[mode];
    if (!modeColors) return <p>لا توجد ألوان معرفة لهذا الوضع.</p>;
    
    const colorEntries = Object.entries(modeColors).filter(([key, value]) => value !== undefined && value !== null) as [keyof typeof modeColors, string][];

    return (
      <div className="space-y-1">
        <h4 className="text-md font-semibold text-primary mt-3 mb-1">{modeName}</h4>
        {colorEntries.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-0">
            {colorEntries.map(([key, value]) => (
              <ColorDisplay
                key={`${themeDefinition.id}-${mode}-${key}`}
                themeId={themeDefinition.id}
                mode={mode}
                colorKey={key}
                label={String(key)}
                value={String(value)}
                isGradient={String(key).toLowerCase().includes('gradient')}
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">لم يتم تحديد ألوان لهذا الوضع.</p>
        )}
      </div>
    );
  };


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

      {activeTheme && (
        <Card className="shadow-md">
          <CardHeader>
            <Eye className="h-8 w-8 text-primary mb-2" />
            <CardTitle className="text-xl">معاينة وتحرير قيم النظام اللوني النشط: "{activeTheme.name}"</CardTitle>
            <CardDescription>
              هذه هي قيم الألوان والتدرجات المستخدمة حاليًا. يمكنك الضغط على زر التعديل بجانب كل قيمة لتغييرها (التغييرات تحفظ مؤقتًا في المتصفح).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>{renderThemeColors(activeTheme, "light", "الوضع الفاتح")}</div>
            <Separator />
            <div>{renderThemeColors(activeTheme, "dark", "الوضع الداكن")}</div>
          </CardContent>
        </Card>
      )}
      
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
        </CardContent>
      </Card>
    </div>
  );
}
