
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
  // Example structure if you were to implement it:
  // try {
  //   let query = supabase.from('exams').select('*').eq('published', true);
  //   if (filters?.subjectId && filters.subjectId !== 'all' && filters.subjectId !== '') {
  //     query = query.eq('subject_id', filters.subjectId);
  //   }
  //   if (filters?.teacherId && filters.teacherId !== 'all' && filters.teacherId !== '') {
  //     query = query.eq('teacher_id', filters.teacherId);
  //   }
  //   query = query.order('created_at', { ascending: false });
  //   const { data, error } = await query;
  //   if (error) throw error;
  //   return data || []; // Ensure to map to your Exam type
  // } catch (error) {
  //   console.error("Error fetching public exams from Supabase: ", error);
  //   throw error;
  // }
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
  // Example structure:
  // try {
  //   const { data, error } = await supabase.from('questions').select('*').in('id', questionIds);
  //   if (error) throw error;
  //   // Ensure order matches original questionIds if necessary
  //   const orderedQuestions = questionIds.map(id => (data || []).find(q => q.id === id)).filter(q => q !== undefined) as Question[];
  //   return orderedQuestions;
  // } catch (error) {
  //   console.error(`Error fetching questions by IDs from Supabase: `, error);
  //   throw error;
  // }
  return [];
};

/**
 * Fetches a single exam by its ID, and resolves its questions using `questionIds`.
 * TODO: Implement this function to fetch an exam and its questions from Supabase.
 */
export const getExamById = async (examId: string): Promise<Exam | null> => {
  console.warn(`getExamById (${examId}) needs to be implemented for Supabase. Returning null.`);
  // Example structure:
  // try {
  //   const { data: examData, error: examError } = await supabase
  //     .from('exams')
  //     .select('*, questions(id, question_text, options, correct_option_id, subject_id, subject_name, explanation, points, topic, difficulty, tags, created_by)') // Example of joining if questions are related
  //     .eq('id', examId)
  //     .maybeSingle(); // Use maybeSingle if an exam might not have questions or questions are in a separate field/call
  //   if (examError) throw examError;
  //   if (!examData) return null;
  //   // If questions are just IDs in examData.question_ids:
  //   // const questions = await getQuestionsByIds(examData.question_ids || []);
  //   // return { ...examData, questions: questions } as Exam; // Map to your Exam type
  //   return examData as Exam; // Adjust mapping based on your Supabase schema
  // } catch (error) {
  //   console.error(`Error fetching exam with ID ${examId} from Supabase: `, error);
  //   throw error;
  // }
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
  // Example structure:
  // try {
  //   const { data, error } = await supabase.from('exams').select('*').in('id', examIds);
  //   if (error) throw error;
  //   const orderedExams = examIds.map(id => (data || []).find(e => e.id === id)).filter(e => e !== undefined) as Exam[];
  //   return orderedExams;
  // } catch (error) {
  //   console.error("Error fetching exams by IDs from Supabase: ", error);
  //   throw error;
  // }
  return [];
};

/**
 * Fetches questions for a specific subject.
 * TODO: Implement this function to fetch questions by subject from Supabase.
 */
export const getQuestionsBySubject = async (subjectId: string, questionLimit: number = 20): Promise<Question[]> => {
  console.warn(`getQuestionsBySubject (${subjectId}) needs to be implemented for Supabase. Returning empty array.`);
  // Example structure:
  // try {
  //   const { data, error } = await supabase
  //     .from('questions')
  //     .select('*')
  //     .eq('subject_id', subjectId)
  //     .limit(questionLimit);
  //   if (error) throw error;
  //   return (data || []) as Question[];
  // } catch (error) {
  //   console.error(`Error fetching questions for subject ${subjectId} from Supabase: `, error);
  //   throw error;
  // }
  return [];
};

/**
 * Saves an exam attempt and updates user points (Using Supabase).
 */
