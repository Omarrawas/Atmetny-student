
-- Enable RLS for all tables if not already enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subject_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_exam_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activation_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;


-- Drop existing policies before recreating to avoid errors if they already exist by a similar name
-- Note: Supabase UI might create policies with specific names. 
-- It's safer to drop specific named policies if you know them, or manage policies primarily through migrations.

-- For public.profiles
DROP POLICY IF EXISTS "Allow public read access to profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow individual user to read their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow individual user to update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow admin full access to profiles" ON public.profiles;
-- New policies for public.profiles
CREATE POLICY "Allow public read access to profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Allow individual user to read their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Allow individual user to update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Allow admin full access to profiles" ON public.profiles FOR ALL USING (current_user_is_admin()) WITH CHECK (current_user_is_admin());
ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY;

-- For public.subjects
DROP POLICY IF EXISTS "Allow public read access to subjects" ON public.subjects;
DROP POLICY IF EXISTS "Allow admin full access to subjects" ON public.subjects;
-- New policies for public.subjects
CREATE POLICY "Allow public read access to subjects" ON public.subjects FOR SELECT USING (true);
CREATE POLICY "Allow admin full access to subjects" ON public.subjects FOR ALL USING (current_user_is_admin()) WITH CHECK (current_user_is_admin());
ALTER TABLE public.subjects FORCE ROW LEVEL SECURITY;

-- For public.subject_sections
DROP POLICY IF EXISTS "Allow public read access to subject_sections" ON public.subject_sections;
DROP POLICY IF EXISTS "Allow admin full access to subject_sections" ON public.subject_sections;
-- New policies for public.subject_sections
CREATE POLICY "Allow public read access to subject_sections" ON public.subject_sections FOR SELECT USING (true);
CREATE POLICY "Allow admin full access to subject_sections" ON public.subject_sections FOR ALL USING (current_user_is_admin()) WITH CHECK (current_user_is_admin());
ALTER TABLE public.subject_sections FORCE ROW LEVEL SECURITY;

-- For public.lessons
DROP POLICY IF EXISTS "Allow authenticated users to read lessons" ON public.lessons;
DROP POLICY IF EXISTS "Allow admin full access to lessons" ON public.lessons;
-- New policies for public.lessons
CREATE POLICY "Allow authenticated users to read lessons" ON public.lessons FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow admin full access to lessons" ON public.lessons FOR ALL USING (current_user_is_admin()) WITH CHECK (current_user_is_admin());
ALTER TABLE public.lessons FORCE ROW LEVEL SECURITY;


-- For public.exams
DROP POLICY IF EXISTS "Allow public read for published exams" ON public.exams;
DROP POLICY IF EXISTS "Allow admin full access to exams" ON public.exams;
-- New policies for public.exams
CREATE POLICY "Allow public read for published exams" ON public.exams FOR SELECT USING (published = TRUE);
CREATE POLICY "Allow admin full access to exams" ON public.exams FOR ALL USING (current_user_is_admin()) WITH CHECK (current_user_is_admin());
ALTER TABLE public.exams FORCE ROW LEVEL SECURITY;

-- For public.questions
DROP POLICY IF EXISTS "Allow authenticated read for non-locked questions" ON public.questions;
DROP POLICY IF EXISTS "Allow admin full access to questions" ON public.questions;
-- New policies for public.questions
CREATE POLICY "Allow authenticated read for non-locked questions" ON public.questions FOR SELECT TO authenticated USING (is_locked = FALSE OR is_locked IS NULL);
CREATE POLICY "Allow admin full access to questions" ON public.questions FOR ALL USING (current_user_is_admin()) WITH CHECK (current_user_is_admin());
ALTER TABLE public.questions FORCE ROW LEVEL SECURITY;

