
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL or Anon Key is missing. Check your .env file. Make sure they are prefixed with NEXT_PUBLIC_ and the Next.js server was restarted.');
}

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);
