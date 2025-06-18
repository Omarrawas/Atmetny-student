
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, Star, Zap, AlertTriangle } from "lucide-react";
import type { SubscriptionPlan } from "@/lib/types";
import { getSubscriptionPlans } from "@/lib/serverExamService";

export default async function SubscribePage() {
  let plans: SubscriptionPlan[] = [];
  let fetchError: string | null = null;

  try {
    plans = await getSubscriptionPlans();
  } catch (error: any) {
    console.error("Error fetching subscription plans for page:", error);
    fetchError = error.message || "حدث خطأ أثناء تحميل خطط الاشتراك. يرجى المحاولة مرة أخرى لاحقًا.";
  }

  return (
    <div className="space-y-12">
      <header className="text-center space-y-3">
        <h1 className="text-4xl font-bold tracking-tight">خطط اشتراك مرنة تناسبك</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          اختر الخطة التي تلبي احتياجاتك التعليمية وتساعدك على تحقيق أفضل النتائج في Atmetny.
        </p>
        {/* <p className="text-sm text-muted-foreground">
          *جميع الأسعار بالليرة السورية (ل.س) ما لم يذكر خلاف ذلك.
        </p> */}
      </header>

      {fetchError && (
        <Alert variant="destructive" className="max-w-2xl mx-auto">
          <AlertTriangle className="h-5 w-5" />
          <AlertTitle>خطأ في تحميل الخطط</AlertTitle>
          <AlertDescription>{fetchError}</AlertDescription>
        </Alert>
      )}

      {!fetchError && plans.length === 0 && (
         <Card className="max-w-md mx-auto text-center py-10">
          <CardContent>
            <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg text-muted-foreground">
              لا توجد خطط اشتراك متاحة حالياً. يرجى مراجعة المسؤول.
            </p>
          </CardContent>
        </Card>
      )}

      {!fetchError && plans.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {plans.map((plan) => (
            <Card key={plan.id} className={`flex flex-col ${plan.is_featured ? 'border-2 border-primary shadow-2xl relative overflow-hidden' : 'hover:shadow-xl transition-shadow'}`}>
              {plan.is_featured && plan.tagline && (
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-xs font-semibold rounded-bl-lg z-10">
                  <Star className="inline-block me-1 h-3 w-3" /> {plan.tagline}
                </div>
              )}
              <CardHeader className="text-center pb-4">
                {!plan.is_featured && plan.tagline && <p className="text-xs text-muted-foreground mb-1">{plan.tagline}</p>}
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <div className="mt-2">
                  <span className="text-4xl font-extrabold">
                    {plan.price === 0 ? 'مجاناً' : plan.price.toLocaleString('ar-SA')}
                  </span>
                  {plan.price !== 0 && <span className="text-sm text-muted-foreground ms-1">{plan.currency}</span>}
                  {plan.period_label !== "للأبد" && <span className="text-muted-foreground">{plan.period_label}</span>}
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <ul className="space-y-3 text-sm">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className={`h-5 w-5 mt-0.5 shrink-0 ${plan.is_featured ? 'text-primary' : 'text-green-500'}`} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button className={`w-full text-lg py-3 ${plan.is_featured ? '' : 'variant="outline"'}`}>
                  {plan.cta_text}
                  {plan.is_featured && <Zap className="ms-2 h-4 w-4" />}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