-- For public.exam_questions (junction table)
DROP POLICY IF EXISTS "Allow authenticated read access to exam_questions based on related tables" ON public.exam_questions;
DROP POLICY IF EXISTS "Allow admin full access to exam_questions" ON public.exam_questions;
-- New policies for public.exam_questions
-- Users can read exam_questions if they can read the exam (published) and the question (not locked)
CREATE POLICY "Allow authenticated read access to exam_questions based on related tables"
ON public.exam_questions
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.exams e
    WHERE e.id = exam_id AND e.published = TRUE
  ) AND
  EXISTS (
    SELECT 1 FROM public.questions q
    WHERE q.id = question_id AND (q.is_locked = FALSE OR q.is_locked IS NULL)
  )
);
CREATE POLICY "Allow admin full access to exam_questions" ON public.exam_questions FOR ALL USING (current_user_is_admin()) WITH CHECK (current_user_is_admin());
ALTER TABLE public.exam_questions FORCE ROW LEVEL SECURITY;


-- For public.user_exam_attempts
DROP POLICY IF EXISTS "Allow user to manage their own exam attempts" ON public.user_exam_attempts;
DROP POLICY IF EXISTS "Allow admin full access to user_exam_attempts" ON public.user_exam_attempts;
-- New policies for public.user_exam_attempts
CREATE POLICY "Allow user to manage their own exam attempts" ON public.user_exam_attempts FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id AND (SELECT active_subscription IS NOT NULL FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Allow admin full access to user_exam_attempts" ON public.user_exam_attempts FOR ALL USING (current_user_is_admin()) WITH CHECK (current_user_is_admin());
ALTER TABLE public.user_exam_attempts FORCE ROW LEVEL SECURITY;

-- For public.ai_analyses
DROP POLICY IF EXISTS "Allow user to manage their own AI analyses" ON public.ai_analyses;
DROP POLICY IF EXISTS "Allow admin full access to ai_analyses" ON public.ai_analyses;
-- New policies for public.ai_analyses
CREATE POLICY "Allow user to manage their own AI analyses" ON public.ai_analyses FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id AND (SELECT active_subscription IS NOT NULL FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Allow admin full access to ai_analyses" ON public.ai_analyses FOR ALL USING (current_user_is_admin()) WITH CHECK (current_user_is_admin());
ALTER TABLE public.ai_analyses FORCE ROW LEVEL SECURITY;

-- For public.activation_codes
DROP POLICY IF EXISTS "Admins can manage activation codes" ON public.activation_codes;
-- New policy for public.activation_codes
CREATE POLICY "Admins can manage activation codes" ON public.activation_codes FOR ALL
  USING (current_user_is_admin())
  WITH CHECK (current_user_is_admin());
ALTER TABLE public.activation_codes FORCE ROW LEVEL SECURITY;

-- For public.activation_logs
DROP POLICY IF EXISTS "Users can read their own activation logs" ON public.activation_logs;
DROP POLICY IF EXISTS "Admins can manage activation logs" ON public.activation_logs;
-- New policies for public.activation_logs
CREATE POLICY "Users can read their own activation logs" ON public.activation_logs FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage activation logs" ON public.activation_logs FOR ALL
  USING (current_user_is_admin())
  WITH CHECK (current_user_is_admin());
ALTER TABLE public.activation_logs FORCE ROW LEVEL SECURITY;

-- For public.news_articles
DROP POLICY IF EXISTS "Allow public read access to news articles" ON public.news_articles;
DROP POLICY IF EXISTS "Allow admin full access to news_articles" ON public.news_articles;
-- New policies for public.news_articles
CREATE POLICY "Allow public read access to news articles" ON public.news_articles FOR SELECT USING (true);
CREATE POLICY "Allow admin full access to news_articles" ON public.news_articles FOR ALL USING (current_user_is_admin()) WITH CHECK (current_user_is_admin());
ALTER TABLE public.news_articles FORCE ROW LEVEL SECURITY;

-- For public.announcements
DROP POLICY IF EXISTS "Allow public read access to announcements" ON public.announcements;
DROP POLICY IF EXISTS "Allow admin full access to announcements" ON public.announcements;
-- New policies for public.announcements
CREATE POLICY "Allow public read access to announcements" ON public.announcements FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Allow admin full access to announcements" ON public.announcements FOR ALL USING (current_user_is_admin()) WITH CHECK (current_user_is_admin());
ALTER TABLE public.announcements FORCE ROW LEVEL SECURITY;
