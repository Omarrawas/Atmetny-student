
import { Metadata } from "next";
import { getNewsItems as getInitialNewsItems } from "@/lib/serverExamService";
import type { NewsItem } from "@/lib/types";
import NewsListClient from "./news-list-client";

export const metadata: Metadata = {
  title: "آخر الأخبار | Atmetny",
  description: "تابع آخر الأخبار والتحديثات المتعلقة بالمنصة والتعليم.",
};

// This page component will now fetch initial data and pass it to a client component.
export default async function NewsPage() {
  let initialNews: NewsItem[] = [];
  let fetchError: string | null = null;

  try {
    // Fetch initial news items (e.g., latest 20)
    initialNews = await getInitialNewsItems(20); 
  } catch (error: any) {
    console.error("Failed to fetch initial news items for page:", error);
    fetchError = "حدث خطأ أثناء تحميل الأخبار مبدئياً. يرجى المحاولة مرة أخرى لاحقًا.";
    // If serverExamService throws a more specific error, that will be used.
    if (error.message.includes("Supabase client cannot be initialized") || 
        error.message.startsWith("Failed to fetch news items")) {
        fetchError = error.message; // Pass the specific error
    }
  }

  return (
    // Pass initial data and any fetch error to the client component
    <NewsListClient initialNews={initialNews} initialError={fetchError} />
  );
}
