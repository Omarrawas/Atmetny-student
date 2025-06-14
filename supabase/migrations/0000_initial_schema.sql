
-- Enable pgcrypto extension if not already enabled (for gen_random_uuid())
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";

-- #############################################################################
-- ENUM Types (Optional but recommended for columns with fixed sets of values)
-- #############################################################################

CREATE TYPE subject_branch_enum AS ENUM ('scientific', 'literary', 'common', 'undetermined');
CREATE TYPE question_difficulty_enum AS ENUM ('easy', 'medium', 'hard', 'all');
CREATE TYPE announcement_type_enum AS ENUM ('success', 'info', 'warning', 'error', 'general');
CREATE TYPE exam_type_enum AS ENUM ('general_exam', 'subject_practice', 'lesson_exam'); -- Added lesson_exam
CREATE TYPE subscription_status_enum AS ENUM ('active', 'expired', 'cancelled', 'trial');

-- #############################################################################
-- Trigger function to automatically update `updated_at` timestamps
-- #############################################################################

CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- #############################################################################
-- Tables
-- #############################################################################

-- Profiles table (linked to Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE, -- Typically synced from auth.users
  name TEXT,
  avatar_url TEXT,
  avatar_hint TEXT,
  points INTEGER DEFAULT 0 NOT NULL,
  level INTEGER DEFAULT 1 NOT NULL,
  progress_to_next_level INTEGER DEFAULT 0 NOT NULL,
  badges JSONB DEFAULT '[]'::jsonb,
  rewards JSONB DEFAULT '[]'::jsonb,
  student_goals TEXT,
  branch subject_branch_enum DEFAULT 'undetermined',
  university TEXT,
  major TEXT,
  active_subscription JSONB, -- Stores SubscriptionDetails object
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
COMMENT ON COLUMN profiles.active_subscription IS 'Stores SubscriptionDetails: {planId, planName, startDate, endDate, status, activationCodeId, subjectId, subjectName}';

CREATE TRIGGER set_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_updated_at();

-- Subjects table
CREATE TABLE IF NOT EXISTS subjects (
  id TEXT PRIMARY KEY, -- e.g., 'math', 'physics'
  name TEXT NOT NULL UNIQUE,
  branch subject_branch_enum NOT NULL,
  icon_name TEXT,
  description TEXT,
  image TEXT,
  image_hint TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TRIGGER set_subjects_updated_at
BEFORE UPDATE ON subjects
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_updated_at();

-- Sections table (sub-collection of subjects)
CREATE TABLE IF NOT EXISTS sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id TEXT NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  "order" INTEGER DEFAULT 0, -- Use quotes for reserved keyword
  type TEXT, -- e.g., 'chapter', 'unit'
  is_used BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  used_at TIMESTAMPTZ,
  used_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_sections_subject_id ON sections(subject_id);
CREATE INDEX IF NOT EXISTS idx_sections_order ON sections("order");

CREATE TRIGGER set_sections_updated_at
BEFORE UPDATE ON sections
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_updated_at();

-- Lessons table (sub-collection of sections)
CREATE TABLE IF NOT EXISTS lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
  subject_id TEXT NOT NULL REFERENCES subjects(id) ON DELETE CASCADE, -- Denormalized
  title TEXT NOT NULL,
  content TEXT, -- Markdown content
  notes TEXT,   -- Markdown content for notes
  video_url TEXT,
  teachers JSONB DEFAULT '[]'::jsonb, -- Array of {name: string, youtubeUrl: string}
  files JSONB DEFAULT '[]'::jsonb,    -- Array of {name: string, url: string, type?: string}
  "order" INTEGER DEFAULT 0,
  teacher_id TEXT, -- Legacy or primary teacher
  teacher_name TEXT,
  linked_exam_ids TEXT[], -- Array of exam IDs (assuming exams.id is TEXT)
  is_locked BOOLEAN DEFAULT false,
  is_used BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  used_at TIMESTAMPTZ,
  used_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_lessons_section_id ON lessons(section_id);
CREATE INDEX IF NOT EXISTS idx_lessons_subject_id ON lessons(subject_id);
CREATE INDEX IF NOT EXISTS idx_lessons_order ON lessons("order");

CREATE TRIGGER set_lessons_updated_at
BEFORE UPDATE ON lessons
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_updated_at();

-- Questions table
CREATE TABLE IF NOT EXISTS questions (
  id TEXT PRIMARY KEY, -- e.g., 'm1', 'p2'
  question_text TEXT NOT NULL,
  options JSONB NOT NULL, -- Array of {id: string, text: string}
  correct_option_id TEXT,
  subject_id TEXT NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  subject_name TEXT, -- Denormalized for convenience
  explanation TEXT,
  points INTEGER DEFAULT 1,
  topic TEXT,
  difficulty question_difficulty_enum DEFAULT 'medium',
  tags TEXT[],
  created_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_questions_subject_id ON questions(subject_id);
CREATE INDEX IF NOT EXISTS idx_questions_topic ON questions(topic);
CREATE INDEX IF NOT EXISTS idx_questions_difficulty ON questions(difficulty);

CREATE TRIGGER set_questions_updated_at
BEFORE UPDATE ON questions
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_updated_at();

-- Exams table
CREATE TABLE IF NOT EXISTS exams (
  id TEXT PRIMARY KEY, -- e.g., 'exam1', 'math_final_2024'
  title TEXT NOT NULL,
  subject_id TEXT NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  subject_name TEXT, -- Denormalized
  teacher_id TEXT,   -- Can be a reference if teachers have their own table
  teacher_name TEXT,
  duration_in_minutes INTEGER,
  total_questions INTEGER,
  image TEXT,
  image_hint TEXT,
  description TEXT,
  published BOOLEAN DEFAULT false,
  question_ids TEXT[], -- Array of question IDs (assuming questions.id is TEXT)
  created_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_exams_subject_id ON exams(subject_id);
CREATE INDEX IF NOT EXISTS idx_exams_published ON exams(published);

CREATE TRIGGER set_exams_updated_at
BEFORE UPDATE ON exams
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_updated_at();

-- User Exam Attempts table
CREATE TABLE IF NOT EXISTS user_exam_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exam_id TEXT REFERENCES exams(id) ON DELETE SET NULL, -- If general_exam
  subject_id TEXT REFERENCES subjects(id) ON DELETE SET NULL, -- If subject_practice
  exam_type exam_type_enum NOT NULL,
  score NUMERIC(5, 2) NOT NULL, -- e.g., 95.50
  correct_answers_count INTEGER NOT NULL,
  total_questions_attempted INTEGER NOT NULL,
  answers JSONB, -- Array of { questionId: string; selectedOptionId: string; isCorrect: boolean }
  started_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL -- Supabase uses created_at by convention
);
CREATE INDEX IF NOT EXISTS idx_user_exam_attempts_user_id ON user_exam_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_user_exam_attempts_exam_id ON user_exam_attempts(exam_id);
CREATE INDEX IF NOT EXISTS idx_user_exam_attempts_subject_id ON user_exam_attempts(subject_id);

-- AI Analyses table
CREATE TABLE IF NOT EXISTS ai_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_exam_attempt_id UUID REFERENCES user_exam_attempts(id) ON DELETE SET NULL,
  input_exam_results_text TEXT NOT NULL,
  input_student_goals_text TEXT,
  recommendations TEXT,
  follow_up_questions TEXT,
  analyzed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_ai_analyses_user_id ON ai_analyses(user_id);

-- News Items table
CREATE TABLE IF NOT EXISTS news_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  image_hint TEXT,
  published_at TIMESTAMPTZ NOT NULL,
  source TEXT,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_news_items_published_at ON news_items(published_at DESC);

CREATE TRIGGER set_news_items_updated_at
BEFORE UPDATE ON news_items
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_updated_at();

-- Announcements table
CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type announcement_type_enum DEFAULT 'general' NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_announcements_is_active_created_at ON announcements(is_active, created_at DESC);

CREATE TRIGGER set_announcements_updated_at
BEFORE UPDATE ON announcements
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_updated_at();

-- Activation Codes table
CREATE TABLE IF NOT EXISTS activation_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  encoded_value TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- e.g., 'general_monthly', 'choose_single_subject_yearly'
  subject_id TEXT REFERENCES subjects(id) ON DELETE SET NULL, -- Link to a specific subject if the code is for one
  subject_name TEXT, -- Denormalized
  is_active BOOLEAN DEFAULT true,
  is_used BOOLEAN DEFAULT false,
  used_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  used_for_subject_id TEXT REFERENCES subjects(id) ON DELETE SET NULL, -- If it was a 'choose_single_subject' type
  valid_from TIMESTAMPTZ NOT NULL,
  valid_until TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_activation_codes_encoded_value ON activation_codes(encoded_value);
CREATE INDEX IF NOT EXISTS idx_activation_codes_is_active_is_used ON activation_codes(is_active, is_used);

CREATE TRIGGER set_activation_codes_updated_at
BEFORE UPDATE ON activation_codes
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_updated_at();

-- Activation Logs table
CREATE TABLE IF NOT EXISTS activation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT, -- Don't delete log if user is deleted
  code_id UUID NOT NULL REFERENCES activation_codes(id) ON DELETE RESTRICT,
  subject_id TEXT REFERENCES subjects(id) ON DELETE SET NULL,
  email TEXT, -- User's email at the time of activation
  code_type TEXT,
  plan_name TEXT,
  activated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_activation_logs_user_id ON activation_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activation_logs_code_id ON activation_logs(code_id);

-- #############################################################################
-- RLS Policies (Placeholders - IMPORTANT: Define actual policies based on your app logic)
-- #############################################################################

-- Example for profiles: Users can only see and edit their own profile.
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
-- For insert, it's usually handled by a trigger or default value linking to auth.uid()

-- YOU MUST DEFINE RLS POLICIES FOR ALL OTHER TABLES BASED ON YOUR APPLICATION'S REQUIREMENTS.
-- For example:
-- - Public tables (like subjects, published exams, news, announcements) might allow SELECT for all authenticated users or even anonymous users.
-- - User-specific data (like user_exam_attempts, ai_analyses) should restrict access to the owner.
-- - Activation codes might have specific access rules for admin roles or for users checking them.

COMMENT ON TABLE profiles IS 'Stores user-specific profile information, extending auth.users.';
COMMENT ON TABLE subjects IS 'List of all available subjects in the platform.';
COMMENT ON TABLE sections IS 'Represents sections or units within a subject.';
COMMENT ON TABLE lessons IS 'Individual lessons within a subject section, can include videos, text content, and files.';
COMMENT ON TABLE questions IS 'Individual questions for exams and quizzes.';
COMMENT ON TABLE exams IS 'Pre-defined exams created by admins/teachers.';
COMMENT ON TABLE user_exam_attempts IS 'Records each attempt a user makes on an exam or practice test.';
COMMENT ON TABLE ai_analyses IS 'Stores results from AI-based performance analysis for users.';
COMMENT ON TABLE news_items IS 'Platform news and updates.';
COMMENT ON TABLE announcements IS 'Important announcements for users.';
COMMENT ON TABLE activation_codes IS 'Codes used to activate subscriptions or features.';
COMMENT ON TABLE activation_logs IS 'A log of all successful code activations.';

-- Example of enabling RLS on another table (do this for all relevant tables)
-- ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Public subjects are viewable by all" ON subjects
--   FOR SELECT USING (true); -- Or (auth.role() = 'authenticated')

-- ALTER TABLE user_exam_attempts ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Users can manage their own exam attempts" ON user_exam_attempts
--   FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Remember to enable RLS for each table and create appropriate policies.

-- Grant usage for the new enums to authenticated users (and anon if needed)
-- GRANT USAGE ON TYPE subject_branch_enum TO authenticated;
-- GRANT USAGE ON TYPE question_difficulty_enum TO authenticated;
-- GRANT USAGE ON TYPE announcement_type_enum TO authenticated;
-- GRANT USAGE ON TYPE exam_type_enum TO authenticated;
-- GRANT USAGE ON TYPE subscription_status_enum TO authenticated;

-- GRANT USAGE ON TYPE subject_branch_enum TO anon;
-- GRANT USAGE ON TYPE question_difficulty_enum TO anon;
-- GRANT USAGE ON TYPE announcement_type_enum TO anon;
-- GRANT USAGE ON TYPE exam_type_enum TO anon;
-- GRANT USAGE ON TYPE subscription_status_enum TO anon;

-- Grant select on public tables to anon and authenticated roles for example
-- GRANT SELECT ON TABLE subjects TO anon, authenticated;
-- GRANT SELECT ON TABLE exams TO anon, authenticated; -- (add WHERE published = true in RLS policy)
-- GRANT SELECT ON TABLE news_items TO anon, authenticated;
-- GRANT SELECT ON TABLE announcements TO anon, authenticated; -- (add WHERE is_active = true in RLS policy)

-- Other grants as needed for INSERT, UPDATE, DELETE based on roles and RLS policies.
-- E.g., authenticated users might insert into user_exam_attempts
-- GRANT INSERT ON TABLE user_exam_attempts TO authenticated;
-- GRANT INSERT ON TABLE ai_analyses TO authenticated;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE profiles TO authenticated; -- RLS will handle specifics
-- GRANT SELECT ON TABLE sections TO authenticated;
-- GRANT SELECT ON TABLE lessons TO authenticated;
-- GRANT SELECT ON TABLE questions TO authenticated;
-- GRANT SELECT, INSERT ON TABLE activation_logs TO authenticated;
-- GRANT SELECT, UPDATE ON TABLE activation_codes TO authenticated; -- Be very careful with activation_codes update permissions

-- Default Supabase behavior for new projects:
-- - auth.users is managed by Supabase.
-- - No RLS on new tables by default (public).
-- - Policies are needed to restrict access.
-- - The 'postgres' role has superuser access.
-- - 'anon' and 'authenticated' roles exist for RLS.

-- After running this schema, go to Supabase Dashboard -> Authentication -> Policies
-- and enable RLS for each table, then add appropriate policies.
-- Also check Database -> Roles for default permissions.
