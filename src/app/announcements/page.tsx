
import { Metadata } from "next";
import { getActiveAnnouncements as getInitialAnnouncements } from "@/lib/serverExamService";
import type { Announcement } from "@/lib/types";
import AnnouncementsListClient from "./announcements-list-client";

export const metadata: Metadata = {
  title: "الإعلانات والإشعارات | Atmetny",
  description: "تابع آخر الإعلانات والإشعارات الهامة من منصة Atmetny.",
};

export default async function AnnouncementsPage() {
  let initialAnnouncements: Announcement[] = [];
  let fetchError: string | null = null;

  try {
    initialAnnouncements = await getInitialAnnouncements(20); 
  } catch (error: any) {
    console.error("Failed to fetch initial announcements for page:", error);
    fetchError = "حدث خطأ أثناء تحميل الإعلانات مبدئياً. يرجى المحاولة مرة أخرى لاحقًا.";
    // Pass through specific Supabase init errors if they occur
    if (error.message.includes("Supabase client cannot be initialized") ||
        error.message.startsWith("Failed to fetch active announcements")) {
        fetchError = error.message;
    }
  }

  return (
    <AnnouncementsListClient initialAnnouncements={initialAnnouncements} initialError={fetchError} />
  );
}
