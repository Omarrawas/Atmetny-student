
-- Helper function to check if the current user has an 'admin' role
-- This function assumes you set 'app_role': 'admin' in the user's app_metadata in Supabase Auth.
CREATE OR REPLACE FUNCTION current_user_is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE -- Ensures the function doesn't modify the database and is safe for RLS.
AS $$
BEGIN
  IF auth.role() = 'authenticated' THEN
    RETURN (auth.jwt() -> 'app_metadata' ->> 'app_role') = 'admin';
  ELSE
    RETURN FALSE; -- Not an authenticated user, so not an admin.
  END IF;
EXCEPTION
  WHEN others THEN -- Handles cases where JWT or claims might be missing or malformed
    RETURN FALSE;
END;
$$;

-- Grant execute permission to authenticated users so they can call it in RLS policies
GRANT EXECUTE ON FUNCTION current_user_is_admin() TO authenticated;


-- Helper function to check if the user has an active subscription for a given subject
-- (either general or specific to the subject_id)
CREATE OR REPLACE FUNCTION user_has_active_subject_subscription(p_subject_id TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER -- Allows the function to query the profiles table even if the user doesn't have direct select access
AS $$
DECLARE
  subscription_details JSONB;
  is_general_subscription BOOLEAN;
  specific_subject_match BOOLEAN;
BEGIN
  -- Prevent non-authenticated users from even attempting this check
  IF auth.role() != 'authenticated' THEN
    RETURN FALSE;
  END IF;

  SELECT active_subscription INTO subscription_details
  FROM public.profiles
  WHERE id = auth.uid();

  IF subscription_details IS NULL THEN
    RETURN FALSE;
  END IF;

  IF (subscription_details ->> 'status') != 'active' THEN
    RETURN FALSE;
  END IF;

  IF (subscription_details ->> 'endDate')::TIMESTAMPTZ < NOW() THEN
    RETURN FALSE;
  END IF;

  is_general_subscription := (subscription_details ->> 'subjectId') IS NULL OR
                             TRIM(subscription_details ->> 'subjectId') = '';

  specific_subject_match := (subscription_details ->> 'subjectId')::TEXT = p_subject_id::TEXT;

  RETURN is_general_subscription OR specific_subject_match;
END;
$$;

GRANT EXECUTE ON FUNCTION user_has_active_subject_subscription(TEXT) TO authenticated;


-- ============================
-- Table: profiles
-- ============================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow admin full access to profiles" ON public.profiles;
CREATE POLICY "Allow admin full access to profiles"
ON public.profiles
FOR ALL
USING (current_user_is_admin())
WITH CHECK (current_user_is_admin());

DROP POLICY IF EXISTS "Allow individual user to read their own profile" ON public.profiles;
CREATE POLICY "Allow individual user to read their own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Allow individual user to update their own profile" ON public.profiles;
CREATE POLICY "Allow individual user to update their own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Users should not typically insert their own profile row directly;
-- it's usually created via a trigger on auth.users or by a trusted function.
-- If you need users to "create" their profile entry after signup via an API call,
-- this policy can be enabled, ensuring they can only create for their own auth.uid().
DROP POLICY IF EXISTS "Allow individual user to insert their own profile" ON public.profiles;
-- CREATE POLICY "Allow individual user to insert their own profile"
-- ON public.profiles
-- FOR INSERT
-- WITH CHECK (auth.uid() = id);

-- Deletion of profiles is sensitive. Usually handled by admins or specific backend processes.
-- If users can delete their own account, this would typically also involve deleting their auth.users entry.
DROP POLICY IF EXISTS "Allow individual user to delete their own profile" ON public.profiles;
-- CREATE POLICY "Allow individual user to delete their own profile"
-- ON public.profiles
-- FOR DELETE
-- USING (auth.uid() = id);


-- ============================
-- Table: subjects
-- ============================
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow admin full access to subjects" ON public.subjects;
CREATE POLICY "Allow admin full access to subjects"
ON public.subjects
FOR ALL
USING (current_user_is_admin())
WITH CHECK (current_user_is_admin());

DROP POLICY IF EXISTS "Allow authenticated users to read subjects" ON public.subjects;
CREATE POLICY "Allow authenticated users to read subjects"
ON public.subjects
FOR SELECT
USING (auth.role() = 'authenticated');


-- ============================
-- Table: sections
-- ============================
ALTER TABLE public.sections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow admin full access to sections" ON public.sections;
CREATE POLICY "Allow admin full access to sections"
ON public.sections
FOR ALL
USING (current_user_is_admin())
WITH CHECK (current_user_is_admin());

DROP POLICY IF EXISTS "Allow authenticated users to read sections" ON public.sections;
CREATE POLICY "Allow authenticated users to read sections"
ON public.sections
FOR SELECT
USING (auth.role() = 'authenticated');


-- ============================
-- Table: lessons
-- ============================
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow admin full access to lessons" ON public.lessons;
CREATE POLICY "Allow admin full access to lessons"
ON public.lessons
FOR ALL
USING (current_user_is_admin())
WITH CHECK (current_user_is_admin());

DROP POLICY IF EXISTS "Allow read access to non-locked lessons for authenticated users" ON public.lessons;
CREATE POLICY "Allow read access to non-locked lessons for authenticated users"
ON public.lessons
FOR SELECT
USING (
  auth.role() = 'authenticated' AND is_locked IS FALSE
);

DROP POLICY IF EXISTS "Allow read access to locked lessons for subscribed authenticated users" ON public.lessons;
CREATE POLICY "Allow read access to locked lessons for subscribed authenticated users"
ON public.lessons
FOR SELECT
USING (
  auth.role() = 'authenticated' AND is_locked IS TRUE AND user_has_active_subject_subscription(subject_id)
);


-- ============================
-- Table: questions
-- ============================
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow admin full access to questions" ON public.questions;
CREATE POLICY "Allow admin full access to questions"
ON public.questions
FOR ALL
USING (current_user_is_admin())
WITH CHECK (current_user_is_admin());

DROP POLICY IF EXISTS "Allow authenticated users to read questions" ON public.questions;
CREATE POLICY "Allow authenticated users to read questions"
ON public.questions
FOR SELECT
USING (auth.role() = 'authenticated'); -- For practice/browsing


-- ============================
-- Table: exams
-- ============================
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow admin full access to exams" ON public.exams;
CREATE POLICY "Allow admin full access to exams"
ON public.exams
FOR ALL
USING (current_user_is_admin())
WITH CHECK (current_user_is_admin());

DROP POLICY IF EXISTS "Allow authenticated users to read published exams" ON public.exams;
CREATE POLICY "Allow authenticated users to read published exams"
ON public.exams
FOR SELECT
USING (auth.role() = 'authenticated' AND published IS TRUE);


-- ============================
-- Table: user_exam_attempts
-- ============================
ALTER TABLE public.user_exam_attempts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow admin full access to user_exam_attempts" ON public.user_exam_attempts;
CREATE POLICY "Allow admin full access to user_exam_attempts"
ON public.user_exam_attempts
FOR ALL
USING (current_user_is_admin())
WITH CHECK (current_user_is_admin());

DROP POLICY IF EXISTS "Allow user to read their own exam attempts" ON public.user_exam_attempts;
CREATE POLICY "Allow user to read their own exam attempts"
ON public.user_exam_attempts
FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow user to insert their own exam attempts" ON public.user_exam_attempts;
CREATE POLICY "Allow user to insert their own exam attempts"
ON public.user_exam_attempts
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Updates to exam attempts are generally not allowed by users.
-- Deletion of exam attempts is generally not allowed by users.


-- ============================
-- Table: ai_analyses
-- ============================
ALTER TABLE public.ai_analyses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow admin full access to ai_analyses" ON public.ai_analyses;
CREATE POLICY "Allow admin full access to ai_analyses"
ON public.ai_analyses
FOR ALL
USING (current_user_is_admin())
WITH CHECK (current_user_is_admin());

DROP POLICY IF EXISTS "Allow user to read their own ai_analyses" ON public.ai_analyses;
CREATE POLICY "Allow user to read their own ai_analyses"
ON public.ai_analyses
FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow user to insert their own ai_analyses" ON public.ai_analyses;
CREATE POLICY "Allow user to insert their own ai_analyses"
ON public.ai_analyses
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Updates/Deletes to AI analyses generally not by users.


-- ============================
-- Table: news_items
-- ============================
ALTER TABLE public.news_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow admin full access to news_items" ON public.news_items;
CREATE POLICY "Allow admin full access to news_items"
ON public.news_items
FOR ALL
USING (current_user_is_admin())
WITH CHECK (current_user_is_admin());

DROP POLICY IF EXISTS "Allow authenticated users to read news_items" ON public.news_items;
CREATE POLICY "Allow authenticated users to read news_items"
ON public.news_items
FOR SELECT
USING (auth.role() = 'authenticated');


-- ============================
-- Table: announcements
-- ============================
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow admin full access to announcements" ON public.announcements;
CREATE POLICY "Allow admin full access to announcements"
ON public.announcements
FOR ALL
USING (current_user_is_admin())
WITH CHECK (current_user_is_admin());

DROP POLICY IF EXISTS "Allow authenticated users to read active announcements" ON public.announcements;
CREATE POLICY "Allow authenticated users to read active announcements"
ON public.announcements
FOR SELECT
USING (auth.role() = 'authenticated' AND is_active IS TRUE);


-- ============================
-- Table: activation_codes
-- ============================
ALTER TABLE public.activation_codes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow admin full access to activation_codes" ON public.activation_codes;
CREATE POLICY "Allow admin full access to activation_codes"
ON public.activation_codes
FOR ALL
USING (current_user_is_admin())
WITH CHECK (current_user_is_admin());

-- Users should not directly read or modify activation codes.
-- The checkCodeWithBackend and confirmActivationWithBackend functions (TypeScript)
-- would ideally call Supabase Edge Functions that operate with elevated privileges (service_role)
-- or be refactored to be callable by an admin frontend.
-- Direct user API calls to check codes should be through such functions, not direct table access.


-- ============================
-- Table: activation_logs
-- ============================
ALTER TABLE public.activation_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow admin full access to activation_logs" ON public.activation_logs;
CREATE POLICY "Allow admin full access to activation_logs"
ON public.activation_logs
FOR ALL
USING (current_user_is_admin())
WITH CHECK (current_user_is_admin());

DROP POLICY IF EXISTS "Allow user to read their own activation_logs" ON public.activation_logs;
CREATE POLICY "Allow user to read their own activation_logs"
ON public.activation_logs
FOR SELECT
USING (auth.uid() = user_id);

-- Activation logs are inserted by the system (e.g., trusted backend function), not directly by users.
DROP POLICY IF EXISTS "Allow system to insert activation_logs" ON public.activation_logs;
CREATE POLICY "Allow system to insert activation_logs"
ON public.activation_logs
FOR INSERT
WITH CHECK (current_user_is_admin()); -- Or a specific role if you have one for system operations.

