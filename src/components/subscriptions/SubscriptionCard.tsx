import type { SubscriptionPlan } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface SubscriptionCardProps {
  plan: SubscriptionPlan;
  onChoosePlan: (planId: string) => void;
}

export function SubscriptionCard({ plan, onChoosePlan }: SubscriptionCardProps) {
  const getPriceDisplay = () => {
    if (plan.priceMonthly > 0) return { price: plan.priceMonthly, period: 'شهرياً' };
    if (plan.priceQuarterly > 0) return { price: plan.priceQuarterly, period: 'كل 3 أشهر' };
    if (plan.priceAnnually > 0) return { price: plan.priceAnnually, period: 'سنوياً' };
    return { price: 0, period: 'مجاني' };
  };

  const { price, period } = getPriceDisplay();

  return (
    <Card className={cn("flex flex-col justify-between h-full hover:shadow-xl transition-shadow duration-300", plan.isPopular && "border-primary border-2 ring-2 ring-primary shadow-lg")}>
      <CardHeader>
        {plan.isPopular && <Badge variant="default" className="absolute top-0 right-0 -mt-3 -mr-3 rtl:-ml-3 rtl:-mr-0 bg-accent text-accent-foreground px-3 py-1">الأكثر شيوعاً</Badge>}
        <CardTitle className="font-headline text-xl">{plan.name}</CardTitle>
        <CardDescription>{plan.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="mb-6">
          <span className="text-4xl font-bold">${price}</span>
          <span className="text-muted-foreground">/{period}</span>
        </div>
        <ul className="space-y-2">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2 rtl:ml-2 rtl:mr-0" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
        {plan.trialDays && (
          <p className="text-sm text-primary mt-4">
            يتضمن تجربة مجانية لمدة {plan.trialDays} أيام!
          </p>
        )}
      </CardContent>
      <CardFooter>
        <Button
          className={cn("w-full", plan.isPopular ? "bg-primary hover:bg-primary/90" : "bg-secondary hover:bg-secondary/80 text-secondary-foreground")}
          onClick={() => onChoosePlan(plan.id)}
          aria-label={`Choose ${plan.name} plan`}
        >
          اختر الخطة
        </Button>
      </CardFooter>
    </Card>
  );
}
