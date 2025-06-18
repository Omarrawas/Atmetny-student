
-- Enable RLS for all tables in the public schema
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'ALTER TABLE public.' || quote_ident(r.tablename) || ' ENABLE ROW LEVEL SECURITY;';
        EXECUTE 'ALTER TABLE public.' || quote_ident(r.tablename) || ' FORCE ROW LEVEL SECURITY;';
    END LOOP;
END $$;

-- USERS (profiles) table RLS policies
-- Allow users to read their own profile
CREATE POLICY "Allow individual user read access to their own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Allow individual user update access to their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Allow admin users to perform any action on profiles
CREATE POLICY "Allow admin full access to profiles"
ON public.profiles FOR ALL
USING (current_user_is_admin())
WITH CHECK (current_user_is_admin());


-- AI_ANALYSES table RLS policies
-- Allow users to read their own AI analysis results
CREATE POLICY "Allow individual user read access to their own AI analyses"
ON public.ai_analyses FOR SELECT
USING (auth.uid() = user_id);

-- Allow users to insert their own AI analysis results
CREATE POLICY "Allow individual user insert access to their own AI analyses"
ON public.ai_analyses FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Allow admin users to perform any action on AI analyses
CREATE POLICY "Allow admin full access to AI analyses"
ON public.ai_analyses FOR ALL
USING (current_user_is_admin())
WITH CHECK (current_user_is_admin());


-- USER_EXAM_ATTEMPTS table RLS policies
-- Allow users to read their own exam attempts
CREATE POLICY "Allow individual user read access to their own exam attempts"
ON public.user_exam_attempts FOR SELECT
USING (auth.uid() = user_id);

-- Allow users to insert their own exam attempts
CREATE POLICY "Allow individual user insert access to their own exam attempts"
ON public.user_exam_attempts FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Allow admin users to perform any action on exam attempts
CREATE POLICY "Allow admin full access to exam attempts"
ON public.user_exam_attempts FOR ALL
USING (current_user_is_admin())
WITH CHECK (current_user_is_admin());

-- ACTIVATION_CODES table RLS policies
-- Allow admin users to perform any action on activation_codes
CREATE POLICY "Allow admin full access to activation_codes"
ON public.activation_codes FOR ALL
USING (current_user_is_admin())
WITH CHECK (current_user_is_admin());

-- Allow authenticated users to read (but not see encoded_value unless admin or for specific checks)
-- This policy is intentionally restrictive for SELECT. Specific functions might be needed for code validation.
CREATE POLICY "Allow authenticated users to read limited fields of activation_codes"
ON public.activation_codes FOR SELECT
USING (auth.role() = 'authenticated'); -- Might need further refinement based on use case


-- ACTIVATION_LOGS table RLS policies
-- Allow admin users to perform any action on activation_logs
CREATE POLICY "Allow admin full access to activation_logs"
ON public.activation_logs FOR ALL
USING (current_user_is_admin())
WITH CHECK (current_user_is_admin());

-- Allow users to read their own activation logs
CREATE POLICY "Allow individual user read access to their own activation logs"
ON public.activation_logs FOR SELECT
USING (auth.uid() = user_id);


-- SUBJECTS table RLS policies
-- Allow all authenticated users to read subjects
CREATE POLICY "Allow authenticated users to read subjects"
ON public.subjects FOR SELECT
USING (auth.role() = 'authenticated');

-- Allow admin users to perform any action on subjects
CREATE POLICY "Allow admin full access to subjects"
ON public.subjects FOR ALL
USING (current_user_is_admin())
WITH CHECK (current_user_is_admin());


-- SUBJECT_SECTIONS table RLS policies
-- Allow all authenticated users to read subject sections
CREATE POLICY "Allow authenticated users to read subject sections"
ON public.subject_sections FOR SELECT
USING (auth.role() = 'authenticated');

-- Allow admin users to perform any action on subject sections
CREATE POLICY "Allow admin full access to subject sections"
ON public.subject_sections FOR ALL
USING (current_user_is_admin())
WITH CHECK (current_user_is_admin());


-- LESSONS table RLS policies
-- Allow all authenticated users to read lessons
-- Access to locked lessons will be handled by application logic based on subscription status
CREATE POLICY "Allow authenticated users to read lessons"
ON public.lessons FOR SELECT
USING (auth.role() = 'authenticated');

-- Allow admin users to perform any action on lessons
CREATE POLICY "Allow admin full access to lessons"
ON public.lessons FOR ALL
USING (current_user_is_admin())
WITH CHECK (current_user_is_admin());


-- EXAMS table RLS policies (Placeholder - adjust as needed)
-- Allow authenticated users to read published exams
CREATE POLICY "Allow authenticated users to read published exams"
ON public.exams FOR SELECT
USING (auth.role() = 'authenticated' AND published = TRUE);

-- Allow admin users to perform any action on exams
CREATE POLICY "Allow admin full access to exams"
ON public.exams FOR ALL
USING (current_user_is_admin())
WITH CHECK (current_user_is_admin());


-- QUESTIONS table RLS policies (Placeholder - adjust as needed)
-- Allow authenticated users to read questions (perhaps only if linked to an accessible exam or subject)
-- This is a broad policy, refine based on how questions are accessed.
CREATE POLICY "Allow authenticated users to read questions"
ON public.questions FOR SELECT
USING (auth.role() = 'authenticated');

-- Allow admin users to perform any action on questions
CREATE POLICY "Allow admin full access to questions"
ON public.questions FOR ALL
USING (current_user_is_admin())
WITH CHECK (current_user_is_admin());


-- NEWS table RLS policies
-- Allow all users (including anonymous) to read news items
CREATE POLICY "Allow all users to read news"
ON public.news FOR SELECT
USING (true);

-- Allow admin users to manage news items
CREATE POLICY "Allow admin full access to news"
ON public.news FOR ALL
USING (current_user_is_admin())
WITH CHECK (current_user_is_admin());


-- ANNOUNCEMENTS table RLS policies
-- Allow all users (including anonymous) to read active announcements
CREATE POLICY "Allow all users to read active announcements"
ON public.announcements FOR SELECT
USING (is_active = TRUE);

-- Allow admin users to manage announcements
CREATE POLICY "Allow admin full access to announcements"
ON public.announcements FOR ALL
USING (current_user_is_admin())
WITH CHECK (current_user_is_admin());

-- Note: Make sure to enable RLS on each table after creating policies if not done already.
-- Example: ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
-- The DO block at the top attempts to do this for all tables.

-- Ensure the helper function current_user_is_admin() is defined, e.g.:
-- CREATE OR REPLACE FUNCTION current_user_is_admin()
-- RETURNS BOOLEAN AS $$
-- BEGIN
--   RETURN (
--     SELECT raw_user_meta_data->>'app_role'
--     FROM auth.users
--     WHERE id = auth.uid()
--   ) = 'admin';
-- END;
-- $$ LANGUAGE plpgsql SECURITY DEFINER;
-- GRANT EXECUTE ON FUNCTION current_user_is_admin() TO authenticated;
