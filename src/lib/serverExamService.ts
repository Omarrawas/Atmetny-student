
// This file is for server-side operations and should NOT include 'use client'.
import { createClient } from '@supabase/supabase-js';
import type { NewsItem, Announcement } from './types';

// Ensure these environment variables are available in your server environment
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabaseInitializationError = "";

if (!supabaseUrl && !supabaseServiceRoleKey) {
  supabaseInitializationError = "Server-side Supabase client cannot be initialized: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are not set.";
} else if (!supabaseUrl) {
  supabaseInitializationError = "Server-side Supabase client cannot be initialized: NEXT_PUBLIC_SUPABASE_URL is not set.";
} else if (!supabaseServiceRoleKey) {
  supabaseInitializationError = "Server-side Supabase client cannot be initialized: SUPABASE_SERVICE_ROLE_KEY is not set.";
}

if (supabaseInitializationError) {
  const fullErrorMessage = supabaseInitializationError + " Please ensure these environment variables are correctly set and accessible to the server process.";
  if (process.env.NODE_ENV !== 'production') {
    console.warn(`${fullErrorMessage} This warning is shown in development if env vars are not available at build time, but they are critical at runtime.`);
  } else {
    console.error(fullErrorMessage + " Server-side Supabase calls will fail.");
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
    // Use the detailed initialization error message if available, otherwise a fallback.
    const errorMsg = supabaseInitializationError || "getNewsItems (serverExamService): Supabase admin client is not initialized. This usually means NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY (server-side) is missing or incorrect in your environment variables.";
    console.error(errorMsg); // Log on server
    throw new Error(errorMsg); // Throw an error to be caught by the calling page.
  }
  try {
    console.log("[serverExamService] getNewsItems: Fetching news articles...");
    const { data, error, status } = await supabaseAdmin
      .from('news_articles')
      .select('id, title, content, image_url, created_at, updated_at')
      .order('created_at', { ascending: false })
      .limit(count);

    if (error) {
      console.error(`[serverExamService] getNewsItems: Supabase error fetching news items. Status: ${status}, Code: ${error.code}, Message: ${error.message}, Details: ${error.details}, Hint: ${error.hint}`);
      throw new Error(`Failed to fetch news items from Supabase: ${error.message} (Code: ${error.code})`);
    }
    
    console.log(`[serverExamService] getNewsItems: Successfully fetched ${data?.length || 0} news items.`);
    return (data || []).map(item => ({
        id: item.id,
        title: item.title,
        content: item.content,
        image_url: item.image_url,
        created_at: item.created_at,
        updated_at: item.updated_at,
    })) as NewsItem[];
  } catch (error: any) {
    console.error("[serverExamService] getNewsItems: Error caught during execution:", error.message);
    // Re-throw the error if it's already specific, or create a new generic one.
    if (error.message.startsWith("Failed to fetch news items") || error.message.includes("Supabase admin client is not initialized")) {
        throw error;
    }
    throw new Error(`An unexpected error occurred while fetching news items: ${error.message}`);
  }
};


/**
 * Fetches active announcements.
 */
export const getActiveAnnouncements = async (count: number = 10): Promise<Announcement[]> => {
  if (!supabaseAdmin) {
    const errorMsg = supabaseInitializationError || "getActiveAnnouncements (serverExamService): Supabase admin client is not initialized. This usually means NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY (server-side) is missing or incorrect in your environment variables.";
    console.error(errorMsg); // Log on server
    throw new Error(errorMsg); // Throw an error to be caught by the calling page.
  }
  try {
    console.log("[serverExamService] getActiveAnnouncements: Fetching active announcements...");
    const { data, error, status } = await supabaseAdmin
      .from('announcements')
      .select('id, title, message, type, is_active, created_at, updated_at')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(count);

    if (error) {
        console.error(`[serverExamService] getActiveAnnouncements: Supabase error fetching announcements. Status: ${status}, Code: ${error.code}, Message: ${error.message}`);
        throw new Error(`Failed to fetch active announcements from Supabase: ${error.message} (Code: ${error.code})`);
    }
    console.log(`[serverExamService] getActiveAnnouncements: Successfully fetched ${data?.length || 0} announcements.`);
    return (data || []) as Announcement[];
  } catch (error: any) {
    console.error("[serverExamService] getActiveAnnouncements: Error caught during execution:", error.message);
    if (error.message.startsWith("Failed to fetch active announcements") || error.message.includes("Supabase admin client is not initialized")) {
        throw error;
    }
    throw new Error(`An unexpected error occurred while fetching active announcements: ${error.message}`);
  }
};