export const saveExamAttempt = async (attemptData: {
  userId: string;
  examId?: string;
  subjectId?: string;
  examType: 'general_exam' | 'subject_practice';
  score: number;
  correctAnswersCount: number;
  totalQuestionsAttempted: number;
  answers: Array<{ questionId: string; selectedOptionId: string; isCorrect: boolean }>;
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
 * Fetches all subjects.
 * TODO: Implement this function to fetch subjects from Supabase.
 */
export const getSubjects = async (): Promise<Subject[]> => {
  console.warn("getSubjects needs to be implemented for Supabase. Returning empty array.");
  // Example structure:
  // try {
  //   const { data, error } = await supabase.from('subjects').select('*').order('name');
  //   if (error) throw error;
  //   return (data || []) as Subject[];
  // } catch (error) {
  //   console.error("Error fetching subjects from Supabase: ", error);
  //   throw error;
  // }
  return [];
};

/**
 * Fetches a single subject by its ID.
 * TODO: Implement this function to fetch a subject by ID from Supabase.
 */
export const getSubjectById = async (subjectId: string): Promise<Subject | null> => {
  console.warn(`getSubjectById (${subjectId}) needs to be implemented for Supabase. Returning null.`);
  // Example structure:
  // try {
  //   const { data, error } = await supabase.from('subjects').select('*').eq('id', subjectId).maybeSingle();
  //   if (error) throw error;
  //   return data as Subject | null;
  // } catch (error) {
  //   console.error(`Error fetching subject with ID ${subjectId} from Supabase: `, error);
  //   throw error;
  // }
  return null;
};

/**
 * Fetches all sections for a given subject.
 * TODO: Implement this function to fetch subject sections from Supabase.
 */
export const getSubjectSections = async (subjectId: string): Promise<SubjectSection[]> => {
  console.warn(`getSubjectSections (${subjectId}) needs to be implemented for Supabase. Returning empty array.`);
  // Example structure:
  // try {
  //   const { data, error } = await supabase
  //     .from('subject_sections') // Assuming table name
  //     .select('*')
  //     .eq('subject_id', subjectId)
  //     .order('order', { ascending: true });
  //   if (error) throw error;
  //   return (data || []) as SubjectSection[];
  // } catch (error) {
  //   console.error(`Error fetching sections for subject ${subjectId} from Supabase: `, error);
  //   throw error;
  // }
  return [];
};

/**
 * Fetches a single section by its ID within a subject.
 * TODO: Implement this function to fetch a section by ID from Supabase.
 */
export const getSectionById = async (subjectId: string, sectionId: string): Promise<SubjectSection | null> => {
  console.warn(`getSectionById (${subjectId}/${sectionId}) needs to be implemented for Supabase. Returning null.`);
  // Example structure:
  // try {
  //   const { data, error } = await supabase
  //     .from('subject_sections')
  //     .select('*')
  //     .eq('subject_id', subjectId)
  //     .eq('id', sectionId)
  //     .maybeSingle();
  //   if (error) throw error;
  //   return data as SubjectSection | null;
  // } catch (error) {
  //   console.error(`Error fetching section ${sectionId} for subject ${subjectId} from Supabase: `, error);
  //   throw error;
  // }
  return null;
};

/**
 * Fetches all lessons for a given section within a subject.
 * TODO: Implement this function to fetch section lessons from Supabase.
 */
export const getSectionLessons = async (subjectId: string, sectionId: string): Promise<Lesson[]> => {
  console.warn(`getSectionLessons (${subjectId}/${sectionId}) needs to be implemented for Supabase. Returning empty array.`);
  // Example structure:
  // try {
  //   const { data, error } = await supabase
  //     .from('lessons') // Assuming table name
  //     .select('*')
  //     .eq('subject_id', subjectId) // Assuming lessons also have subject_id
  //     .eq('section_id', sectionId)
  //     .order('order', { ascending: true });
  //   if (error) throw error;
  //   return (data || []) as Lesson[];
  // } catch (error) {
  //   console.error(`Error fetching lessons for section ${sectionId} in subject ${subjectId} from Supabase: `, error);
  //   throw error;
  // }
  return [];
};

/**
 * Fetches a single lesson by its ID within a section and subject.
 * TODO: Implement this function to fetch a lesson by ID from Supabase.
 */
export const getLessonById = async (subjectId: string, sectionId: string, lessonId: string): Promise<Lesson | null> => {
  console.warn(`getLessonById (${subjectId}/${sectionId}/${lessonId}) needs to be implemented for Supabase. Returning null.`);
  // Example structure:
  // try {
  //   const { data, error } = await supabase
  //     .from('lessons')
  //     .select('*')
  //     .eq('subject_id', subjectId)
  //     .eq('section_id', sectionId)
  //     .eq('id', lessonId)
  //     .maybeSingle();
  //   if (error) throw error;
  //   return data as Lesson | null;
  // } catch (error) {
  //   console.error(`Error fetching lesson ${lessonId} from Supabase: `, error);
  //   throw error;
  // }
  return null;
};
