'use client';

import { SubscriptionCard } from '@/components/subscriptions/SubscriptionCard';
import { QRCodeModal } from '@/components/subscriptions/QRCodeModal';
import { mockSubscriptionPlans } from '@/lib/constants';
import { useToast } from "@/hooks/use-toast";

export default function SubscriptionsPage() {
  const { toast } = useToast();

  const handleChoosePlan = (planId: string) => {
    const plan = mockSubscriptionPlans.find(p => p.id === planId);
    // Simulate choosing a plan
    console.log('Chose plan:', planId);
    toast({
      title: "تم اختيار الخطة",
      description: `لقد اخترت ${plan?.name || 'خطة'}. قم بإتمام عملية الدفع.`,
    });
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
        <h1 className="text-3xl font-bold mb-4 sm:mb-0 font-headline">خطط الاشتراك</h1>
        <QRCodeModal />
      </div>

      <p className="text-lg text-muted-foreground mb-10 text-center">
        اختر الخطة التي تناسب احتياجاتك وابدأ رحلتك التعليمية مع أتقني.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {mockSubscriptionPlans.map((plan) => (
          <SubscriptionCard key={plan.id} plan={plan} onChoosePlan={handleChoosePlan} />
        ))}
      </div>

      <div className="mt-12 p-6 bg-card border rounded-lg shadow">
        <h2 className="text-2xl font-semibold mb-4 font-headline">هل لديك أسئلة؟</h2>
        <p className="text-muted-foreground mb-2">
          إذا كانت لديك أي استفسارات حول خطط الاشتراك أو كيفية التفعيل، لا تتردد في التواصل معنا.
        </p>
        <p className="text-muted-foreground">
          يمكنك أيضاً تجربة المنصة مجاناً للاطلاع على الميزات قبل الاشتراك.
        </p>
      </div>
    </div>
  );
}
