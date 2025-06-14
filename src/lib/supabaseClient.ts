
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Enhanced Debugging: Log the values being read from environment variables
console.log('Attempting to initialize Supabase client (supabaseClient.ts)...');
console.log('Value of process.env.NEXT_PUBLIC_SUPABASE_URL at runtime:', supabaseUrl);
console.log('Value of process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY at runtime (presence only):', !!supabaseAnonKey);

if (!supabaseUrl || supabaseUrl.trim() === "") {
  console.error('CRITICAL ERROR: NEXT_PUBLIC_SUPABASE_URL is MISSING or EMPTY in environment variables.');
  console.error('Ensure it is set in your .env file at the project root AND the Next.js server has been restarted.');
  throw new Error(
    'CRITICAL: Supabase URL (NEXT_PUBLIC_SUPABASE_URL) is missing or empty. Check server logs and .env file.'
  );
}

if (!supabaseAnonKey || supabaseAnonKey.trim() === "") {
  console.error('CRITICAL ERROR: NEXT_PUBLIC_SUPABASE_ANON_KEY is MISSING or EMPTY in environment variables.');
  console.error('Ensure it is set in your .env file at the project root AND the Next.js server has been restarted.');
  throw new Error(
    'CRITICAL: Supabase Anon Key (NEXT_PUBLIC_SUPABASE_ANON_KEY) is missing or empty. Check server logs and .env file.'
  );
}

let supabaseInstance: SupabaseClient;

try {
  // Attempt to create the client
  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  console.log('Supabase client initialized successfully using URL:', supabaseUrl);
} catch (error) {
  console.error('CRITICAL ERROR: Failed to construct Supabase client. The URL might be invalid despite being present.');
  console.error('Supabase URL that caused failure:', supabaseUrl); // Log the URL that was actually used
  console.error('Supabase Anon Key presence when failure occurred:', !!supabaseAnonKey);
  console.error('Error details during createClient():', error);
  // Re-throw the error to ensure the application doesn't continue in a broken state
  throw new Error(`Failed to initialize Supabase client. URL: "${supabaseUrl}". Error: ${(error as Error).message}`);
}

export const supabase = supabaseInstance;
