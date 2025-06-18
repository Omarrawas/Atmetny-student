
// This file is for server-side operations and should NOT include 'use client'.
import { createClient } from '@supabase/supabase-js';
import type { NewsItem, Announcement } from './types';

// Ensure these environment variables are available in your server environment
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  if (process.env.NODE_ENV !== 'production') {
    console.warn("Supabase URL or Service Role Key is not set. Server-side Supabase calls will fail. This is expected during build if env vars are not available.");
  } else {
    throw new Error("Supabase URL or Service Role Key is not set. Server-side Supabase calls will fail.");
  }
}

// Initialize Supabase client for server-side operations
// Only initialize if URL and key are present to avoid errors during build or in environments where they might not be set
const supabaseAdmin = supabaseUrl && supabaseServiceRoleKey ? createClient(supabaseUrl, supabaseServiceRoleKey) : null;


/**
 * Fetches news items from the 'news_articles' table.
 * This function is intended to be called from Server Components.
 */
export const getNewsItems = async (count: number = 20): Promise<NewsItem[]> => {
  if (!supabaseAdmin) {
    console.warn("getNewsItems (serverExamService): Supabase client not initialized. Returning empty array.");
    return [];
  }
  try {
    const { data, error } = await supabaseAdmin
      .from('news_articles')
      .select('id, title, content, image_url, created_at, updated_at')
      .order('created_at', { ascending: false })
      .limit(count);

    if (error) {
      console.error("Error fetching news items from Supabase (serverExamService): ", error);
      throw error;
    }
    return (data || []).map(item => ({
        id: item.id,
        title: item.title,
        content: item.content,
        image_url: item.image_url,
        created_at: item.created_at,
        updated_at: item.updated_at,
    })) as NewsItem[];
  } catch (error) {
    console.error("Error in getNewsItems (serverExamService): ", error);
    // Depending on how you want to handle errors in Server Components,
    // you might throw, or return an empty array, or an object indicating an error.
    // For now, re-throwing to let the page handle it.
    throw error;
  }
};


/**
 * Fetches active announcements.
 * TODO: Implement this function to fetch active announcements from Supabase.
 */
export const getActiveAnnouncements = async (count: number = 10): Promise<Announcement[]> => {
  if (!supabaseAdmin) {
    console.warn("getActiveAnnouncements (serverExamService): Supabase client not initialized. Returning empty array.");
    return [];
  }
  try {
    const { data, error } = await supabaseAdmin
      .from('announcements')
      .select('id, title, message, type, is_active, created_at, updated_at')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(count);
    if (error) {
        console.error("Error fetching active announcements from Supabase (serverExamService): ", error);
        throw error;
    }
    return (data || []) as Announcement[];
  } catch (error) {
    console.error("Error in getActiveAnnouncements (serverExamService): ", error);
    throw error;
  }
};

