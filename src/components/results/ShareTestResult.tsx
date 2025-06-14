'use client';

import { Button } from '@/components/ui/button';
import { Share2 } from 'lucide-react'; // Generic share icon
// For specific icons, you might need custom SVGs or a library that includes brand icons
// For simplicity, using generic icons that hint at messaging.

interface ShareTestResultProps {
  testId: string;
  score?: number; // Optional score to include in the share message
  subject?: string; // Optional subject
}

// Placeholder SVG for WhatsApp
const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
    <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38c1.45.79 3.08 1.21 4.79 1.21h.01c5.46 0 9.91-4.45 9.91-9.91s-4.45-9.91-9.92-9.91zm5.14 12.65c-.12.43-.69.78-1.17.82-.4.03-.81.05-1.24-.04-.54-.12-1.14-.41-1.85-1.02-.83-.72-1.38-1.5-1.87-2.29-.28-.44-.51-.89-.67-1.37-.17-.48-.24-.98-.24-1.48s.18-.99.49-1.36c.31-.37.69-.58 1.11-.58.16 0 .31.01.45.03.45.08.62.37.75.62.17.33.48.97.53 1.07.05.1.08.19.02.31-.06.12-.13.2-.25.32-.12.13-.24.27-.36.39-.16.16-.31.34-.43.52-.12.18-.09.39.06.56.15.17.72.98 1.59 1.74.69.62 1.28.93 1.68 1.07.21.07.38.07.52-.03.18-.13.55-.63.71-.85.15-.22.3-.36.48-.36.2 0 .33.05.48.16s.48.45.55.59c.07.14.07.75-.19 1.03z"/>
  </svg>
);

// Placeholder SVG for Telegram
const TelegramIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
    <path d="M21.72 4.16c-.2-.2-.49-.28-.76-.2L2.94 9.57c-.7.27-.78 1.03-.25 1.51l3.88 2.72 2.02 6.85c.17.6.92.92 1.51.72l3.14-1.1 3.05 2.2c.42.31 1.04.21 1.32-.21L22 4.9c.17-.31.1-.65-.08-.94zm-4.87 3.51l-6.8 6.06-1.51-5.12 8.31-3.76v2.82z"/>
  </svg>
);


export function ShareTestResult({ testId, score, subject }: ShareTestResultProps) {
  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/tests/${testId}` : '';
  
  let baseMessage = `لقد أكملت اختباراً في مادة ${subject || 'معينة'} على منصة أتقني!`;
  if (score !== undefined) {
    baseMessage += ` وحصلت على درجة ${score}%.`;
  }
  baseMessage += ` يمكنك الاطلاع على التفاصيل هنا: ${shareUrl}`;

  const handleShare = (platform: 'whatsapp' | 'telegram') => {
    const encodedMessage = encodeURIComponent(baseMessage);
    let url = '';

    if (platform === 'whatsapp') {
      url = `https://api.whatsapp.com/send?text=${encodedMessage}`;
    } else if (platform === 'telegram') {
      url = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodedMessage}`;
    }

    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-lg flex items-center">
          <Share2 className="mr-2 rtl:ml-2 rtl:mr-0 h-5 w-5 text-primary" />
          مشاركة النتيجة
        </CardTitle>
        <CardDescription>شارك نتائج اختبارك مع الأصدقاء أو المعلمين.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col sm:flex-row gap-4">
        <Button onClick={() => handleShare('whatsapp')} className="flex-1 bg-green-500 hover:bg-green-600 text-white">
          <WhatsAppIcon />
          <span className="mr-2 rtl:ml-2 rtl:mr-0">واتساب</span>
        </Button>
        <Button onClick={() => handleShare('telegram')} className="flex-1 bg-blue-500 hover:bg-blue-600 text-white">
          <TelegramIcon />
          <span className="mr-2 rtl:ml-2 rtl:mr-0">تيليجرام</span>
        </Button>
      </CardContent>
    </Card>
  );
}
