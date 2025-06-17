
-- Ensure RLS is enabled on the profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY;


-- Policies for profiles table
-- 1. Users can update their own profile
CREATE POLICY "Allow users to update their own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 2. Users can view their own profile
CREATE POLICY "Allow users to view their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- 3. Admins can perform any operation on profiles
CREATE POLICY "Allow admins to manage all profiles"
ON public.profiles
FOR ALL
TO authenticated
USING (current_user_is_admin())
WITH CHECK (current_user_is_admin());


-- Enable RLS for activation_codes
ALTER TABLE public.activation_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activation_codes FORCE ROW LEVEL SECURITY;

-- Policies for activation_codes table
-- 1. Admins can do anything
CREATE POLICY "Allow admins to manage activation codes"
ON public.activation_codes
FOR ALL
TO authenticated
USING (current_user_is_admin())
WITH CHECK (current_user_is_admin());
-- Note: Backend service role will handle code usage and updates, bypassing RLS.


-- Enable RLS for activation_logs
ALTER TABLE public.activation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activation_logs FORCE ROW LEVEL SECURITY;

-- Policies for activation_logs table
-- 1. Admins can read all logs
CREATE POLICY "Allow admins to read activation logs"
ON public.activation_logs
FOR SELECT
TO authenticated
USING (current_user_is_admin());
-- Note: Backend service role will insert logs, bypassing RLS.


-- Enable RLS for subjects
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects FORCE ROW LEVEL SECURITY;

-- Allow all authenticated users to read subjects
CREATE POLICY "Allow authenticated read access to subjects"
ON public.subjects
FOR SELECT
TO authenticated
USING (true);

-- Allow admins to manage subjects
CREATE POLICY "Allow admin to manage subjects"
ON public.subjects
FOR ALL
TO authenticated
USING (current_user_is_admin())
WITH CHECK (current_user_is_admin());


-- Enable RLS for subject_sections
ALTER TABLE public.subject_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subject_sections FORCE ROW LEVEL SECURITY;

-- Allow all authenticated users to read subject sections
CREATE POLICY "Allow authenticated read access to subject sections"
ON public.subject_sections
FOR SELECT
TO authenticated
USING (true);

-- Allow admins to manage subject sections
CREATE POLICY "Allow admin to manage subject sections"
ON public.subject_sections
FOR ALL
TO authenticated
USING (current_user_is_admin())
WITH CHECK (current_user_is_admin());


-- Enable RLS for lessons
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons FORCE ROW LEVEL SECURITY;

-- Allow all authenticated users to read lessons (actual content access control via is_locked and subscription in app)
CREATE POLICY "Allow authenticated read access to lessons"
ON public.lessons
FOR SELECT
TO authenticated
USING (true); -- Further checks for subscription needed for content access can be done with user_has_active_subject_subscription(subject_id)

-- Allow admins to manage lessons
CREATE POLICY "Allow admin to manage lessons"
ON public.lessons
FOR ALL
TO authenticated
USING (current_user_is_admin())
WITH CHECK (current_user_is_admin());


-- Enable RLS for exams
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exams FORCE ROW LEVEL SECURITY;

-- Allow authenticated users to read published exams
CREATE POLICY "Allow authenticated read access to published exams"
ON public.exams
FOR SELECT
TO authenticated
USING (published = true);

-- Allow admins to manage exams
CREATE POLICY "Allow admin to manage exams"
ON public.exams
FOR ALL
TO authenticated
USING (current_user_is_admin())
WITH CHECK (current_user_is_admin());


-- Enable RLS for questions
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions FORCE ROW LEVEL SECURITY;

-- Only admins can read all questions directly
CREATE POLICY "Allow admin to read questions"
ON public.questions
FOR SELECT
TO authenticated
USING (current_user_is_admin());
-- Note: Students typically access questions via exams or lessons, which have their own RLS.

-- Allow admins to manage questions
CREATE POLICY "Allow admin to manage questions"
ON public.questions
FOR ALL
TO authenticated
USING (current_user_is_admin())
WITH CHECK (current_user_is_admin());


-- Enable RLS for user_exam_attempts
ALTER TABLE public.user_exam_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_exam_attempts FORCE ROW LEVEL SECURITY;

-- Users can read their own exam attempts
CREATE POLICY "Allow users to read their own exam attempts"
ON public.user_exam_attempts
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can insert their own exam attempts (application should ensure this)
CREATE POLICY "Allow users to insert their own exam attempts"
ON public.user_exam_attempts
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Admins can manage all exam attempts
CREATE POLICY "Allow admins to manage all exam attempts"
ON public.user_exam_attempts
FOR ALL
TO authenticated
USING (current_user_is_admin())
WITH CHECK (current_user_is_admin());


-- Enable RLS for ai_analyses
ALTER TABLE public.ai_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_analyses FORCE ROW LEVEL SECURITY;

-- Users can read their own AI analyses
CREATE POLICY "Allow users to read their own AI analyses"
ON public.ai_analyses
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can insert their own AI analyses
CREATE POLICY "Allow users to insert their own AI analyses"
ON public.ai_analyses
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Admins can manage all AI analyses
CREATE POLICY "Allow admins to manage all AI analyses"
ON public.ai_analyses
FOR ALL
TO authenticated
USING (current_user_is_admin())
WITH CHECK (current_user_is_admin());


-- Enable RLS for news
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news FORCE ROW LEVEL SECURITY;

-- Allow all authenticated users to read news
CREATE POLICY "Allow authenticated read access to news"
ON public.news
FOR SELECT
TO authenticated
USING (true);

-- Allow admins to manage news
CREATE POLICY "Allow admin to manage news"
ON public.news
FOR ALL
TO authenticated
USING (current_user_is_admin())
WITH CHECK (current_user_is_admin());


-- Enable RLS for announcements
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements FORCE ROW LEVEL SECURITY;

-- Allow all authenticated users to read active announcements
CREATE POLICY "Allow authenticated read access to active announcements"
ON public.announcements
FOR SELECT
TO authenticated
USING (is_active = true);

-- Allow admins to manage announcements
CREATE POLICY "Allow admin to manage announcements"
ON public.announcements
FOR ALL
TO authenticated
USING (current_user_is_admin())
WITH CHECK (current_user_is_admin());
