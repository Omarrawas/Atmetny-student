
import type { User } from 'firebase/auth'; // Keep for now if any residual legacy, ideally remove if fully Supabase
// import type { Timestamp } from 'firebase/firestore'; // Replaced with string for ISO dates

// To represent names of lucide-react icons as strings
export type LucideIconName = keyof typeof import('lucide-react');

export interface Badge {
  id: string;
  name: string;
  iconName: LucideIconName;
  date: string; // Changed from Timestamp
  image: string;
  imageHint: string;
}

export interface Reward {
  id:string;
  name: string;
  iconName: LucideIconName;
  expiry: string; // Changed from Timestamp
}

export interface SubscriptionDetails {
  planId: string;
  planName: string;
  startDate: string; // Changed from Timestamp
  endDate: string; // Changed from Timestamp
  status: 'active' | 'expired' | 'cancelled' | 'trial';
  activationCodeId?: string; // UUID of the activation_code used
  subjectId?: string | null; // UUID of the subject, if specific
  subjectName?: string | null; // Name of the subject, if specific
}

export type SubjectBranch = 'scientific' | 'literary' | 'common' | 'undetermined';


export interface UserProfile {
  id: string; // Changed from uid to id, matching Supabase convention (references auth.users.id)
  name: string;
  email: string;
  avatar_url?: string; // Supabase typically uses avatar_url
  avatar_hint?: string;
  points: number;
  level: number;
  progress_to_next_level: number;
  badges: Badge[];
  rewards: Reward[];
  student_goals?: string;
  branch?: SubjectBranch;
  university?: string;
  major?: string;
  created_at: string; // Changed from Timestamp
  updated_at: string; // Changed from Timestamp
  active_subscription?: SubscriptionDetails | null;
}

// Input type for saveUserProfile function
export type UserProfileWriteData = {
  id: string; // Changed from uid to id
  name?: string;
  email?: string; // Email might come from auth user, not form always
  avatar_url?: string;
  avatar_hint?: string;
  points?: number;
  level?: number;
  progress_to_next_level?: number;
  badges?: Badge[];
  rewards?: Reward[];
  student_goals?: string;
  branch?: SubjectBranch;
  university?: string;
  major?: string;
  active_subscription?: Omit<SubscriptionDetails, 'startDate' | 'endDate'> & { startDate: string | Date, endDate: string | Date } | null;
  updated_at?: string; // Forcing update of this field
  created_at?: string; // Only on creation
};


export interface QuestionOption {
  id: string; // This ID should be unique within the options array for a question (e.g., "option_1", "option_a")
  text: string;
}

export type QuestionTypeEnum = 'multiple_choice' | 'true_false' | 'short_answer' | 'essay' | string;
export type QuestionDifficultyEnum = 'easy' | 'medium' | 'hard' | string;

export interface Question {
  id: string; // UUID
  question_type: QuestionTypeEnum;
  question_text: string;
  difficulty?: QuestionDifficultyEnum | null;
  subject_id?: string | null; // UUID, Foreign key to public.subjects
  lesson_id?: string | null; // UUID, Foreign key to public.lessons
  options?: QuestionOption[] | null; // Parsed from JSONB
  correct_option_id?: string | null; // ID of the correct option within the options JSON
  correct_answers?: string[] | null; // For other question types like fill-in-the-blanks (array of correct strings)
  model_answer?: string | null; // Detailed model answer or explanation
  is_sane?: boolean | null;
  sanity_explanation?: string | null;
  is_locked?: boolean | null;
  created_at?: string;
  updated_at?: string;
  tag_ids?: string[] | null; // Array of UUIDs if tags are in a separate table

  // Fields that might be joined or denormalized in application code, not direct table columns usually
  subjectName?: string; // Joined from subjects table
  // `topic` field was removed as it's not in the new `questions` table schema.
  // If topics are needed, they might come from `lesson.title` or by resolving `tag_ids`.
  points?: number; // This is in exam_questions, not questions table itself
  explanation?: string; // This was potentially ambiguous with model_answer. Sticking to model_answer from DB.
}


export interface Subject {
  id: string; // UUID from Supabase
  name: string;
  branch: SubjectBranch;
  icon_name?: string; // Stored as TEXT in DB, can be mapped to LucideIconName
  description?: string;
  image?: string;
  image_hint?: string;
  order?: number;
  created_at?: string;
  updated_at?: string;
}

export interface SubjectSection {
  id: string; // UUID
  subject_id: string; // UUID, Foreign key to public.subjects.id
  title: string;
  type: string; // E.g., 'unit', 'chapter', 'theme' (NOT NULL in SQL)
  order?: number | null;
  is_locked?: boolean | null; // Default true in DB
  created_at?: string;
  updated_at?: string;
}

export interface LessonFile {
  name: string;
  url: string;
  type?: string;
}

export interface LessonTeacher {
  name: string;
  youtubeUrl: string;
}

