
'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { Announcement } from "@/lib/types";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card"; // Removed CardHeader, CardTitle as not directly used in client
import { format } from 'date-fns';
import { arSA } from 'date-fns/locale';
import { Megaphone, Info, CheckCircle, AlertTriangle as AlertTriangleIcon, XCircle, CalendarDays, AlertCircle, Loader2 } from "lucide-react";
import type { RealtimeChannel } from '@supabase/supabase-js';

const formatDateSafe = (isoString: string | undefined): string => {
  if (!isoString) return 'تاريخ غير محدد';
  try {
    const dateToFormat = new Date(isoString);
    if (isNaN(dateToFormat.getTime())) {
        return 'تاريخ غير صالح (بعد التحويل)';
    }
    return format(dateToFormat, 'd MMMM yyyy, HH:mm', { locale: arSA });
  } catch (e) {
    console.error("Error formatting date:", e, "Input:", isoString);
    return 'تاريخ غير صالح (خطأ)';
  }
};

const getIconForType = (type: Announcement['type']): React.ElementType => {
  switch (type) {
    case 'success': return CheckCircle;
    case 'info': return Info;
    case 'warning': return AlertTriangleIcon;
    case 'error': return XCircle;
    case 'general': default: return Megaphone;
  }
};

const getAlertVariantForType = (type: Announcement['type']): "default" | "destructive" => {
  switch (type) {
    case 'error': return "destructive";
    case 'warning': return "default"; 
    default: return "default";
  }
};

interface AnnouncementsListClientProps {
  initialAnnouncements: Announcement[];
  initialError: string | null;
}

export default function AnnouncementsListClient({ initialAnnouncements, initialError }: AnnouncementsListClientProps) {
  const [announcements, setAnnouncements] = useState<Announcement[]>(initialAnnouncements.filter(a => a.is_active));
  const [error, setError] = useState<string | null>(initialError);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setError(initialError);
    setAnnouncements(initialAnnouncements.filter(a => a.is_active));
  }, [initialAnnouncements, initialError]);

  useEffect(() => {
    const announcementsChannel: RealtimeChannel = supabase
      .channel('public-announcements')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'announcements' },
        (payload) => {
          console.log('[AnnouncementsListClient] Real-time announcement event:', payload);
          setAnnouncements(currentAnnouncements => {
            let newAnnouncementsList = [...currentAnnouncements];
            const changedItem = (payload.new || payload.old) as Announcement;

            if (payload.eventType === 'INSERT') {
              const newItem = payload.new as Announcement;
              if (newItem.is_active && !newAnnouncementsList.find(item => item.id === newItem.id)) {
                newAnnouncementsList = [newItem, ...newAnnouncementsList];
              }
            } else if (payload.eventType === 'UPDATE') {
              const updatedItem = payload.new as Announcement;
              const index = newAnnouncementsList.findIndex(item => item.id === updatedItem.id);
              if (updatedItem.is_active) {
                if (index > -1) {
                  newAnnouncementsList[index] = updatedItem; // Update existing
                } else {
                  newAnnouncementsList.push(updatedItem); // Add if it became active and wasn't there
                }
              } else { // Item became inactive
                if (index > -1) {
                  newAnnouncementsList.splice(index, 1); // Remove if became inactive
                }
              }
            } else if (payload.eventType === 'DELETE') {
              const deletedItemId = (payload.old as { id: string }).id;
              newAnnouncementsList = newAnnouncementsList.filter(item => item.id !== deletedItemId);
            }
            // Sort by creation date descending and limit
            return newAnnouncementsList.sort((a, b) => new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime()).slice(0, 20);
          });
        }
      )
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          console.log('[AnnouncementsListClient] Subscribed to announcements changes.');
        }
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
            console.error(`[AnnouncementsListClient] Subscription issue for announcements: ${status}`, err);
        }
      });

    return () => {
      supabase.removeChannel(announcementsChannel).catch(console.error);
      console.log('[AnnouncementsListClient] Unsubscribed from announcements changes.');
    };
  }, []);

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <header className="mb-8 text-center">
        <Megaphone className="h-16 w-16 text-primary mx-auto mb-4" />
        <h1 className="text-4xl font-bold tracking-tight">الإعلانات والإشعارات</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          هنا تجد آخر التحديثات والمعلومات الهامة المتعلقة بمنصة Atmetny.
        </p>
      </header>

      {isLoading && !announcements.length && (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="ms-3 text-lg">جاري تحميل الإعلانات...</p>
        </div>
      )}

      {error && (
        <Alert variant="destructive" className="shadow-md">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle>خطأ في تحميل الإعلانات</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!isLoading && !error && announcements.length === 0 && (
        <Card className="text-center py-10 shadow-md">
          <CardContent>
            <Info className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-xl text-muted-foreground">
              لا توجد إعلانات أو إشعارات متاحة حالياً.
            </p>
          </CardContent>
        </Card>
      )}

      {!isLoading && !error && announcements.length > 0 && (
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
                  <span>نُشر في: {formatDateSafe(item.created_at)}</span>
                </div>
              </Alert>
            );
          })}
        </div>
      )}
    </div>
  );
}
