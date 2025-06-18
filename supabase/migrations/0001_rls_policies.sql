
-- Enable Row Level Security for all relevant tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_exam_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subject_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY; -- If exams are to be restricted
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY; -- If questions are to be restricted
ALTER TABLE public.activation_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activation_logs ENABLE ROW LEVEL SECURITY;

-- Force RLS for table owners as well (good practice)
ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY;
ALTER TABLE public.user_exam_attempts FORCE ROW LEVEL SECURITY;
ALTER TABLE public.ai_analyses FORCE ROW LEVEL SECURITY;
ALTER TABLE public.news FORCE ROW LEVEL SECURITY;
ALTER TABLE public.announcements FORCE ROW LEVEL SECURITY;
ALTER TABLE public.subjects FORCE ROW LEVEL SECURITY;
ALTER TABLE public.subject_sections FORCE ROW LEVEL SECURITY;
ALTER TABLE public.lessons FORCE ROW LEVEL SECURITY;
ALTER TABLE public.exams FORCE ROW LEVEL SECURITY;
ALTER TABLE public.questions FORCE ROW LEVEL SECURITY;
ALTER TABLE public.activation_codes FORCE ROW LEVEL SECURITY;
ALTER TABLE public.activation_logs FORCE ROW LEVEL SECURITY;


-- Drop existing policies before creating new ones to avoid conflicts
-- (Be cautious with this in production if policies are already in active use)
DROP POLICY IF EXISTS "Allow public read access to profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow individual insert access to their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow individual update access to their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow admin all access to profiles" ON public.profiles;

DROP POLICY IF EXISTS "Allow individual read access to their own exam attempts" ON public.user_exam_attempts;
DROP POLICY IF EXISTS "Allow individual insert access for their own exam attempts" ON public.user_exam_attempts;
DROP POLICY IF EXISTS "Allow admin all access to user_exam_attempts" ON public.user_exam_attempts;

DROP POLICY IF EXISTS "Allow individual read access to their own AI analyses" ON public.ai_analyses;
DROP POLICY IF EXISTS "Allow individual insert access for their own AI analyses" ON public.ai_analyses;
DROP POLICY IF EXISTS "Allow admin all access to ai_analyses" ON public.ai_analyses;

DROP POLICY IF EXISTS "Allow public read access to news" ON public.news;
DROP POLICY IF EXISTS "Allow admin all access to news" ON public.news;

DROP POLICY IF EXISTS "Allow public read access to announcements" ON public.announcements;
DROP POLICY IF EXISTS "Allow admin all access to announcements" ON public.announcements;

DROP POLICY IF EXISTS "Allow public read access to subjects" ON public.subjects;
DROP POLICY IF EXISTS "Allow admin all access to subjects" ON public.subjects;

DROP POLICY IF EXISTS "Allow public read access to subject_sections" ON public.subject_sections;
DROP POLICY IF EXISTS "Allow admin all access to subject_sections" ON public.subject_sections;

DROP POLICY IF EXISTS "Allow public read access to lessons" ON public.lessons;
DROP POLICY IF EXISTS "Allow admin all access to lessons" ON public.lessons;

DROP POLICY IF EXISTS "Allow admin all access to activation_codes" ON public.activation_codes;
-- NO SELECT FOR AUTHENTICATED ON activation_codes - this should be handled by backend functions

DROP POLICY IF EXISTS "Allow individual read access to their own activation_logs" ON public.activation_logs;
DROP POLICY IF EXISTS "Allow admin all access to activation_logs" ON public.activation_logs;
-- NO INSERT/UPDATE/DELETE FOR AUTHENTICATED ON activation_logs - handled by backend functions


-- Policies for public.profiles
CREATE POLICY "Allow public read access to profiles"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Allow individual insert access to their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Allow individual update access to their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Allow admin all access to profiles"
  ON public.profiles FOR ALL
  USING (current_user_is_admin())
  WITH CHECK (current_user_is_admin());


-- Policies for public.user_exam_attempts
CREATE POLICY "Allow individual read access to their own exam attempts"
  ON public.user_exam_attempts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Allow individual insert access for their own exam attempts"
  ON public.user_exam_attempts FOR INSERT
  WITH CHECK (auth.uid() = user_id);
  
