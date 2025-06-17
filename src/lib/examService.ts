
'use client';

import { supabase } from '@/lib/supabaseClient';
import type { Exam, Question, QuestionOption, AiAnalysisResult, Subject, SubjectSection, Lesson } from './types';
import { getUserProfile, saveUserProfile } from './userProfileService';

/**
 * Fetches all published exams, with optional filtering by subjectId and teacherId.
 * TODO: Implement this function to fetch public exams from Supabase.
 */
export const getPublicExams = async (filters?: { subjectId?: string; teacherId?: string }): Promise<Exam[]> => {
  console.warn("getPublicExams needs to be implemented for Supabase. Returning empty array. Filters received:", filters);
  return [];
};

/**
 * Fetches multiple questions by their IDs from the central 'questions' collection.
 * TODO: Implement this function to fetch questions from Supabase.
 */
export const getQuestionsByIds = async (questionIds: string[]): Promise<Question[]> => {
  console.warn("getQuestionsByIds needs to be implemented for Supabase. Returning empty array. IDs received:", questionIds);
  if (!questionIds || questionIds.length === 0) {
    return [];
  }
  return [];
};

/**
 * Fetches a single exam by its ID, and resolves its questions using `questionIds`.
 * TODO: Implement this function to fetch an exam and its questions from Supabase.
 */
export const getExamById = async (examId: string): Promise<Exam | null> => {
  console.warn(`getExamById (${examId}) needs to be implemented for Supabase. Returning null.`);
  return null;
};

/**
 * Fetches multiple exams by their IDs.
 * TODO: Implement this function to fetch exams by IDs from Supabase.
 */
export const getExamsByIds = async (examIds: string[]): Promise<Exam[]> => {
  console.warn("getExamsByIds needs to be implemented for Supabase. Returning empty array. IDs:", examIds);
  if (!examIds || examIds.length === 0) {
    return [];
  }
  return [];
};

/**
 * Fetches questions for a specific subject.
 * TODO: Implement this function to fetch questions by subject from Supabase.
 */
export const getQuestionsBySubject = async (subjectId: string, questionLimit: number = 20): Promise<Question[]> => {
  console.warn(`getQuestionsBySubject (${subjectId}) needs to be implemented for Supabase. Returning empty array.`);
  return [];
};

/**
 * Saves an exam attempt and updates user points (Using Supabase).
 */
