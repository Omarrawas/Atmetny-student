
-- Create the news_articles table
CREATE TABLE public.news_articles (
  id uuid NOT NULL DEFAULT gen_random_uuid (),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT NULL,
  created_at TIMESTAMP WITH TIME ZONE NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NULL DEFAULT NOW(),
  CONSTRAINT news_articles_pkey PRIMARY KEY (id)
) TABLESPACE pg_default;

-- Create index for faster querying on created_at
CREATE INDEX IF NOT EXISTS idx_news_articles_created_at ON public.news_articles USING btree (created_at DESC) TABLESPACE pg_default;

-- Create trigger to automatically update updated_at timestamp
-- Ensure the trigger_set_timestamp function is defined (e.g., in 0002_base_schema.sql or a dedicated functions file)
CREATE TRIGGER set_news_articles_updated_at
BEFORE UPDATE ON public.news_articles
FOR EACH ROW
EXECUTE FUNCTION public.trigger_set_timestamp();

-- Grant usage on schema to anon and authenticated
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Grant select on news_articles to anon and authenticated
GRANT SELECT ON TABLE public.news_articles TO anon;
GRANT SELECT ON TABLE public.news_articles TO authenticated;

-- Allow all for service_role (used by server-side functions)
GRANT ALL ON TABLE public.news_articles TO service_role;

