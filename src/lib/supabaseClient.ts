
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Supabase URL or Anon Key is missing. ' +
    'Please check your .env file in the project root. ' +
    'Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are correctly set with valid values (e.g., NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co), ' +
    'and that the Next.js server has been restarted after any changes.'
  );
}

// The error "TypeError: Invalid URL" means supabaseUrl was provided,
// but it's not a valid URL string (e.g., missing "https://").
// The check above handles missing variables, but the URL constructor itself fails if the string is malformed.
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);
