-- Migration to create the app_settings table and its RLS policies

-- Create the app_settings table
CREATE TABLE public.app_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  app_name TEXT NULL,
  app_logo_url TEXT NULL,
  app_logo_hint TEXT NULL DEFAULT 'application logo',
  support_phone_number TEXT NULL,
  support_email TEXT NULL,
  social_media_links JSONB NULL, -- [{"platform": "Facebook", "url": "...", "icon": "FacebookIconName"}, ...]
  terms_of_service_url TEXT NULL,
  privacy_policy_url TEXT NULL,
  created_at TIMESTAMPTZ NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NULL DEFAULT NOW(),
  CONSTRAINT app_settings_pkey PRIMARY KEY (id)
);

-- Optional: Trigger to update 'updated_at' timestamp
CREATE TRIGGER set_app_settings_updated_at
BEFORE UPDATE ON public.app_settings
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp(); -- Assumes trigger_set_timestamp() function exists

-- Row Level Security (RLS) Policies
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public read access to app settings
CREATE POLICY "Public can read app settings"
  ON public.app_settings
  FOR SELECT
  USING (true);

-- Policy: Allow service_role to manage app settings
-- Note: service_role bypasses RLS by default, but explicit policies are good practice.
CREATE POLICY "Admins can manage app settings"
  ON public.app_settings
  FOR ALL -- Allows INSERT, UPDATE, DELETE
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Seed one row of default settings if the table is empty (optional, can be done via Supabase UI)
-- This ensures there's always a row to fetch.
-- You might want a more robust way to ensure a single settings row (e.g., ID = 1).
INSERT INTO public.app_settings (id, app_name, support_email, social_media_links)
SELECT 
  '00000000-0000-0000-0000-000000000001', -- A fixed UUID for the single settings row
  'Atmetny', 
  'support@atmetny.com',
  '[{"platform": "Facebook", "url": "https://facebook.com/atmetny", "icon": "Facebook"}, {"platform": "Telegram", "url": "https://t.me/atmetny", "icon": "Send"}]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.app_settings WHERE id = '00000000-0000-0000-0000-000000000001');

-- Ensure there's only one settings row (alternative to seeding with fixed ID if you prefer auto-generated ID for the first row)
-- CREATE UNIQUE INDEX app_settings_single_row_idx ON public.app_settings ((TRUE));
-- This creates a unique index on a constant, effectively allowing only one row.
-- However, for fetching, knowing a fixed ID or fetching the first ordered row is simpler.
-- For now, we'll fetch the first row ordered by created_at or use a known ID if seeded.
