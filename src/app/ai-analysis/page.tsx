
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Construction } from "lucide-react";

export default function AiAnalysisPage() {
  return (
    <div className="max-w-xl mx-auto space-y-8 text-center">
      <Card className="shadow-lg border-primary/30">
        <CardHeader className="pt-8">
          <Construction className="h-20 w-20 text-primary mx-auto mb-6" />
          <CardTitle className="text-3xl font-bold">ميزة تحليل الأداء بالذكاء الاصطناعي</CardTitle>
          <CardDescription className="text-xl text-muted-foreground pt-2">
            هذه الميزة قيد التطوير حالياً وستكون متاحة قريباً.
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-8">
          <p className="text-lg">
            نعمل بجد على تطوير أدوات تحليل متقدمة لمساعدتك على فهم أدائك بشكل أفضل وتحديد نقاط القوة والضعف لديك.
          </p>
          <p className="text-muted-foreground mt-3">
            شكراً لتفهمك، يرجى التحقق مرة أخرى في وقت لاحق!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
