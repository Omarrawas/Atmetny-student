
// This file is for server-side operations and should NOT include 'use client'.
import { createClient } from '@supabase/supabase-js';
import type { NewsItem, Announcement, SubscriptionPlan, AppSettings, SocialMediaLink } from './types';

// Ensure these environment variables are available in your server environment
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabaseInitializationError = "";

if (!supabaseUrl) {
  supabaseInitializationError += "Server-side Supabase client cannot be initialized: NEXT_PUBLIC_SUPABASE_URL is not set. ";
}
if (!supabaseServiceRoleKey) {
  supabaseInitializationError += "Server-side Supabase client cannot be initialized: SUPABASE_SERVICE_ROLE_KEY is not set. ";
}

if (supabaseInitializationError) {
  supabaseInitializationError += "Please ensure these environment variables are correctly set and accessible to the server process.";
  // Log loudly during development if keys are missing, as it's a common setup issue.
  // In production, this might be too noisy if logs are monitored for errors,
  // but critical for debugging why server-side calls fail.
  console.error(supabaseInitializationError + " Server-side Supabase calls will fail if not resolved.");
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
    console.error(errorMsg); 
    throw new Error(errorMsg); 
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

/**
 * Fetches active subscription plans.
 */
export const getSubscriptionPlans = async (): Promise<SubscriptionPlan[]> => {
  if (!supabaseAdmin) {
    const errorMsg = supabaseInitializationError || "getSubscriptionPlans (serverExamService): Supabase admin client is not initialized. This usually means NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY (server-side) is missing or incorrect in your environment variables.";
    console.error(errorMsg);
    throw new Error(errorMsg);
  }
  try {
    console.log("[serverExamService] getSubscriptionPlans: Fetching active subscription plans...");
    const { data, error, status } = await supabaseAdmin
      .from('subscription_plans')
      .select('id, name, price, currency, period_label, features, cta_text, is_featured, tagline, is_active, display_order, created_at, updated_at')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) {
      console.error(`[serverExamService] getSubscriptionPlans: Supabase error fetching subscription plans. Status: ${status}, Code: ${error.code}, Message: ${error.message}`);
      throw new Error(`Failed to fetch subscription plans from Supabase: ${error.message} (Code: ${error.code})`);
    }
    console.log(`[serverExamService] getSubscriptionPlans: Successfully fetched ${data?.length || 0} subscription plans.`);
    return (data || []).map(plan => ({
      ...plan,
      price: Number(plan.price) // Ensure price is a number
    })) as SubscriptionPlan[];
  } catch (error: any) {
    console.error("[serverExamService] getSubscriptionPlans: Error caught during execution:", error.message);
    if (error.message.startsWith("Failed to fetch subscription plans") || error.message.includes("Supabase admin client is not initialized")) {
        throw error;
    }
    throw new Error(`An unexpected error occurred while fetching subscription plans: ${error.message}`);
  }
};

/**
 * Fetches application settings. Assumes there is only one row of settings.
 */
export const getAppSettings = async (): Promise<AppSettings | null> => {
  if (!supabaseAdmin) {
    const errorMsg = supabaseInitializationError || "getAppSettings (serverExamService): Supabase admin client is not initialized. Ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are correctly set.";
    console.error(errorMsg);
    // For getAppSettings, we might want to return null or default settings instead of throwing,
    // so the app can still function with defaults if settings are misconfigured.
    // However, for initial setup, throwing helps identify the problem.
    // Let's return null for now and let consuming components handle it.
    return null; 
  }
  try {
    console.log("[serverExamService] getAppSettings: Fetching application settings...");
    // Fetch the row with the known fixed ID, or the first row if no fixed ID is used.
    // Using a fixed ID '00000000-0000-0000-0000-000000000001' as seeded in migration.
    const { data, error, status } = await supabaseAdmin
      .from('app_settings')
      .select('id, app_name, app_logo_url, app_logo_hint, support_phone_number, support_email, social_media_links, terms_of_service_url, privacy_policy_url, created_at, updated_at')
      .eq('id', '00000000-0000-0000-0000-000000000001') // Query by the fixed ID
      .maybeSingle(); // Expects one row or null

    if (error) {
      console.error(`[serverExamService] getAppSettings: Supabase error fetching app settings. Status: ${status}, Code: ${error.code}, Message: ${error.message}`);
      // Don't throw, return null so app can use defaults
      return null; 
    }
    
    if (data) {
        console.log("[serverExamService] getAppSettings: Successfully fetched app settings.");
        // Ensure social_media_links is parsed as an array
        const socialMediaLinks = Array.isArray(data.social_media_links) 
            ? data.social_media_links 
            : (data.social_media_links ? JSON.parse(data.social_media_links as any) : []);
            
        return {
            ...data,
            social_media_links: socialMediaLinks as SocialMediaLink[] | null,
        } as AppSettings;
    }
    console.warn("[serverExamService] getAppSettings: No app settings found in the database with the fixed ID.");
    return null;
  } catch (error: any) {
    console.error("[serverExamService] getAppSettings: Error caught during execution:", error.message);
    // Don't throw, return null
    return null;
  }
};
