
CREATE TABLE public.lessons (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  section_id uuid NOT NULL,
  subject_id uuid NOT NULL, -- Removed default gen_random_uuid() as it should reference an existing subject
  title TEXT NOT NULL,
  content TEXT NULL,
  notes TEXT NULL,
  video_url TEXT NULL,
  teachers jsonb NULL DEFAULT '[]'::jsonb,
  files jsonb NULL DEFAULT '[]'::jsonb,
  "order" INTEGER NULL DEFAULT 0,
  teacher_id TEXT NULL,
  teacher_name TEXT NULL,
  linked_exam_ids uuid[] NULL,
  is_locked BOOLEAN NULL DEFAULT FALSE,
  is_used BOOLEAN NULL DEFAULT FALSE,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW(),
  used_at timestamptz NULL,
  used_by_user_id uuid NULL,
  CONSTRAINT lessons_pkey PRIMARY KEY (id),
  CONSTRAINT lessons_section_id_fkey FOREIGN KEY (section_id) REFERENCES public.subject_sections (id) ON DELETE CASCADE,
  CONSTRAINT lessons_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects (id) ON DELETE CASCADE,
  CONSTRAINT lessons_used_by_user_id_fkey FOREIGN KEY (used_by_user_id) REFERENCES auth.users (id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_lessons_section_id ON public.lessons USING btree (section_id);
CREATE INDEX IF NOT EXISTS idx_lessons_subject_id ON public.lessons USING btree (subject_id);
CREATE INDEX IF NOT EXISTS idx_lessons_order ON public.lessons USING btree ("order");

COMMENT ON COLUMN public.lessons.teachers IS 'Array of objects: [{ "name": "Teacher Name", "youtubeUrl": "url" }]';
COMMENT ON COLUMN public.lessons.files IS 'Array of objects: [{ "name": "File Name", "url": "file_url", "type": "pdf" }]';

CREATE TRIGGER set_lessons_updated_at
BEFORE UPDATE ON public.lessons
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

GRANT SELECT, INSERT, UPDATE, DELETE ON public.lessons TO service_role;
GRANT SELECT ON public.lessons TO authenticated;
-- For anonymous users, if you want them to see some lessons (e.g., non-locked ones, handled by RLS or app logic)
-- GRANT SELECT ON public.lessons TO anon;
