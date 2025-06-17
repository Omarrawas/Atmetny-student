
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
  activationCodeId?: string;
  subjectId?: string | null; // UUID
  subjectName?: string | null;
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
  description?: string | null; // Matches SQL (nullable)
  type: string; // E.g., 'unit', 'chapter', 'theme' (NOT NULL in SQL)
  order?: number | null;
  is_locked?: boolean | null; // Default true in SQL
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
  id: string; // Will be UUID
  title: string;
  content?: string;
  notes?: string;
  videoUrl?: string;
  teachers?: LessonTeacher[];
  files?: LessonFile[];
  order?: number;
  subject_id?: string; // Foreign key to public.subjects.id (UUID)
  section_id?: string; // Foreign key to public.subject_sections.id (UUID)
  teacherId?: string | null;
  teacherName?: string | null;
  linkedExamIds?: string[];
  created_at?: string;
  updated_at?: string;
  isLocked?: boolean;
  isUsed?: boolean;
  usedAt?: string | null;
  usedByUserId?: string | null;
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
  id: string; // Will be UUID
  created_at: string;
  encoded_value: string;
  is_active: boolean;
  is_used: boolean;
  name: string;
  subject_id: string | null; // Foreign key to public.subjects.id (UUID), nullable
  subject_name: string | null; // Denormalized or joined
  type: "general_monthly" | "general_quarterly" | "general_yearly" |
        "trial_weekly" |
        "choose_single_subject_monthly" | "choose_single_subject_quarterly" | "choose_single_subject_yearly" |
        string;
  updated_at: string;
  used_at: string | null;
  used_by_user_id: string | null; // Foreign key to public.profiles.id (UUID)
  used_for_subject_id?: string | null; // Foreign key to public.subjects.id (UUID), nullable
  valid_from: string;
  valid_until: string;
}


export interface BackendCodeDetails {
  id: string;
  type: string;
  subjectId: string | null;
  subjectName: string | null;
  validUntil: string | null;
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
  userId: string;
  email: string;
  codeId: string;
  codeType: string;
  codeValidUntil: string;
  chosenSubjectId?: string;
  chosenSubjectName?: string;
}

export interface BackendConfirmationResult {
  success: boolean;
  message: string;
  activatedPlanName?: string;
  subscriptionEndDate?: string;
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

// Supabase specific types if needed, e.g. for User
export type SupabaseAuthUser = User; // Placeholder, use Supabase's actual User type if different
                                    // import { User as SupabaseUser } from '@supabase/supabase-js';
