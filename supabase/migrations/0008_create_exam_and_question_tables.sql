-- Define ENUM types if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'question_type_enum') THEN
        CREATE TYPE public.question_type_enum AS ENUM (
            'multiple_choice',
            'true_false',
            'short_answer',
            'essay'
            -- Add other types as needed
        );
    END IF;
END$$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'question_difficulty_enum') THEN
        CREATE TYPE public.question_difficulty_enum AS ENUM (
            'easy',
            'medium',
            'hard'
            -- Add other difficulties as needed
        );
    END IF;
END$$;

-- Create exams table
CREATE TABLE public.exams (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NULL,
  subject_id uuid NOT NULL, -- Ensure this is provided, removed default gen_random_uuid()
  published boolean NULL DEFAULT false,
  image text NULL,
  image_hint text NULL,
  teacher_name text NULL,
  teacher_id uuid NULL,
  duration integer NULL, -- Duration in minutes
  created_at timestamp with time zone NULL DEFAULT now(),
  updated_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT exams_pkey PRIMARY KEY (id),
  CONSTRAINT exams_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(id) ON DELETE CASCADE,
  CONSTRAINT exams_teacher_id_fkey FOREIGN KEY (teacher_id) REFERENCES public.profiles(id) ON DELETE SET NULL
) TABLESPACE pg_default;

CREATE TRIGGER set_exams_updated_at
BEFORE UPDATE ON public.exams
FOR EACH ROW EXECUTE FUNCTION public.trigger_set_timestamp();

-- Create questions table
CREATE TABLE public.questions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  question_type public.question_type_enum NOT NULL,
  question_text text NOT NULL,
  difficulty public.question_difficulty_enum NULL,
  subject_id uuid NULL,
  lesson_id uuid NULL,
  options jsonb NULL, -- Example: [{"id": "opt1_uuid_str", "text": "Option 1"}, {"id": "opt2_uuid_str", "text": "Option 2"}]
  correct_option_id text NULL, -- This would store "opt1_uuid_str" or similar from the options JSON
  correct_answers text[] NULL, -- For multi-select or fill-in-the-blank
  model_answer text NULL,
  is_sane boolean NULL,
  sanity_explanation text NULL,
  is_locked boolean NULL DEFAULT false,
  created_at timestamp with time zone NULL DEFAULT now(),
  updated_at timestamp with time zone NULL DEFAULT now(),
  tag_ids uuid[] NULL, 
  CONSTRAINT questions_pkey PRIMARY KEY (id),
  CONSTRAINT questions_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES public.lessons(id) ON DELETE SET NULL,
  CONSTRAINT questions_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(id) ON DELETE SET NULL
) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_questions_subject_id ON public.questions USING btree (subject_id) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_questions_lesson_id ON public.questions USING btree (lesson_id) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_questions_type ON public.questions USING btree (question_type) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_questions_difficulty ON public.questions USING btree (difficulty) TABLESPACE pg_default;

CREATE TRIGGER set_questions_updated_at
BEFORE UPDATE ON public.questions
FOR EACH ROW EXECUTE FUNCTION public.trigger_set_timestamp();

-- The function sync_question_tags() needs to be defined for this trigger to work.
-- CREATE TRIGGER trigger_sync_question_tags
-- AFTER INSERT OR UPDATE ON public.questions
-- FOR EACH ROW EXECUTE FUNCTION public.sync_question_tags();


-- Create exam_questions join table
CREATE TABLE public.exam_questions (
  exam_id uuid NOT NULL,
  question_id uuid NOT NULL,
  order_number integer NULL,
  points integer NULL DEFAULT 1,
  created_at timestamp with time zone NULL DEFAULT now(),
  updated_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT exam_questions_pkey PRIMARY KEY (exam_id, question_id),
  CONSTRAINT uq_exam_question UNIQUE (exam_id, question_id), 
  CONSTRAINT exam_questions_exam_id_fkey FOREIGN KEY (exam_id) REFERENCES public.exams(id) ON DELETE CASCADE,
  CONSTRAINT exam_questions_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.questions(id) ON DELETE CASCADE
) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_exam_questions_exam_id ON public.exam_questions USING btree (exam_id) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_exam_questions_question_id ON public.exam_questions USING btree (question_id) TABLESPACE pg_default;

CREATE TRIGGER set_exam_questions_updated_at
BEFORE UPDATE ON public.exam_questions
FOR EACH ROW EXECUTE FUNCTION public.trigger_set_timestamp();
