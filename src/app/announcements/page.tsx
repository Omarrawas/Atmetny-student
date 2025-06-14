
import { Metadata } from "next";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getActiveAnnouncements } from "@/lib/serverExamService"; // TODO: Needs migration
import type { Announcement } from "@/lib/types";
import { format } from 'date-fns';
import { arSA } from 'date-fns/locale';
import { Megaphone, Info, CheckCircle, AlertTriangle as AlertTriangleIcon, XCircle, CalendarDays, AlertCircle } from "lucide-react"; 

export const metadata: Metadata = {
  title: "الإعلانات والإشعارات | Atmetny",
  description: "تابع آخر الإعلانات والإشعارات الهامة من منصة Atmetny.",
};

// Helper to safely format ISO date string or potentially Firestore Timestamp if migration is partial
const formatDateSafe = (timestampOrIsoString: string | undefined /* | Timestamp */): string => {
  if (!timestampOrIsoString) return 'تاريخ غير محدد';
  try {
    let dateToFormat: Date;
    if (typeof timestampOrIsoString === 'string') {
      dateToFormat = new Date(timestampOrIsoString);
    } else if (timestampOrIsoString && typeof (timestampOrIsoString as any).toDate === 'function') {
      // Fallback for Firestore Timestamp if still present during migration
      dateToFormat = (timestampOrIsoString as any).toDate();
    } else {
      return 'تاريخ غير صالح (نوع غير معروف)';
    }
    
    if (isNaN(dateToFormat.getTime())) {
        return 'تاريخ غير صالح (بعد التحويل)';
    }
    return format(dateToFormat, 'd MMMM yyyy, HH:mm', { locale: arSA });
  } catch (e) {
    console.error("Error formatting date:", e, "Input:", timestampOrIsoString);
    return 'تاريخ غير صالح (خطأ)';
  }
};


const getIconForType = (type: Announcement['type']): React.ElementType => {
  switch (type) {
    case 'success':
      return CheckCircle;
    case 'info':
      return Info;
    case 'warning':
      return AlertTriangleIcon; 
    case 'error':
      return XCircle;
    case 'general':
    default:
      return Megaphone;
  }
};

const getAlertVariantForType = (type: Announcement['type']): "default" | "destructive" => {
  switch (type) {
    case 'error':
      return "destructive";
    case 'warning': 
      return "default"; 
    default:
      return "default";
  }
};


export default async function AnnouncementsPage() {
  let announcements: Announcement[] = [];
  let fetchError: string | null = null;

  try {
    announcements = await getActiveAnnouncements(20); // TODO: This service needs migration to Supabase
  } catch (error) {
    console.error("Failed to fetch announcements for page (Firebase):", error);
    fetchError = "حدث خطأ أثناء تحميل الإعلانات. يرجى المحاولة مرة أخرى لاحقًا. (Service needs migration)";
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <header className="mb-8 text-center">
        <Megaphone className="h-16 w-16 text-primary mx-auto mb-4" />
        <h1 className="text-4xl font-bold tracking-tight">الإعلانات والإشعارات</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          هنا تجد آخر التحديثات والمعلومات الهامة المتعلقة بمنصة Atmetny.
        </p>
      </header>

      {fetchError && (
        <Alert variant="destructive" className="shadow-md">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle>خطأ في تحميل الإعلانات</AlertTitle>
          <AlertDescription>{fetchError}</AlertDescription>
        </Alert>
      )}

      {!fetchError && announcements.length === 0 && (
        <Card className="text-center py-10 shadow-md">
          <CardContent>
            <Info className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-xl text-muted-foreground">
              لا توجد إعلانات أو إشعارات متاحة حالياً.
            </p>
          </CardContent>
        </Card>
      )}

      {!fetchError && announcements.length > 0 && (
        <div className="space-y-6">
          {announcements.map((item) => {
            const IconComponent = getIconForType(item.type);
            const alertVariant = getAlertVariantForType(item.type);
            return (
              <Alert key={item.id} variant={alertVariant} className="shadow-lg">
                <IconComponent className="h-5 w-5" />
                <AlertTitle className="text-xl mb-1">{item.title}</AlertTitle>
                <AlertDescription className="whitespace-pre-wrap text-foreground/90 leading-relaxed">
                  {item.message}
                </AlertDescription>
                <div className="mt-3 pt-3 border-t border-border/50 text-xs text-muted-foreground flex items-center gap-1.5">
                  <CalendarDays className="h-3.5 w-3.5" />
                  <span>نُشر في: {formatDateSafe(item.createdAt)}</span>
                </div>
              </Alert>
            );
          })}
        </div>
      )}
    </div>
  );
}
