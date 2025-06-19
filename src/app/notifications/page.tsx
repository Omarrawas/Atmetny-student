
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import type { User as SupabaseAuthUser } from '@supabase/supabase-js';
import {
  getUserNotifications,
  markUserNotificationAsRead,
  markAllUserNotificationsAsRead,
  getUnreadUserNotificationsCount, // For potential refresh
} from '@/lib/notificationService';
import type { UserNotification, UserNotificationType } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, BellRing, CheckCheck, Info, AlertTriangle, XCircle, CheckCircle, ExternalLink, Newspaper, Megaphone } from 'lucide-react';
import { format } from 'date-fns';
import { arSA } from 'date-fns/locale';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const formatDateSafe = (isoString: string | undefined | null): string => {
  if (!isoString) return 'تاريخ غير محدد';
  try {
    const dateToFormat = new Date(isoString);
    if (isNaN(dateToFormat.getTime())) {
      return 'تاريخ غير صالح';
    }
    return format(dateToFormat, 'eeee, d MMMM yyyy, HH:mm', { locale: arSA });
  } catch (e) {
    console.error('Error formatting date:', e, 'Input:', isoString);
    return 'تاريخ غير صالح (خطأ)';
  }
};

const getIconForNotificationType = (type: UserNotificationType): React.ElementType => {
  switch (type) {
    case 'new_announcement':
      return Megaphone;
    case 'exam_reminder':
      return BellRing;
    case 'new_lesson_available':
      return Newspaper; // Or BookOpen, etc.
    case 'general_info':
    default:
      return Info;
  }
};

const getVariantForNotificationType = (type: UserNotificationType): "default" | "destructive" => {
    // Example: make 'error' type notifications destructive
    if (type === 'error_notification_type_example') return "destructive";
    return "default";
};