export const saveExamAttempt = async (attemptData: {
  userId: string;
  examId?: string; // UUID
  subjectId?: string; // UUID
  examType: 'general_exam' | 'subject_practice';
  score: number;
  correctAnswersCount: number;
  totalQuestionsAttempted: number;
  answers: Array<{ questionId: string; selectedOptionId: string; isCorrect: boolean }>; // questionId is UUID
  startedAt: Date;
  completedAt: Date;
}): Promise<string> => {
  try {
    const { userId, startedAt, completedAt, ...restOfAttemptData } = attemptData;
    
    const { data: insertedAttempt, error: attemptError } = await supabase
      .from('user_exam_attempts')
      .insert({
        user_id: userId,
        ...restOfAttemptData,
        started_at: startedAt.toISOString(),
        completed_at: completedAt.toISOString(),
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (attemptError) throw attemptError;
    if (!insertedAttempt) throw new Error("Failed to save exam attempt, no data returned.");

    const userProfile = await getUserProfile(userId);
    if (userProfile) {
      const pointsPerCorrectAnswer = 10; 
      const pointsEarned = attemptData.correctAnswersCount * pointsPerCorrectAnswer;
      
      const currentPoints = userProfile.points || 0;
      const newTotalPoints = currentPoints + pointsEarned;
      
      await saveUserProfile({
        id: userId, 
        points: newTotalPoints,
        updatedAt: new Date().toISOString(),
      }); 
      console.log(`User ${userId} earned ${pointsEarned} points. New total: ${newTotalPoints} (Supabase)`);
    } else {
      console.warn(`User profile not found for ID ${userId} (Supabase) while trying to update points.`);
    }

    return insertedAttempt.id;
  } catch (error) {
    console.error("Error saving exam attempt (Supabase): ", error);
    throw error;
  }
};

/**
 * Saves AI analysis results to Supabase.
 */
export const saveAiAnalysis = async (analysisData: Omit<AiAnalysisResult, 'id' | 'analyzedAt'>): Promise<string> => {
  try {
    const dataToSave = {
      user_id: analysisData.userId,
      input_exam_results_text: analysisData.inputExamResultsText,
      input_student_goals_text: analysisData.inputStudentGoalsText,
      recommendations: analysisData.recommendations,
      follow_up_questions: analysisData.followUpQuestions,
      analyzed_at: new Date().toISOString(), 
    };

    const { data: insertedAnalysis, error } = await supabase
      .from('ai_analyses')
      .insert(dataToSave)
      .select()
      .single();

    if (error) throw error;
    if (!insertedAnalysis) throw new Error("Failed to save AI analysis, no data returned.");
    
    console.log(`AI Analysis result saved with ID: ${insertedAnalysis.id} (Supabase)`);
    return insertedAnalysis.id;
  } catch (error) {
    console.error("Error saving AI analysis result (Supabase): ", error);
    throw error;
  }
};

/**
 * Fetches all subjects from Supabase.
 */
export const getSubjects = async (): Promise<Subject[]> => {
  try {
    const { data, error } = await supabase
      .from('subjects')
      .select('id, name, branch, icon_name, description, image, image_hint, order, created_at, updated_at')
      .order('order', { ascending: true, nullsFirst: false })
      .order('name', { ascending: true });

    if (error) {
      console.error("Error fetching subjects from Supabase: ", error);
      throw error;
    }
    return (data || []) as Subject[];
  } catch (error) {
    console.error("Error in getSubjects (Supabase): ", error);
    throw error;
  }
};

/**
 * Fetches a single subject by its UUID from Supabase.
 */
export const getSubjectById = async (subjectId: string): Promise<Subject | null> => {
  try {
    const { data, error } = await supabase
      .from('subjects')
      .select('id, name, branch, icon_name, description, image, image_hint, order, created_at, updated_at')
      .eq('id', subjectId)
      .maybeSingle();

    if (error) {
      console.error(`Error fetching subject with ID ${subjectId} from Supabase: `, error);
      throw error;
    }
    return data ? data as Subject : null;
  } catch (error) {
    console.error("Error in getSubjectById (Supabase): ", error);
    throw error;
  }
};

/**
 * Fetches all sections for a given subject from Supabase.
 */
export const getSubjectSections = async (subjectId: string): Promise<SubjectSection[]> => {
  console.log(`[examService] Attempting to fetch sections for subject_id: ${subjectId}`);
  try {
    if (!subjectId) {
      console.warn("[examService] getSubjectSections called with no subjectId. Returning empty array.");
      return [];
    }
    const { data, error, status } = await supabase
      .from('subject_sections')
      .select('id, subject_id, title, type, order, is_locked, created_at, updated_at') // Removed 'description'
      .eq('subject_id', subjectId)
      .order('order', { ascending: true, nullsFirst: false })
      .order('title', { ascending: true });

    if (error) {
      console.error(`[examService] Supabase error fetching sections for subject ${subjectId}. Status: ${status}.`);
      console.error(`[examService] Error Message: ${error.message}`);
      console.error(`[examService] Error Details: ${error.details}`);
      console.error(`[examService] Error Hint: ${error.hint}`);
      console.error(`[examService] Error Code: ${error.code}`);
      // Throw a new, more informative error object
      throw new Error(`Supabase error (Code: ${error.code || 'UNKNOWN'}, Status: ${status}): ${error.message || 'Failed to fetch subject sections.'}`);
    }

    console.log(`[examService] Successfully fetched ${data?.length || 0} sections for subject_id: ${subjectId}`);
    return (data || []) as SubjectSection[];
  } catch (e: any) {
    console.error(`[examService] Catch block in getSubjectSections for subject ${subjectId}:`, e.message || e);
    // Rethrow the error so the calling page component can handle it (e.g., show a message to the user)
    throw new Error(e.message || `An unexpected error occurred while fetching sections for subject ${subjectId}.`);
  }
};


/**
 * Fetches a single section by its ID within a subject from Supabase.
 */
export const getSectionById = async (subjectId: string, sectionId: string): Promise<SubjectSection | null> => {
   try {
    if (!subjectId || !sectionId) {
      console.warn("getSectionById called with missing subjectId or sectionId. Returning null.");
      return null;
    }
    const { data, error } = await supabase
      .from('subject_sections')
      .select('id, subject_id, title, type, order, is_locked, created_at, updated_at') // Removed 'description'
      .eq('id', sectionId)
      .eq('subject_id', subjectId) 
      .maybeSingle();

    if (error) {
      console.error(`Error fetching section ${sectionId} for subject ${subjectId} from Supabase: `, error);
      throw error;
    }
    return data ? data as SubjectSection : null;
  } catch (error) {
    console.error("Error in getSectionById (Supabase): ", error);
    throw error;
  }
};


/**
 * Fetches all lessons for a given section within a subject.
 * TODO: Implement this function to fetch section lessons from Supabase (using subject_id and section_id UUIDs).
 */
export const getSectionLessons = async (subjectId: string, sectionId: string): Promise<Lesson[]> => {
  console.warn(`getSectionLessons (${subjectId}/${sectionId} - UUIDs) needs to be implemented for Supabase. Returning empty array.`);
  return [];
};

/**
 * Fetches a single lesson by its ID within a section and subject.
 * TODO: Implement this function to fetch a lesson by ID from Supabase (using subject_id, section_id, and lesson_id UUIDs).
 */
export const getLessonById = async (subjectId: string, sectionId: string, lessonId: string): Promise<Lesson | null> => {
  console.warn(`getLessonById (${subjectId}/${sectionId}/${lessonId} - UUIDs) needs to be implemented for Supabase. Returning null.`);
  return null;
};


    
