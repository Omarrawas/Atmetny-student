
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Users, Zap, Link as LinkIcon, ExternalLink } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useAppSettings } from "@/contexts/app-settings-context";
import type { SocialMediaLink } from "@/lib/types";

export default function CommunityPage() {
  const { settings, getIconComponent } = useAppSettings();
  const socialLinks = settings?.social_media_links || [];
  const supportEmail = settings?.support_email;

  return (
    <div className="max-w-3xl mx-auto text-center space-y-8">
      <header className="space-y-3">
        <Users className="h-16 w-16 text-primary mx-auto" />
        <h1 className="text-4xl font-bold">مجتمع {settings?.app_name || "Atmetny"}</h1>
        <p className="text-xl text-muted-foreground">
          تواصل، تعلم، وشارك مع زملائك الطلاب والمعلمين في بيئة تفاعلية وآمنة.
        </p>
      </header>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>قريباً... منتدى النقاش التفاعلي!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Image src="https://placehold.co/600x350.png" alt="طلاب يتناقشون" width={600} height={350} className="rounded-lg mx-auto shadow-md mb-4" data-ai-hint="students discussion" />
          <p className="text-lg text-muted-foreground">
            نعمل بجد لإطلاق منتدى تفاعلي حيث يمكنك:
          </p>
          <ul className="list-disc list-inside space-y-2 text-start mx-auto max-w-md text-muted-foreground">
            <li>طرح الأسئلة والحصول على إجابات من المعلمين والطلاب.</li>
            <li>مناقشة المواضيع الدراسية المختلفة.</li>
            <li>مشاركة النصائح والمصادر التعليمية.</li>
            <li>تكوين مجموعات دراسية.</li>
          </ul>
          <p className="text-lg font-semibold mt-6">
            ترقبوا التحديثات!
          </p>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="text-2xl font-semibold">في هذه الأثناء...</h3>
        <p className="text-muted-foreground">
            يمكنك متابعتنا على وسائل التواصل الاجتماعي أو التواصل مع فريق الدعم إذا كانت لديك أي استفسارات.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
            {supportEmail && (
                 <Button variant="outline" asChild>
                    <a href={`mailto:${supportEmail}`}>
                        <MessageSquare className="ms-2 h-4 w-4" />
                        تواصل معنا عبر الإيميل
                    </a>
                </Button>
            )}
            {socialLinks.map(link => {
                const IconComponent = getIconComponent(link.icon);
                return (
                    <Button variant="outline" key={link.platform} asChild>
                        <a href={link.url} target="_blank" rel="noopener noreferrer">
                            <IconComponent className="ms-2 h-4 w-4" />
                            تابعنا على {link.platform}
                        </a>
                    </Button>
                );
            })}
             {settings?.support_phone_number && (
                 <Button variant="outline" asChild>
                    <a href={`tel:${settings.support_phone_number}`}>
                        <Zap className="ms-2 h-4 w-4" />
                        اتصل بنا: {settings.support_phone_number}
                    </a>
                </Button>
            )}
        </div>
      </div>
    </div>
  );
}