export default function NotificationsPage() {
  const [authUser, setAuthUser] = useState<SupabaseAuthUser | null>(null);
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  // State for unread count to potentially refresh UI badge, though layout handles primary badge
  const [unreadCount, setUnreadCount] = useState(0);


  const fetchNotifications = useCallback(async (userId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedNotifications = await getUserNotifications(userId, { limit: 50 }); // Fetch latest 50
      setNotifications(fetchedNotifications);
      const count = await getUnreadUserNotificationsCount(userId);
      setUnreadCount(count); // Update local unread count
    } catch (e: any) {
      console.error('Failed to fetch notifications:', e);
      setError('فشل تحميل الإشعارات. يرجى المحاولة مرة أخرى.');
      toast({ title: 'خطأ', description: 'فشل تحميل الإشعارات.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    const getSessionUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user ?? null;
      setAuthUser(user);
      if (user) {
        fetchNotifications(user.id);
      } else {
        setIsLoading(false);
        // router.push('/auth'); // Redirect if not logged in
      }
    };
    getSessionUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      const user = session?.user ?? null;
      setAuthUser(user);
      if (user) {
        fetchNotifications(user.id);
      } else {
        setNotifications([]);
        setUnreadCount(0);
        // router.push('/auth');
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [fetchNotifications, router]);


  const handleMarkAsRead = async (notification: UserNotification) => {
    if (!authUser || notification.is_read) return;
    try {
      await markUserNotificationAsRead(notification.id);
      setNotifications(prev =>
        prev.map(n => (n.id === notification.id ? { ...n, is_read: true } : n))
      );
      // Optionally refresh unread count in header if a global state/context is used
      const count = await getUnreadUserNotificationsCount(authUser.id);
      setUnreadCount(count);
      // router.refresh(); // could also force a server component refresh if applicable

      if (notification.link_path) {
        router.push(notification.link_path);
      }

    } catch (e) {
      console.error('Failed to mark notification as read:', e);
      toast({ title: 'خطأ', description: 'فشل تحديث حالة الإشعار.', variant: 'destructive' });
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!authUser || notifications.every(n => n.is_read)) return;
    try {
      await markAllUserNotificationsAsRead(authUser.id);
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
      // router.refresh();
      toast({ title: 'تم بنجاح', description: 'تم تحديد جميع الإشعارات كمقروءة.' });
    } catch (e) {
      console.error('Failed to mark all notifications as read:', e);
      toast({ title: 'خطأ', description: 'فشل تحديث جميع الإشعارات.', variant: 'destructive' });
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">جاري تحميل الإشعارات...</p>
      </div>
    );
  }

  if (!authUser) {
    return (
      <div className="text-center py-10">
        <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
        <p className="text-lg text-muted-foreground mb-4">الرجاء تسجيل الدخول لعرض الإشعارات.</p>
        <Button asChild>
          <Link href="/auth">تسجيل الدخول</Link>
        </Button>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center">
        <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
        <p className="text-lg text-destructive mb-4">{error}</p>
        <Button onClick={() => authUser && fetchNotifications(authUser.id)} variant="outline">
          إعادة المحاولة
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b">
          <div className="flex items-center gap-3">
            <BellRing className="h-8 w-8 text-primary" />
            <CardTitle className="text-2xl md:text-3xl font-bold">
              الإشعارات ({unreadCount})
            </CardTitle>
          </div>
          {notifications.length > 0 && notifications.some(n => !n.is_read) && (
            <Button onClick={handleMarkAllAsRead} variant="outline" size="sm">
              <CheckCheck className="ms-1.5 h-4 w-4" />
              تحديد الكل كمقروء
            </Button>
          )}
        </CardHeader>
        <CardContent className="p-0">
          {notifications.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Info className="h-10 w-10 mx-auto mb-3" />
              <p className="text-lg">لا توجد إشعارات لديك حاليًا.</p>
            </div>
          ) : (
            <ScrollArea className="h-[calc(100vh-20rem)] sm:h-[calc(100vh-18rem)]">
              <ul className="divide-y divide-border">
                {notifications.map((notification) => {
                  const IconComponent = getIconForNotificationType(notification.type);
                  const alertVariant = getVariantForNotificationType(notification.type);
                  const isExternalLink = notification.link_path?.startsWith('http');

                  return (
                    <li key={notification.id}>
                      <button
                        onClick={() => handleMarkAsRead(notification)}
                        disabled={notification.is_read && !notification.link_path}
                        className={cn(
                          "w-full text-right p-4 hover:bg-muted/50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1",
                          !notification.is_read && "bg-primary/5 dark:bg-primary/10 font-semibold",
                          notification.is_read && "text-muted-foreground"
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <IconComponent className={cn("h-5 w-5 mt-0.5 shrink-0", notification.is_read ? "text-muted-foreground" : "text-primary")} />
                          <div className="flex-1">
                            <div className="flex justify-between items-center">
                                <h4 className={cn("text-base mb-0.5", notification.is_read ? "font-normal" : "font-bold text-foreground")}>
                                    {notification.title}
                                </h4>
                                {!notification.is_read && (
                                    <Badge variant="default" className="text-xs h-5 px-1.5 py-0">جديد</Badge>
                                )}
                            </div>
                            <p className={cn("text-sm leading-relaxed", notification.is_read ? "text-muted-foreground/80" : "text-foreground/90")}>
                              {notification.message}
                            </p>
                            <p className="text-xs text-muted-foreground/70 mt-1.5">
                              {formatDateSafe(notification.created_at)}
                            </p>
                             {notification.link_path && (
                                <div className="mt-2">
                                    {isExternalLink ? (
                                        <a
                                            href={notification.link_path}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onClick={(e) => e.stopPropagation()} // Prevent parent button click
                                            className="text-xs inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline"
                                        >
                                            <ExternalLink className="h-3 w-3"/> فتح الرابط
                                        </a>
                                    ) : (
                                        <span className="text-xs inline-flex items-center gap-1 text-blue-600 dark:text-blue-400">
                                            <ExternalLink className="h-3 w-3"/> اذهب إلى الصفحة
                                        </span>
                                    )}
                                </div>
                            )}
                          </div>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

    