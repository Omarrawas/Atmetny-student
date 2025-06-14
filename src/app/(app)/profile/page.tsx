import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserCircle } from "lucide-react";

export default function ProfilePage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="font-headline text-2xl flex items-center">
            <UserCircle className="mr-3 h-8 w-8 text-primary rtl:ml-3 rtl:mr-0" />
            الملف الشخصي
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            هذه صفحة الملف الشخصي. يمكنك هنا تعديل معلوماتك الشخصية وتفضيلات الحساب.
            (سيتم تنفيذ هذه الميزة لاحقًا)
          </p>
          {/* Placeholder for profile form or display */}
          <div className="mt-6 space-y-4">
            <div>
              <p className="font-medium">الاسم:</p>
              <p className="text-muted-foreground">اسم المستخدم المثال</p>
            </div>
            <div>
              <p className="font-medium">البريد الإلكتروني:</p>
              <p className="text-muted-foreground">user@example.com</p>
            </div>
             <div>
              <p className="font-medium">نوع الاشتراك:</p>
              <p className="text-muted-foreground">الخطة السنوية (فعالة حتى 2025-05-20)</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
