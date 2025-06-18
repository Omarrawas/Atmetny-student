
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
  avatarUrl?: string; // Supabase typically uses avatar_url
  avatarHint?: string;
  points: number;
  level: number;
  progressToNextLevel: number;
  badges: Badge[];
  rewards: Reward[];
  studentGoals?: string;
  branch?: SubjectBranch;
  university?: string;
  major?: string;
  createdAt: string; // Changed from Timestamp
  updatedAt: string; // Changed from Timestamp
  activeSubscription?: SubscriptionDetails | null;
}

// Input type for saveUserProfile function
export type UserProfileWriteData = {
  id: string; // Changed from uid to id
  name?: string;
  email?: string; // Email might come from auth user, not form always
  avatarUrl?: string;
  avatarHint?: string;
  points?: number;
  level?: number;
  progressToNextLevel?: number;
  badges?: Badge[];
  rewards?: Reward[];
  studentGoals?: string;
  branch?: SubjectBranch;
  university?: string;
  major?: string;
  activeSubscription?: Omit<SubscriptionDetails, 'startDate' | 'endDate'> & { startDate: string | Date, endDate: string | Date } | null;
  updatedAt?: string; // Forcing update of this field
  createdAt?: string; // Only on creation
};


export interface QuestionOption {
  id: string; // UUID
  text: string;
}

export interface Question {
  id: string; // UUID
  questionText: string;
  options: QuestionOption[];
  correctOptionId?: string | null; // UUID
  subjectId: string; // UUID, Foreign key to public.subjects
  subjectName: string; // Denormalized or joined
  explanation?: string;
  points?: number;
  topic?: string; // Could be a foreign key to a 'topics' table later
  difficulty?: 'easy' | 'medium' | 'hard' | 'all';
  tags?: string[];
  createdBy?: string; // UUID, Foreign key to public.users or public.profiles
  created_at?: string;
  updated_at?: string;
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
  is_locked?: boolean | null;
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
  teacher_id?: string | null; // Kept for potential direct teacher linking
  teacher_name?: string | null; // Kept for potential direct teacher linking
  linked_exam_ids?: string[] | null; // Array of UUIDs
  is_locked?: boolean | null;
  is_used?: boolean | null; // For tracking if a lesson (e.g., a trial lesson) has been "consumed"
  created_at: string;
  updated_at: string;
  used_at?: string | null;
  used_by_user_id?: string | null; // UUID, Foreign key to auth.users.id
}


export interface Exam {
  id: string; // Will be UUID
  title: string;
  subject_id: string; // Foreign key to public.subjects.id (UUID)
  subjectName: string; // Denormalized or joined
  teacherId?: string;
  teacherName?: string;
  durationInMinutes?: number;
  totalQuestions?: number;
  image?: string;
  imageHint?: string;
  description?: string;
  published: boolean;
  created_at?: string;
  updated_at?: string;
  questionIds?: string[]; // Array of UUIDs
  questions?: Question[]; // Can be populated by joining/fetching separately
}

export type FirebaseUser = User; // Placeholder, ideally replace with SupabaseUser if different structure needed

export interface AiAnalysisResult {
  id?: string; // Will be UUID
  userId: string; // Foreign key to public.profiles.id (UUID)
  userExamAttemptId?: string; // Foreign key to user_exam_attempts.id (UUID)
  inputExamResultsText: string;
  inputStudentGoalsText?: string;
  recommendations: string;
  followUpQuestions?: string;
  analyzedAt: string;
}

export interface NewsItem {
  id: string; // Will be UUID
  title: string;
  content: string;
  imageUrl?: string;
  imageHint?: string;
  publishedAt: string;
  source?: string;
  category?: string;
  created_at?: string;
  updated_at?: string;
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