export interface Lesson {
  id: string; // UUID
  section_id: string; // UUID, Foreign key to public.subject_sections.id
  subject_id: string; // UUID, Foreign key to public.subjects.id
  title: string;
  content?: string | null;
  notes?: string | null;
  video_url?: string | null;
  teachers?: LessonTeacher[] | null; // From JSONB, parsed to array
  files?: LessonFile[] | null; // From JSONB, parsed to array
  order?: number | null;
  teacher_id?: string | null; // Kept for potential direct teacher linking (UUID of a profile)
  teacher_name?: string | null; // Kept for potential direct teacher linking
  linked_exam_ids?: string[] | null; // Array of UUIDs of exams
  is_locked?: boolean | null; // Default false in DB
  is_used?: boolean | null; 
  created_at: string;
  updated_at: string;
  used_at?: string | null;
  used_by_user_id?: string | null; // UUID, Foreign key to auth.users.id
}


export interface Exam {
  id: string; // UUID
  title: string;
  description?: string | null;
  subject_id: string; // UUID, Foreign key to public.subjects.id
  published?: boolean | null; // Default false
  image?: string | null;
  image_hint?: string | null;
  teacher_name?: string | null;
  teacher_id?: string | null; // UUID, Foreign key to public.profiles.id
  duration?: number | null; // Integer, duration in minutes
  created_at?: string | null;
  updated_at?: string | null;

  // Populated in application logic, not direct table columns
  subjectName?: string; // Joined from subjects table
  totalQuestions?: number; // Calculated from exam_questions or can be denormalized
  questions?: Question[]; // Populated by fetching related questions based on exam_questions
  durationInMinutes?: number; // Compatibility if old type used this; prefer `duration`
}

export interface ExamQuestion { // For the exam_questions join table
  exam_id: string; // UUID
  question_id: string; // UUID
  order_number?: number | null;
  points?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
}


export type FirebaseUser = User; // Placeholder, ideally replace with SupabaseUser if different structure needed

export interface AiAnalysisResult {
  id?: string; // Will be UUID
  userId: string; // Foreign key to public.profiles.id (UUID)
  userExamAttemptId?: string | null; // Foreign key to user_exam_attempts.id (UUID)
  inputExamResultsText: string;
  inputStudentGoalsText?: string | null;
  recommendations: string;
  followUpQuestions?: string | null;
  analyzedAt: string;
}

export interface NewsItem {
  id: string; // UUID from news_articles table
  title: string;
  content: string;
  image_url?: string | null; // from news_articles table
  created_at?: string; // from news_articles table
  updated_at?: string; // from news_articles table
}

export interface ActivationCode {
  id: string; // UUID
  encoded_value: string;
  name: string;
  type: string; // "general_monthly", "choose_single_subject_yearly", etc.
  subject_id: string | null; // UUID, for codes pre-linked to a specific subject
  subject_name: string | null; // Denormalized name of the pre-linked subject
  is_active: boolean;
  is_used: boolean;
  used_by_user_id: string | null; // UUID of the user who used the code
  used_for_subject_id: string | null; // TEXT, name of the subject if 'type' is choose_single_subject_*
  valid_from: string; // ISO string
  valid_until: string; // ISO string
  used_at: string | null; // ISO string
  created_at: string; // ISO string
  updated_at: string; // ISO string
}


export interface BackendCodeDetails {
  id: string; // UUID of the activation_code
  type: string;
  subjectId: string | null; // UUID of pre-linked subject, if any
  subjectName: string | null; // Name of pre-linked subject, if any
  validUntil: string; // ISO string
  name?: string;
  encodedValue?: string;
}

export interface BackendCheckResult {
  isValid: boolean;
  message?: string;
  needsSubjectChoice?: boolean;
  codeDetails?: BackendCodeDetails;
}

export interface BackendConfirmationPayload {
  userId: string; // UUID
  email: string;
  codeId: string; // UUID of the activation_code
  codeType: string; // Type from the activation_code
  codeValidUntil: string; // valid_until from the activation_code (ISO string)
  chosenSubjectId?: string; // UUID of the chosen subject (if applicable)
  chosenSubjectName?: string; // Name of the chosen subject (if applicable)
}

export interface BackendConfirmationResult {
  success: boolean;
  message: string;
  activatedPlanName?: string;
  subscriptionEndDate?: string; // ISO string
}


export interface Announcement {
  id: string; // Will be UUID
  title: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error' | 'general';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ActivationLog {
  id: string; // UUID
  user_id: string; // UUID
  code_id: string; // UUID
  subject_id: string | null; // UUID
  email: string | null;
  code_type: string | null;
  plan_name: string | null;
  activated_at: string; // ISO string
}


// Supabase specific types if needed, e.g. for User
export type SupabaseAuthUser = User; // Placeholder, use Supabase's actual User type if different
                                    // import { User as SupabaseUser } from '@supabase/supabase-js';

