-- Enable RLS for all tables in the public schema initially
-- You can then define specific policies for each table.
-- For tables where you want public read access, a simple policy like
-- `CREATE POLICY "Public read access" ON table_name FOR SELECT USING (true);` can be used.

-- Helper function to check if the current user is an admin
CREATE OR REPLACE FUNCTION current_user_is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_admin_val boolean;
BEGIN
  SELECT (auth.jwt()->>'app_metadata')::jsonb->>'app_role' = 'admin' INTO is_admin_val;
  RETURN COALESCE(is_admin_val, false);
END;
$$;
GRANT EXECUTE ON FUNCTION current_user_is_admin() TO authenticated, anon;


--
-- Policies for public.profiles
--
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY; -- Ensures RLS applies even to table owner

DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile"
    ON public.profiles
    FOR SELECT
    USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
    ON public.profiles
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;
CREATE POLICY "Admins can manage all profiles"
    ON public.profiles
    FOR ALL -- SELECT, INSERT, UPDATE, DELETE
    USING (current_user_is_admin())
    WITH CHECK (current_user_is_admin());

--
-- Policies for public.subjects
--
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage subjects" ON public.subjects;
CREATE POLICY "Admins can manage subjects"
    ON public.subjects
    FOR ALL
    USING (current_user_is_admin())
    WITH CHECK (current_user_is_admin());

DROP POLICY IF EXISTS "Authenticated users can read all subjects" ON public.subjects;
CREATE POLICY "Authenticated users can read all subjects"
    ON public.subjects
    FOR SELECT
    USING (auth.role() = 'authenticated');
    
--
-- Policies for public.subject_sections
--
ALTER TABLE public.subject_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subject_sections FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage subject_sections" ON public.subject_sections;
CREATE POLICY "Admins can manage subject_sections"
    ON public.subject_sections
    FOR ALL
    USING (current_user_is_admin())
    WITH CHECK (current_user_is_admin());

DROP POLICY IF EXISTS "Authenticated users can read all subject_sections" ON public.subject_sections;
CREATE POLICY "Authenticated users can read all subject_sections"
    ON public.subject_sections
    FOR SELECT
    USING (auth.role() = 'authenticated');

--
-- Policies for public.lessons
--
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage lessons" ON public.lessons;
CREATE POLICY "Admins can manage lessons"
    ON public.lessons
    FOR ALL
    USING (current_user_is_admin())
    WITH CHECK (current_user_is_admin());

DROP POLICY IF EXISTS "Authenticated users can read non-locked lessons" ON public.lessons;
CREATE POLICY "Authenticated users can read non-locked lessons"
    ON public.lessons
    FOR SELECT
    USING (auth.role() = 'authenticated'); 
    -- Access to locked lessons will be primarily handled by application logic based on user subscription.
    -- This RLS allows fetching lesson metadata; app decides if content is shown.

--
-- Policies for public.activation_codes
--
ALTER TABLE public.activation_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activation_codes FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage activation_codes" ON public.activation_codes;
CREATE POLICY "Admins can manage activation_codes"
    ON public.activation_codes
    FOR ALL
    USING (current_user_is_admin())
    WITH CHECK (current_user_is_admin());
-- No SELECT policy for general authenticated users; codes are checked via backend.

--
-- Policies for public.activation_logs
--
ALTER TABLE public.activation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activation_logs FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage activation_logs" ON public.activation_logs;
CREATE POLICY "Admins can manage activation_logs"
    ON public.activation_logs
    FOR ALL
    USING (current_user_is_admin())
    WITH CHECK (current_user_is_admin());

DROP POLICY IF EXISTS "Users can view their own activation_logs" ON public.activation_logs;
CREATE POLICY "Users can view their own activation_logs"
    ON public.activation_logs
    FOR SELECT
    USING (auth.uid() = user_id);

--
-- Policies for public.exams
--
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exams FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage exams" ON public.exams;
CREATE POLICY "Admins can manage exams"
    ON public.exams
    FOR ALL
    USING (current_user_is_admin())
    WITH CHECK (current_user_is_admin());

DROP POLICY IF EXISTS "Authenticated users can view published exams" ON public.exams;
CREATE POLICY "Authenticated users can view published exams"
    ON public.exams
    FOR SELECT
    USING (auth.role() = 'authenticated' AND published = true);

--
-- Policies for public.questions
--
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage questions" ON public.questions;
CREATE POLICY "Admins can manage questions"
    ON public.questions
    FOR ALL
    USING (current_user_is_admin())
    WITH CHECK (current_user_is_admin());

DROP POLICY IF EXISTS "Authenticated users can view non-locked questions" ON public.questions;
CREATE POLICY "Authenticated users can view non-locked questions"
    ON public.questions
    FOR SELECT
    USING (auth.role() = 'authenticated' AND (is_locked IS NULL OR is_locked = false));

--
-- Policies for public.exam_questions
--
ALTER TABLE public.exam_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_questions FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage exam_questions" ON public.exam_questions;
CREATE POLICY "Admins can manage exam_questions"
    ON public.exam_questions
    FOR ALL
    USING (current_user_is_admin())
    WITH CHECK (current_user_is_admin());

DROP POLICY IF EXISTS "Authenticated users can view exam_questions links based on exam/question RLS" ON public.exam_questions;
CREATE POLICY "Authenticated users can view exam_questions links based on exam/question RLS"
    ON public.exam_questions
    FOR SELECT
    USING (
        auth.role() = 'authenticated' AND
        (EXISTS (SELECT 1 FROM public.exams ex WHERE ex.id = exam_id)) AND 
        (EXISTS (SELECT 1 FROM public.questions q WHERE q.id = question_id)) 
    );

-- Note: Ensure user_exam_attempts and ai_analyses also have appropriate RLS policies.
-- For user_exam_attempts:
ALTER TABLE public.user_exam_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_exam_attempts FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own exam attempts" ON public.user_exam_attempts;
CREATE POLICY "Users can manage their own exam attempts"
    ON public.user_exam_attempts
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage all exam attempts" ON public.user_exam_attempts;
CREATE POLICY "Admins can manage all exam attempts"
    ON public.user_exam_attempts
    FOR ALL
    USING (current_user_is_admin())
    WITH CHECK (current_user_is_admin());

-- For ai_analyses:
ALTER TABLE public.ai_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_analyses FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own AI analyses" ON public.ai_analyses;
CREATE POLICY "Users can manage their own AI analyses"
    ON public.ai_analyses
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage all AI analyses" ON public.ai_analyses;
CREATE POLICY "Admins can manage all AI analyses"
    ON public.ai_analyses
    FOR ALL
    USING (current_user_is_admin())
    WITH CHECK (current_user_is_admin());
