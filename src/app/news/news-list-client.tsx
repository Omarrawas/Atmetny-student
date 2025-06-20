
'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { NewsItem } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { format } from 'date-fns';
import { arSA } from 'date-fns/locale';
import { AlertTriangle, CalendarDays, Newspaper, Loader2 } from "lucide-react";
import type { RealtimeChannel } from '@supabase/supabase-js';

const formatDateSafe = (isoString: string | undefined | null): string => {
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

interface NewsListClientProps {
  initialNews: NewsItem[];
  initialError: string | null;
}

export default function NewsListClient({ initialNews, initialError }: NewsListClientProps) {
  const [newsItems, setNewsItems] = useState<NewsItem[]>(initialNews);
  const [error, setError] = useState<string | null>(initialError);
  const [isLoading, setIsLoading] = useState(false); 

  useEffect(() => {
    setError(initialError); // Set error from server-side fetch
    setNewsItems(initialNews); // Set initial news from server-side fetch
  }, [initialNews, initialError]);

  useEffect(() => {
    const newsChannel: RealtimeChannel = supabase
      .channel('public-news-articles')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'news_articles' },
        (payload) => {
          console.log('[NewsListClient] Real-time news event:', payload);
          setNewsItems(currentNews => {
            let newNewsList = [...currentNews];
            if (payload.eventType === 'INSERT') {
              const newItem = payload.new as NewsItem;
              if (!newNewsList.find(item => item.id === newItem.id)) {
                newNewsList = [newItem, ...newNewsList];
              }
            } else if (payload.eventType === 'UPDATE') {
              const updatedItem = payload.new as NewsItem;
              const index = newNewsList.findIndex(item => item.id === updatedItem.id);
              if (index > -1) {
                newNewsList[index] = updatedItem;
              } else {
                 newNewsList.unshift(updatedItem); // Add if not present (e.g., visibility change)
              }
            } else if (payload.eventType === 'DELETE') {
              const deletedItem = payload.old as { id: string };
              newNewsList = newNewsList.filter(item => item.id !== deletedItem.id);
            }
            // Sort by creation date descending and limit to ensure UI doesn't grow indefinitely
            return newNewsList.sort((a, b) => new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime()).slice(0, 50); 
          });
        }
      )
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          console.log('[NewsListClient] Subscribed to news_articles changes.');
        }
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
            console.error(`[NewsListClient] Subscription issue for news_articles: ${status}`, err);
        }
      });

    return () => {
      supabase.removeChannel(newsChannel).catch(console.error);
      console.log('[NewsListClient] Unsubscribed from news_articles changes.');
    };
  }, []);

  return (
    <div className="space-y-8">
      <header className="mb-8 text-center">
        <Newspaper className="h-16 w-16 text-primary mx-auto mb-4" />
        <h1 className="text-4xl font-bold tracking-tight">آخر الأخبار</h1>
        <p className="mt-2 text-lg text-muted-foreground max-w-2xl mx-auto">
          كن على اطلاع دائم بآخر التطورات والإعلانات الهامة المتعلقة بمنصة Atmetny والعملية التعليمية.
        </p>
      </header>

      {isLoading && !newsItems.length && (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="ms-3 text-lg">جاري تحميل الأخبار...</p>
        </div>
      )}

      {error && (
        <div className="flex flex-col items-center justify-center text-center bg-destructive/10 text-destructive p-6 rounded-lg shadow-md border border-destructive">
          <AlertTriangle className="h-12 w-12 mb-4" />
          <h2 className="text-2xl font-semibold mb-2">خطأ في تحميل الأخبار</h2>
          <p>{error}</p>
        </div>
      )}

      {!isLoading && !error && newsItems.length === 0 && (
        <div className="text-center py-10 bg-card shadow-md rounded-lg">
          <AlertTriangle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-xl text-muted-foreground">
            لا توجد أخبار متاحة حالياً.
          </p>
        </div>
      )}

      {!isLoading && !error && newsItems.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {newsItems.map((item) => (
            <Card key={item.id} className="flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 bg-card">
              {item.image_url && item.image_url.trim() !== '' ? (
                <div className="relative w-full h-52">
                  <Image
                    src={item.image_url}
                    alt={item.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover"
                    data-ai-hint="news article image"
                  />
                </div>
              ) : (
                 <div className="relative w-full h-52 bg-muted flex items-center justify-center">
                   <Newspaper className="h-16 w-16 text-muted-foreground opacity-50" />
                 </div>
              )}
              <CardHeader className="pb-3">
                <CardTitle className="text-xl line-clamp-2">
                  {item.title}
                </CardTitle>
                <div className="text-xs text-muted-foreground space-y-1.5 mt-2">
                  <div className="flex items-center gap-1.5">
                    <CalendarDays className="h-3.5 w-3.5" />
                    <span>
                      {formatDateSafe(item.created_at)}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-grow pt-0">
                <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed max-h-32 overflow-y-auto"> 
                  {item.content}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
