import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SettingsIcon } from "lucide-react"; // Renamed to avoid conflict with constant

export default function SettingsPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="font-headline text-2xl flex items-center">
            <SettingsIcon className="mr-3 h-8 w-8 text-primary rtl:ml-3 rtl:mr-0" />
            الإعدادات
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            هذه صفحة الإعدادات. يمكنك هنا تخصيص تفضيلات التطبيق مثل اللغة، الإشعارات، والمظهر.
            (سيتم تنفيذ هذه الميزة لاحقًا)
          </p>
          {/* Placeholder for settings options */}
          <div className="mt-6 space-y-4">
            <div>
              <p className="font-medium">لغة الواجهة:</p>
              <p className="text-muted-foreground">العربية (الحالية)</p>
            </div>
            <div>
              <p className="font-medium">إشعارات البريد الإلكتروني:</p>
              <p className="text-muted-foreground">مفعلة</p>
            </div>
             <div>
              <p className="font-medium">المظهر:</p>
              <p className="text-muted-foreground">فاتح (تلقائي)</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
