
-- Enum public.subject_branch_enum should already exist from 0004 migration.
-- Table public.subjects should already exist from 0004 migration.
-- Function public.trigger_set_timestamp() should already exist from 0003 migration.

-- Drop the table if it exists with a potentially different schema (e.g., old TEXT IDs)
DROP TABLE if exists public.subject_sections cascade;

CREATE TABLE public.subject_sections (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  subject_id uuid NOT NULL,
  title text NOT NULL,
  description text NULL, -- Made description nullable as it's not in user's DDL but was in types
  type text NOT NULL, -- E.g., 'unit', 'chapter', 'theme'
  "order" bigint NULL,
  is_locked boolean NULL DEFAULT TRUE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT subject_sections_pkey PRIMARY KEY (id),
  CONSTRAINT subject_sections_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects (id) ON DELETE CASCADE
) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_subject_sections_subject_id ON public.subject_sections USING btree (subject_id ASC NULLS LAST) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_subject_sections_order ON public.subject_sections USING btree ("order" ASC NULLS LAST) TABLESPACE pg_default;

DROP TRIGGER IF EXISTS set_subject_sections_updated_at ON public.subject_sections;
CREATE TRIGGER set_subject_sections_updated_at
BEFORE UPDATE ON public.subject_sections
FOR EACH ROW
EXECUTE FUNCTION public.trigger_set_timestamp();

COMMENT ON COLUMN public.subject_sections.type IS 'Type of section, e.g., unit, chapter, theme';
COMMENT ON COLUMN public.subject_sections.is_locked IS 'Indicates if the section content requires a subscription or prerequisites';

-- Enable RLS
ALTER TABLE public.subject_sections ENABLE ROW LEVEL SECURITY;

-- Policies for subject_sections
-- Admin: Can do anything
DROP POLICY IF EXISTS "Admin can do all operations on subject_sections" ON public.subject_sections;
CREATE POLICY "Admin can do all operations on subject_sections"
ON public.subject_sections
FOR ALL
TO authenticated
USING (current_user_is_admin())
WITH CHECK (current_user_is_admin());

-- Authenticated users: Can read all sections (actual content lock handled by lesson.is_locked and user_has_active_subject_subscription)
DROP POLICY IF EXISTS "Authenticated users can read subject_sections" ON public.subject_sections;
CREATE POLICY "Authenticated users can read subject_sections"
ON public.subject_sections
FOR SELECT
TO authenticated
USING (true);

-- Public users: Can read all sections
DROP POLICY IF EXISTS "Public users can read subject_sections" ON public.subject_sections;
CREATE POLICY "Public users can read subject_sections"
ON public.subject_sections
FOR SELECT
TO public, anon
USING (true);
