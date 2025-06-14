
-- 0002_triggers.sql

-- 1. Trigger function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply the updated_at trigger to relevant tables
-- Note: You'll need to apply this to each table that has an 'updated_at' column
-- and where you want this behavior.

-- For 'profiles' table
DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.trigger_set_timestamp();

-- For 'subjects' table
DROP TRIGGER IF EXISTS set_subjects_updated_at ON public.subjects;
CREATE TRIGGER set_subjects_updated_at
BEFORE UPDATE ON public.subjects
FOR EACH ROW
EXECUTE FUNCTION public.trigger_set_timestamp();

-- For 'subject_sections' table
DROP TRIGGER IF EXISTS set_subject_sections_updated_at ON public.subject_sections;
CREATE TRIGGER set_subject_sections_updated_at
BEFORE UPDATE ON public.subject_sections
FOR EACH ROW
EXECUTE FUNCTION public.trigger_set_timestamp();

-- For 'lessons' table
DROP TRIGGER IF EXISTS set_lessons_updated_at ON public.lessons;
CREATE TRIGGER set_lessons_updated_at
BEFORE UPDATE ON public.lessons
FOR EACH ROW
EXECUTE FUNCTION public.trigger_set_timestamp();

-- For 'exams' table
DROP TRIGGER IF EXISTS set_exams_updated_at ON public.exams;
CREATE TRIGGER set_exams_updated_at
BEFORE UPDATE ON public.exams
FOR EACH ROW
EXECUTE FUNCTION public.trigger_set_timestamp();

-- For 'questions' table
DROP TRIGGER IF EXISTS set_questions_updated_at ON public.questions;
CREATE TRIGGER set_questions_updated_at
BEFORE UPDATE ON public.questions
FOR EACH ROW
EXECUTE FUNCTION public.trigger_set_timestamp();

-- For 'activation_codes' table
DROP TRIGGER IF EXISTS set_activation_codes_updated_at ON public.activation_codes;
CREATE TRIGGER set_activation_codes_updated_at
BEFORE UPDATE ON public.activation_codes
FOR EACH ROW
EXECUTE FUNCTION public.trigger_set_timestamp();

-- For 'user_exam_attempts' table
-- (Typically `updated_at` is not needed for attempt logs, but if you have it)
-- DROP TRIGGER IF EXISTS set_user_exam_attempts_updated_at ON public.user_exam_attempts;
-- CREATE TRIGGER set_user_exam_attempts_updated_at
-- BEFORE UPDATE ON public.user_exam_attempts
-- FOR EACH ROW
-- EXECUTE FUNCTION public.trigger_set_timestamp();

-- For 'ai_analyses' table
-- DROP TRIGGER IF EXISTS set_ai_analyses_updated_at ON public.ai_analyses;
-- CREATE TRIGGER set_ai_analyses_updated_at
-- BEFORE UPDATE ON public.ai_analyses
-- FOR EACH ROW
-- EXECUTE FUNCTION public.trigger_set_timestamp();

-- For 'news' table
DROP TRIGGER IF EXISTS set_news_updated_at ON public.news;
CREATE TRIGGER set_news_updated_at
BEFORE UPDATE ON public.news
FOR EACH ROW
EXECUTE FUNCTION public.trigger_set_timestamp();

-- For 'announcements' table
DROP TRIGGER IF EXISTS set_announcements_updated_at ON public.announcements;
CREATE TRIGGER set_announcements_updated_at
BEFORE UPDATE ON public.announcements
FOR EACH ROW
EXECUTE FUNCTION public.trigger_set_timestamp();


-- 2. Trigger function to automatically create a user profile when a new user signs up in auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, avatar_url, avatar_hint, points, level, progress_to_next_level, badges, rewards, student_goals, branch, university, major, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email, 'طالب جديد'), -- Use full_name from metadata or email
    NEW.raw_user_meta_data->>'avatar_url', -- Use avatar_url from metadata
    'person avatar', -- Default avatar hint
    0,  -- Default points
    1,  -- Default level
    0,  -- Default progress
    '[]'::JSONB, -- Default empty badges
    '[]'::JSONB, -- Default empty rewards
    '', -- Default empty student goals
    'undetermined', -- Default branch
    '', -- Default empty university
    '', -- Default empty major
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; -- SECURITY DEFINER allows this function to write to public.profiles

-- Create the trigger on auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Grant usage on the public schema to the supabase_auth_admin_user_role if not already granted for trigger execution
-- This might be needed if the trigger function interacts with tables outside the schema of the invoking user.
-- However, SECURITY DEFINER above should handle permissions correctly for public.profiles.
-- GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
-- GRANT INSERT ON public.profiles TO supabase_auth_admin;


-- Optional: Consider a trigger to update user profile email if it changes in auth.users
-- This is more complex due to potential RLS and data consistency issues.
-- CREATE OR REPLACE FUNCTION public.handle_user_email_update()
-- RETURNS TRIGGER AS $$
-- BEGIN
--   UPDATE public.profiles
--   SET email = NEW.email, updated_at = NOW()
--   WHERE id = NEW.id;
--   RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql SECURITY DEFINER;

-- DROP TRIGGER IF EXISTS on_auth_user_email_updated ON auth.users;
-- CREATE TRIGGER on_auth_user_email_updated
--   AFTER UPDATE OF email ON auth.users
--   FOR EACH ROW
--   WHEN (OLD.email IS DISTINCT FROM NEW.email) -- Only run if email actually changed
--   EXECUTE FUNCTION public.handle_user_email_update();

-- Make sure to enable these triggers on your tables in the Supabase dashboard under Database > Triggers
-- if they are not automatically enabled by running this SQL.

-- You might also need to ensure the postgres user (or the role executing these, typically `supabase_admin` or `postgres` via SQL editor)
-- has permissions to create triggers on `auth.users`.
-- If you run into permission issues creating the trigger on `auth.users`, you might need to execute
-- the `CREATE TRIGGER on_auth_user_created ...` part as a superuser or by temporarily elevating privileges if Supabase dashboard allows.
-- Often, the `SECURITY DEFINER` on the function is sufficient.
