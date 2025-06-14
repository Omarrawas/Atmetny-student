
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
  subjectId?: string | null;
  subjectName?: string | null;
}

export type SubjectBranch = 'scientific' | 'literary' | 'general' | 'common' | 'undetermined';


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
  id: string;
  text: string;
}

export interface Question {
  id: string;
  questionText: string;
  options: QuestionOption[];
  correctOptionId?: string | null;
  subjectId: string;
  subjectName: string;
  explanation?: string;
  points?: number;
  topic?: string;
  difficulty?: 'easy' | 'medium' | 'hard' | 'all';
  tags?: string[];
  createdBy?: string;
}

export interface Subject {
  id: string;
  name: string;
  branch: SubjectBranch;
  iconName?: LucideIconName;
  description?: string;
  image?: string;
  imageHint?: string;
}

export interface SubjectSection {
  id: string;
  title: string;
  description?: string;
  order?: number;
  type?: string;
  subjectId?: string;
  isUsed?: boolean;
  createdAt?: string; // Changed from Timestamp
  updatedAt?: string; // Changed from Timestamp
  usedAt?: string | null; // Changed from Timestamp
  usedByUserId?: string | null;
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
  id: string;
  title: string;
  content?: string;
  notes?: string;
  videoUrl?: string;
  teachers?: LessonTeacher[];
  files?: LessonFile[];
  order?: number;
  subjectId?: string;
  sectionId?: string;
  teacherId?: string | null;
  teacherName?: string | null;
  linkedExamIds?: string[];
  createdAt?: string; // Changed from Timestamp
  updatedAt?: string; // Changed from Timestamp
  isLocked?: boolean;
  isUsed?: boolean;
  usedAt?: string | null; // Changed from Timestamp
  usedByUserId?: string | null;
}


export interface Exam {
  id: string;
  title: string;
  subjectId: string;
  subjectName: string;
  teacherId?: string;
  teacherName?: string;
  durationInMinutes?: number;
  totalQuestions?: number;
  image?: string;
  imageHint?: string;
  description?: string;
  published: boolean;
  createdAt?: string; // Changed from Timestamp
  updatedAt?: string; // Changed from Timestamp
  questionIds?: string[];
  questions?: Question[];
}

export type FirebaseUser = User; // Placeholder, ideally replace with SupabaseUser if different structure needed

export interface AiAnalysisResult {
  id?: string;
  userId: string;
  userExamAttemptId?: string;
  inputExamResultsText: string;
  inputStudentGoalsText?: string;
  recommendations: string;
  followUpQuestions?: string;
  analyzedAt: string; // Changed from Timestamp
}

export interface NewsItem {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  imageHint?: string;
  publishedAt: string; // Changed from Timestamp
  source?: string;
  category?: string;
  createdAt?: string; // Changed from Timestamp
  updatedAt?: string; // Changed from Timestamp
}

export interface ActivationCode {
  id: string; 
  createdAt: string; // Changed from Timestamp
  encodedValue: string; 
  isActive: boolean;    
  isUsed: boolean;      
  name: string;         
  subjectId: string | null; 
  subjectName: string | null;
  type: "general_monthly" | "general_quarterly" | "general_yearly" |
        "trial_weekly" |
        "choose_single_subject_monthly" | "choose_single_subject_quarterly" | "choose_single_subject_yearly" |
        string; 
  updatedAt: string; // Changed from Timestamp
  usedAt: string | null; // Changed from Timestamp
  usedByUserId: string | null;
  usedForSubjectId?: string | null;
  validFrom: string; // Changed from Timestamp
  validUntil: string; // Changed from Timestamp
}


export interface BackendCodeDetails {
  id: string; 
  type: string;
  subjectId: string | null;
  subjectName: string | null;
  validUntil: string | null; // Changed from Timestamp
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
  codeValidUntil: string; // Changed from Timestamp
  chosenSubjectId?: string;
  chosenSubjectName?: string;
}

export interface BackendConfirmationResult {
  success: boolean;
  message: string;
  activatedPlanName?: string;
  subscriptionEndDate?: string; // Changed from Timestamp
}


export interface Announcement {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error' | 'general';
  isActive: boolean;
  createdAt: string; // Changed from Timestamp
  updatedAt: string; // Changed from Timestamp
}

// Supabase specific types if needed, e.g. for User
export type SupabaseAuthUser = User; // Placeholder, use Supabase's actual User type if different
                                    // import { User as SupabaseUser } from '@supabase/supabase-js';