CREATE POLICY "Allow admin all access to user_exam_attempts"
  ON public.user_exam_attempts FOR ALL
  USING (current_user_is_admin())
  WITH CHECK (current_user_is_admin());


-- Policies for public.ai_analyses
CREATE POLICY "Allow individual read access to their own AI analyses"
  ON public.ai_analyses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Allow individual insert access for their own AI analyses"
  ON public.ai_analyses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow admin all access to ai_analyses"
  ON public.ai_analyses FOR ALL
  USING (current_user_is_admin())
  WITH CHECK (current_user_is_admin());


-- Policies for public.news (assuming news is public)
CREATE POLICY "Allow public read access to news"
  ON public.news FOR SELECT
  USING (true);

CREATE POLICY "Allow admin all access to news"
  ON public.news FOR ALL
  USING (current_user_is_admin())
  WITH CHECK (current_user_is_admin());


-- Policies for public.announcements (assuming announcements are public)
CREATE POLICY "Allow public read access to announcements"
  ON public.announcements FOR SELECT
  USING (true);

CREATE POLICY "Allow admin all access to announcements"
  ON public.announcements FOR ALL
  USING (current_user_is_admin())
  WITH CHECK (current_user_is_admin());


-- Policies for public.subjects (assuming subjects are public)
CREATE POLICY "Allow public read access to subjects"
  ON public.subjects FOR SELECT
  USING (true);

CREATE POLICY "Allow admin all access to subjects"
  ON public.subjects FOR ALL
  USING (current_user_is_admin())
  WITH CHECK (current_user_is_admin());

-- Policies for public.subject_sections (assuming sections are public if subject is accessible)
CREATE POLICY "Allow public read access to subject_sections"
  ON public.subject_sections FOR SELECT
  USING (true);

CREATE POLICY "Allow admin all access to subject_sections"
  ON public.subject_sections FOR ALL
  USING (current_user_is_admin())
  WITH CHECK (current_user_is_admin());

-- Policies for public.lessons
-- Basic policy: allow authenticated users to read. Locking logic handled by app/subscription.
CREATE POLICY "Allow authenticated read access to lessons"
  ON public.lessons FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow admin all access to lessons"
  ON public.lessons FOR ALL
  USING (current_user_is_admin())
  WITH CHECK (current_user_is_admin());

-- Policies for public.exams
-- Example: Allow authenticated users to read PUBLISHED exams.
-- Adjust as needed if exams have more complex access rules.
DROP POLICY IF EXISTS "Allow authenticated read access to published exams" ON public.exams;
CREATE POLICY "Allow authenticated read access to published exams"
  ON public.exams FOR SELECT
  TO authenticated
  USING (published = true);

DROP POLICY IF EXISTS "Allow admin all access to exams" ON public.exams;
CREATE POLICY "Allow admin all access to exams"
  ON public.exams FOR ALL
  USING (current_user_is_admin())
  WITH CHECK (current_user_is_admin());

-- Policies for public.questions
-- Example: Questions are usually not directly readable by students.
-- They are fetched as part of an exam or by admin/teacher roles.
-- If questions need to be browsable, a more specific policy is needed.
DROP POLICY IF EXISTS "Allow admin all access to questions" ON public.questions;
CREATE POLICY "Allow admin all access to questions"
  ON public.questions FOR ALL
  USING (current_user_is_admin())
  WITH CHECK (current_user_is_admin());


-- Policies for public.activation_codes
-- Admins can do anything.
CREATE POLICY "Allow admin all access to activation_codes"
  ON public.activation_codes FOR ALL
  USING (current_user_is_admin())
  WITH CHECK (current_user_is_admin());
-- NOTE: No SELECT policy for general authenticated users on activation_codes.
-- Code validation should be handled by a secure backend function (e.g., Edge Function or an RPC).


-- Policies for public.activation_logs
-- Users can see their own activation logs.
CREATE POLICY "Allow individual read access to their own activation_logs"
  ON public.activation_logs FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can do anything with logs.
CREATE POLICY "Allow admin all access to activation_logs"
  ON public.activation_logs FOR ALL
  USING (current_user_is_admin())
  WITH CHECK (current_user_is_admin());
-- NOTE: No INSERT/UPDATE/DELETE for general authenticated users on activation_logs,
-- as these should be created by backend logic during activation.
