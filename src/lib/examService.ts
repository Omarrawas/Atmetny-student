
'use client';

import { supabase } from '@/lib/supabaseClient';
import type { Exam, Question, QuestionOption, AiAnalysisResult, Subject, SubjectSection, Lesson, LessonTeacher, LessonFile, ExamQuestion } from './types';
import { getUserProfile, saveUserProfile } from './userProfileService';

/**
 * Fetches all published exams, with optional filtering by subjectId and teacherId.
 */
export const getPublicExams = async (filters?: { subjectId?: string; teacherId?: string }): Promise<Exam[]> => {
  console.log(`[examService] getPublicExams called with filters:`, filters);
  try {
    let query = supabase
      .from('exams')
      .select(`
        id,
        title,
        description,
        subject_id,
        published,
        image,
        image_hint,
        teacher_name,
        teacher_id,
        duration,
        created_at,
        updated_at,
        subjects (name)
      `)
      .eq('published', true);

    if (filters?.subjectId) {
      query = query.eq('subject_id', filters.subjectId);
    }
    if (filters?.teacherId) {
      query = query.eq('teacher_id', filters.teacherId);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error, status } = await query;

    if (error) {
      console.error(`[examService] Supabase error fetching public exams. Status: ${status}`);
      console.error(`  Message: ${error.message}`);
      console.error(`  Details: ${error.details}`);
      console.error(`  Hint: ${error.hint}`);
      console.error(`  Code: ${error.code}`);
      let displayError = new Error(error.message || `Failed to fetch public exams. Supabase code: ${error.code || 'N/A'}`);
      if (status === 0 && error.message && error.message.toLowerCase().includes('failed to fetch')) {
          displayError = new Error(
              `Failed to fetch public exams. This is often a network or CORS issue. ` +
              `Ensure your Supabase project allows requests from this application's origin (${typeof window !== 'undefined' ? window.location.origin : 'UNKNOWN_ORIGIN'}). ` +
              `Original Supabase error: ${error.message} (Status: ${status}, Code: ${error.code || 'N/A'})`
          );
      }
      throw displayError;
    }
    
    const exams = (data || []).map(exam => ({
      ...exam,
      subjectName: exam.subjects?.name || 'غير محدد',
      duration: exam.duration, 
    }));

    for (const exam of exams) {
        const { count, error: countError } = await supabase
            .from('exam_questions')
            .select('question_id', { count: 'exact', head: true })
            .eq('exam_id', exam.id);
        if (countError) {
            console.warn(`[examService] Could not fetch question count for exam ${exam.id}:`, countError.message);
            exam.totalQuestions = 0;
        } else {
            exam.totalQuestions = count ?? 0;
        }
    }
    return exams as Exam[];

  } catch (e: any) {
    console.error("[examService] General catch block in getPublicExams. Raw error:", e);
     if (e instanceof Error && e.message.startsWith("Failed to fetch public exams")) {
        throw e;
    }
    if (e instanceof TypeError && e.message.toLowerCase().includes('failed to fetch')) {
        throw new Error(
            `Network error: Failed to fetch public exams. Please check your internet connection and Supabase CORS settings. ` +
            `Ensure Supabase allows requests from origin: ${typeof window !== 'undefined' ? window.location.origin : 'UNKNOWN_ORIGIN'}. Original error: ${e.message}`
        );
    }
    throw new Error(e.message || 'An unexpected error occurred while fetching public exams.');
  }
};

/**
 * Fetches multiple questions by their IDs from the 'questions' table.
 */
export const getQuestionsByIds = async (questionIds: string[]): Promise<Question[]> => {
  console.log(`[examService] getQuestionsByIds called for IDs:`, questionIds);
  if (!questionIds || questionIds.length === 0) {
    return [];
  }
  try {
    const { data, error, status } = await supabase
      .from('questions')
      .select(`
        id,
        question_type,
        question_text,
        difficulty,
        subject_id,
        lesson_id,
        options,
        correct_option_id,
        correct_answers,
        model_answer,
        is_sane,
        sanity_explanation,
        is_locked,
        created_at,
        updated_at,
        tag_ids,
        subjects (name) 
      `)
      .in('id', questionIds);

    if (error) {
      console.error(`[examService] Supabase error fetching questions by IDs. Status: ${status}`);
      console.error(`  Message: ${error.message}`);
      console.error(`  Details: ${error.details}`);
      console.error(`  Hint: ${error.hint}`);
      console.error(`  Code: ${error.code}`);
      let displayError = new Error(error.message || `Failed to fetch questions by IDs. Supabase code: ${error.code || 'N/A'}`);
      if (status === 0 && error.message && error.message.toLowerCase().includes('failed to fetch')) {
          displayError = new Error(
              `Failed to fetch questions by IDs. This is often a network or CORS issue. ` +
              `Ensure your Supabase project allows requests from this application's origin (${typeof window !== 'undefined' ? window.location.origin : 'UNKNOWN_ORIGIN'}). ` +
              `Original Supabase error: ${error.message} (Status: ${status}, Code: ${error.code || 'N/A'})`
          );
      }
      throw displayError;
    }
    return (data || []).map(q => ({
        ...q,
        subjectName: q.subjects?.name, 
        options: q.options as QuestionOption[] || [], 
        explanation: q.model_answer 
    })) as Question[];
  } catch (e: any) {
    console.error("[examService] General catch block in getQuestionsByIds. Raw error:", e);
    if (e instanceof Error && e.message.startsWith("Failed to fetch questions by IDs")) {
        throw e;
    }
    if (e instanceof TypeError && e.message.toLowerCase().includes('failed to fetch')) {
        throw new Error(
            `Network error: Failed to fetch questions by IDs. Please check your internet connection and Supabase CORS settings. ` +
            `Ensure Supabase allows requests from origin: ${typeof window !== 'undefined' ? window.location.origin : 'UNKNOWN_ORIGIN'}. Original error: ${e.message}`
        );
    }
    throw new Error(e.message || 'An unexpected error occurred while fetching questions by IDs.');
  }
};

/**
 * Fetches a single exam by its ID, and resolves its questions.
 */
export const getExamById = async (examId: string): Promise<Exam | null> => {
  console.log(`[examService] getExamById called for ID: ${examId}`);
  try {
    const { data: examData, error: examError, status: examStatus } = await supabase
      .from('exams')
      .select(`
        id,
        title,
        description,
        subject_id,
        published,
        image,
        image_hint,
        teacher_name,
        teacher_id,
        duration,
        created_at,
        updated_at,
        subjects (name)
      `)
      .eq('id', examId)
      .maybeSingle();

    if (examError) {
      console.error(`[examService] Supabase error fetching exam ${examId}. Status: ${examStatus}`);
      console.error(`  Message: ${examError.message}`);
      console.error(`  Details: ${examError.details}`);
      console.error(`  Hint: ${examError.hint}`);
      console.error(`  Code: ${examError.code}`);
      let displayError = new Error(examError.message || `Failed to fetch exam ${examId}. Supabase code: ${examError.code || 'N/A'}`);
       if (examStatus === 0 && examError.message && examError.message.toLowerCase().includes('failed to fetch')) {
          displayError = new Error(
              `Failed to fetch exam ${examId}. This is often a network or CORS issue. ` +
              `Ensure your Supabase project allows requests from this application's origin (${typeof window !== 'undefined' ? window.location.origin : 'UNKNOWN_ORIGIN'}). ` +
              `Original Supabase error: ${examError.message} (Status: ${examStatus}, Code: ${examError.code || 'N/A'})`
          );
      }
      throw displayError;
    }
    if (!examData) {
      return null;
    }

    const { data: examQuestionsLinks, error: linksError, status: linksStatus } = await supabase
      .from('exam_questions')
      .select('question_id, order_number, points')
      .eq('exam_id', examId)
      .order('order_number', { ascending: true, nullsFirst: false });

    if (linksError) {
      console.error(`[examService] Supabase error fetching question links for exam ${examId}. Status: ${linksStatus}`);
      console.error(`  Message: ${linksError.message}`);
      console.error(`  Details: ${linksError.details}`);
      console.error(`  Hint: ${linksError.hint}`);
      console.error(`  Code: ${linksError.code}`);
      let displayError = new Error(linksError.message || `Failed to fetch question links for exam ${examId}. Supabase code: ${linksError.code || 'N/A'}`);
       if (linksStatus === 0 && linksError.message && linksError.message.toLowerCase().includes('failed to fetch')) {
          displayError = new Error(
              `Failed to fetch question links for exam ${examId}. This is often a network or CORS issue. ` +
              `Ensure Supabase allows requests from this application's origin (${typeof window !== 'undefined' ? window.location.origin : 'UNKNOWN_ORIGIN'}). ` +
              `Original Supabase error: ${linksError.message} (Status: ${linksStatus}, Code: ${linksError.code || 'N/A'})`
          );
      }
      throw displayError;
    }

    const questionIds = (examQuestionsLinks || []).map(link => link.question_id);
    let fetchedQuestions: Question[] = [];
    if (questionIds.length > 0) {
      fetchedQuestions = await getQuestionsByIds(questionIds);
      fetchedQuestions = fetchedQuestions.map(q => {
        const link = examQuestionsLinks?.find(l => l.question_id === q.id);
        return { 
          ...q, 
          points: link?.points ?? 1, 
        };
      }).sort((a: any, b: any) => (a.order_number ?? Infinity) - (b.order_number ?? Infinity)); 
    }
    
    return {
      ...examData,
      subjectName: examData.subjects?.name || 'غير محدد',
      questions: fetchedQuestions,
      totalQuestions: fetchedQuestions.length,
      duration: examData.duration 
    } as Exam;

  } catch (e: any) {
    console.error(`[examService] General catch block in getExamById (${examId}). Raw error:`, e);
    if (e instanceof Error && (e.message.startsWith("Failed to fetch exam") || e.message.startsWith("Failed to fetch question links"))) {
        throw e;
    }
    if (e instanceof TypeError && e.message.toLowerCase().includes('failed to fetch')) {
        throw new Error(
            `Network error: Failed to fetch data for exam ${examId}. Please check your internet connection and Supabase CORS settings. ` +
            `Ensure Supabase allows requests from origin: ${typeof window !== 'undefined' ? window.location.origin : 'UNKNOWN_ORIGIN'}. Original error: ${e.message}`
        );
    }
    throw new Error(e.message || `An unexpected error occurred while fetching exam ${examId}.`);
  }
};


export const getExamsByIds = async (examIds: string[]): Promise<Exam[]> => {
  console.log(`[examService] getExamsByIds called for IDs:`, examIds);
  if (!examIds || examIds.length === 0) {
    return [];
  }
  try {
    const { data, error, status } = await supabase
      .from('exams')
      .select(`
        id,
        title,
        description,
        subject_id,
        published,
        image,
        image_hint,
        teacher_name,
        teacher_id,
        duration,
        created_at,
        updated_at,
        subjects (name)
      `)
      .in('id', examIds)
      .order('created_at', { ascending: false });

    if (error) {
      console.error(`[examService] Supabase error fetching exams by IDs. Status: ${status}`);
      console.error(`  Message: ${error.message}`);
      console.error(`  Details: ${error.details}`);
      console.error(`  Hint: ${error.hint}`);
      console.error(`  Code: ${error.code}`);
      let displayError = new Error(error.message || `Failed to fetch exams by IDs. Supabase code: ${error.code || 'N/A'}`);
      if (status === 0 && error.message && error.message.toLowerCase().includes('failed to fetch')) {
          displayError = new Error(
              `Failed to fetch exams by IDs. This is often a network or CORS issue. ` +
              `Ensure your Supabase project allows requests from this application's origin (${typeof window !== 'undefined' ? window.location.origin : 'UNKNOWN_ORIGIN'}). ` +
              `Original Supabase error: ${error.message} (Status: ${status}, Code: ${error.code || 'N/A'})`
          );
      }
      throw displayError;
    }
    
    const exams = (data || []).map(exam => ({
      ...exam,
      subjectName: exam.subjects?.name || 'غير محدد',
      duration: exam.duration,
    }));

    for (const exam of exams) {
        const { count, error: countError } = await supabase
            .from('exam_questions')
            .select('question_id', { count: 'exact', head: true })
            .eq('exam_id', exam.id);
        if (countError) {
            exam.totalQuestions = 0;
        } else {
            exam.totalQuestions = count ?? 0;
        }
    }
    return exams as Exam[];

  } catch (e: any) {
    console.error("[examService] General catch block in getExamsByIds. Raw error:", e);
     if (e instanceof Error && e.message.startsWith("Failed to fetch exams by IDs")) {
        throw e;
    }
    if (e instanceof TypeError && e.message.toLowerCase().includes('failed to fetch')) {
        throw new Error(
            `Network error: Failed to fetch exams by IDs. Please check your internet connection and Supabase CORS settings. ` +
            `Ensure Supabase allows requests from origin: ${typeof window !== 'undefined' ? window.location.origin : 'UNKNOWN_ORIGIN'}. Original error: ${e.message}`
        );
    }
    throw new Error(e.message || 'An unexpected error occurred while fetching exams by IDs.');
  }
};


export const getQuestionsBySubject = async (subjectId: string, questionLimit: number = 20): Promise<Question[]> => {
  console.log(`[examService] getQuestionsBySubject called for subjectId: ${subjectId}, limit: ${questionLimit}`);
   try {
    const { data, error, status } = await supabase
      .from('questions')
      .select(`
        id,
        question_type,
        question_text,
        difficulty,
        subject_id,
        lesson_id,
        options,
        correct_option_id,
        correct_answers,
        model_answer,
        subjects (name)
      `) 
      .eq('subject_id', subjectId)
      .limit(questionLimit); 

    if (error) {
      console.error(`[examService] Supabase error fetching questions for subject ${subjectId}. Status: ${status}`);
      console.error(`  Message: ${error.message}`);
      console.error(`  Details: ${error.details}`);
      console.error(`  Hint: ${error.hint}`);
      console.error(`  Code: ${error.code}`);
      let displayError = new Error(error.message || `Failed to fetch questions for subject ${subjectId}. Supabase code: ${error.code || 'N/A'}`);
      if (status === 0 && error.message && error.message.toLowerCase().includes('failed to fetch')) {
          displayError = new Error(
              `Failed to fetch questions for subject ${subjectId}. This is often a network or CORS issue. ` +
              `Ensure your Supabase project allows requests from this application's origin (${typeof window !== 'undefined' ? window.location.origin : 'UNKNOWN_ORIGIN'}). ` +
              `Original Supabase error: ${error.message} (Status: ${status}, Code: ${error.code || 'N/A'})`
          );
      }
      throw displayError;
    }
    return (data || []).map(q => ({
        ...q,
        subjectName: q.subjects?.name || 'غير محدد',
        options: q.options as QuestionOption[] || [],
        explanation: q.model_answer
    })) as Question[];
  } catch (e: any) {
    console.error(`[examService] General catch block in getQuestionsBySubject for subject ${subjectId}. Raw error:`, e);
    if (e instanceof Error && e.message.startsWith("Failed to fetch questions for subject")) {
        throw e;
    }
    if (e instanceof TypeError && e.message.toLowerCase().includes('failed to fetch')) {
        throw new Error(
            `Network error: Failed to fetch questions for subject ${subjectId}. Please check your internet connection and Supabase CORS settings. ` +
            `Ensure Supabase allows requests from origin: ${typeof window !== 'undefined' ? window.location.origin : 'UNKNOWN_ORIGIN'}. Original error: ${e.message}`
        );
    }
    throw new Error(e.message || `An unexpected error occurred while fetching questions for subject ${subjectId}.`);
  }
};

export const saveExamAttempt = async (attemptData: {
  userId: string;
  examId?: string; 
  subjectId?: string; 
  examType: 'general_exam' | 'subject_practice';
  score: number;
  correctAnswersCount: number;
  totalQuestionsAttempted: number;
  answers: Array<{ questionId: string; selectedOptionId: string | null; isCorrect: boolean }>; 
  startedAt: Date;
  completedAt: Date;
}): Promise<string> => {
  console.log(`[examService] saveExamAttempt called for userId: ${attemptData.userId}`);
  try {
    const { userId, startedAt, completedAt, ...restOfAttemptData } = attemptData;
    
    const { data: insertedAttempt, error: attemptError, status } = await supabase
      .from('user_exam_attempts')
      .insert({
        user_id: userId,
        ...restOfAttemptData,
        answers: restOfAttemptData.answers, 
        started_at: startedAt.toISOString(),
        completed_at: completedAt.toISOString(),
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (attemptError) {
      console.error(`[examService] Supabase error saving exam attempt. Status: ${status}`);
      console.error(`  Message: ${attemptError.message}`);
      console.error(`  Details: ${attemptError.details}`);
      console.error(`  Hint: ${attemptError.hint}`);
      console.error(`  Code: ${attemptError.code}`);
      throw attemptError;
    }
    if (!insertedAttempt) throw new Error("Failed to save exam attempt, no data returned from Supabase.");

    const userProfile = await getUserProfile(userId);
    if (userProfile) {
      const pointsPerCorrectAnswer = 10; 
      const pointsEarned = attemptData.correctAnswersCount * pointsPerCorrectAnswer;
      
      const currentPoints = userProfile.points || 0;
      const newTotalPoints = currentPoints + pointsEarned;
      
      await saveUserProfile({
        id: userId, 
        email: userProfile.email,
        points: newTotalPoints,
        updated_at: new Date().toISOString(),
      }); 
      console.log(`[examService] User ${userId} earned ${pointsEarned} points. New total: ${newTotalPoints}`);
    } else {
      console.warn(`[examService] User profile not found for ID ${userId} while trying to update points.`);
    }

    return insertedAttempt.id;
  } catch (e: any) {
    console.error("[examService] General catch block in saveExamAttempt. Raw error:", e);
    if (e instanceof Error && e.message.includes("saving exam attempt")) { // Check for specific part of our error
        throw e;
    }
    throw new Error(e.message || 'An unexpected error occurred while saving the exam attempt.');
  }
};

export const saveAiAnalysis = async (analysisData: Omit<AiAnalysisResult, 'id' | 'analyzedAt'>): Promise<string> => {
  console.log(`[examService] saveAiAnalysis called for userId: ${analysisData.userId}`);
  try {
    const dataToSave = {
      user_id: analysisData.userId,
      input_exam_results_text: analysisData.inputExamResultsText,
      input_student_goals_text: analysisData.inputStudentGoalsText,
      recommendations: analysisData.recommendations,
      follow_up_questions: analysisData.followUpQuestions,
      analyzed_at: new Date().toISOString(), 
      user_exam_attempt_id: analysisData.userExamAttemptId,
    };

    const { data: insertedAnalysis, error, status } = await supabase
      .from('ai_analyses')
      .insert(dataToSave)
      .select()
      .single();

    if (error) {
      console.error(`[examService] Supabase error saving AI analysis. Status: ${status}`);
      console.error(`  Message: ${error.message}`);
      console.error(`  Details: ${error.details}`);
      console.error(`  Hint: ${error.hint}`);
      console.error(`  Code: ${error.code}`);
      throw error;
    }
    if (!insertedAnalysis) throw new Error("Failed to save AI analysis, no data returned from Supabase.");
    
    console.log(`[examService] AI Analysis result saved with ID: ${insertedAnalysis.id}`);
    return insertedAnalysis.id;
  } catch (e: any) {
    console.error("[examService] General catch block in saveAiAnalysis. Raw error:", e);
     if (e instanceof Error && e.message.includes("saving AI analysis")) {
        throw e;
    }
    throw new Error(e.message || 'An unexpected error occurred while saving AI analysis.');
  }
};

export const getSubjects = async (): Promise<Subject[]> => {
  console.log(`[examService] getSubjects called.`);
  try {
    const { data, error, status } = await supabase
      .from('subjects')
      .select('id, name, branch, icon_name, description, image, image_hint, order, created_at, updated_at')
      .order('order', { ascending: true, nullsFirst: false })
      .order('name', { ascending: true });

    if (error) {
      console.error(`[examService] Supabase error fetching subjects. Status: ${status}`);
      console.error(`  Message: ${error.message}`);
      console.error(`  Details: ${error.details}`);
      console.error(`  Hint: ${error.hint}`);
      console.error(`  Code: ${error.code}`);
      let displayError = new Error(error.message || `Failed to fetch subjects. Supabase code: ${error.code || 'N/A'}`);
      if (status === 0 && error.message && error.message.toLowerCase().includes('failed to fetch')) {
          displayError = new Error(
              `Failed to fetch subjects. This is often a network or CORS issue. ` +
              `Ensure your Supabase project allows requests from this application's origin (${typeof window !== 'undefined' ? window.location.origin : 'UNKNOWN_ORIGIN'}). ` +
              `Original Supabase error: ${error.message} (Status: ${status}, Code: ${error.code || 'N/A'})`
          );
      }
      throw displayError;
    }
    return (data || []) as Subject[];
  } catch (e: any) {
    console.error("[examService] General catch block in getSubjects. Raw error:", e);
    if (e instanceof Error && e.message.startsWith("Failed to fetch subjects")) {
        throw e;
    }
    if (e instanceof TypeError && e.message.toLowerCase().includes('failed to fetch')) {
        throw new Error(
            `Network error: Failed to fetch subjects. Please check your internet connection and Supabase CORS settings. ` +
            `Ensure Supabase allows requests from origin: ${typeof window !== 'undefined' ? window.location.origin : 'UNKNOWN_ORIGIN'}. Original error: ${e.message}`
        );
    }
    throw new Error(e.message || 'An unexpected error occurred while fetching subjects.');
  }
};

export const getSubjectById = async (subjectId: string): Promise<Subject | null> => {
  console.log(`[examService] getSubjectById called for ID: ${subjectId}`);
  try {
    const { data, error, status } = await supabase
      .from('subjects')
      .select('id, name, branch, icon_name, description, image, image_hint, order, created_at, updated_at')
      .eq('id', subjectId)
      .maybeSingle();

    if (error) {
      console.error(`[examService] Supabase error fetching subject with ID ${subjectId}. Status: ${status}`);
      console.error(`  Message: ${error.message}`);
      console.error(`  Details: ${error.details}`);
      console.error(`  Hint: ${error.hint}`);
      console.error(`  Code: ${error.code}`);
      let displayError = new Error(error.message || `Failed to fetch subject ${subjectId}. Supabase code: ${error.code || 'N/A'}`);
      if (status === 0 && error.message && error.message.toLowerCase().includes('failed to fetch')) {
          displayError = new Error(
              `Failed to fetch subject ${subjectId}. This is often a network or CORS issue. ` +
              `Ensure your Supabase project allows requests from this application's origin (${typeof window !== 'undefined' ? window.location.origin : 'UNKNOWN_ORIGIN'}). ` +
              `Original Supabase error: ${error.message} (Status: ${status}, Code: ${error.code || 'N/A'})`
          );
      }
      throw displayError;
    }
    return data ? data as Subject : null;
  } catch (e: any) {
    console.error(`[examService] General catch block in getSubjectById for subject ${subjectId}. Raw error:`, e);
    if (e instanceof Error && e.message.startsWith("Failed to fetch subject")) {
        throw e;
    }
    if (e instanceof TypeError && e.message.toLowerCase().includes('failed to fetch')) {
        throw new Error(
            `Network error: Failed to fetch subject ${subjectId}. Please check your internet connection and Supabase CORS settings. ` +
            `Ensure Supabase allows requests from origin: ${typeof window !== 'undefined' ? window.location.origin : 'UNKNOWN_ORIGIN'}. Original error: ${e.message}`
        );
    }
    throw new Error(e.message || `An unexpected error occurred while fetching subject ${subjectId}.`);
  }
};

export const getSubjectSections = async (subjectId: string): Promise<SubjectSection[]> => {
  console.log(`[examService] Initiating getSubjectSections for subjectId: ${subjectId}`);
  if (!supabase) {
    console.error("[examService] Supabase client is not initialized in getSubjectSections!");
    throw new Error("Supabase client is not initialized. Cannot fetch subject sections.");
  }
  // Log the Supabase URL being used by the client instance.
  // Ensure this is the correct URL from your environment variables.
  // console.log(`[examService] Supabase URL being used by client for getSubjectSections: ${supabase.supabaseUrl}`);

  try {
    if (!subjectId) {
      console.warn("[examService] getSubjectSections called with no subjectId. Returning empty array.");
      return [];
    }
    console.log(`[examService] Querying Supabase 'subject_sections' for subject_id: ${subjectId}`);
    const { data, error, status } = await supabase
      .from('subject_sections')
      .select('id, subject_id, title, type, order, is_locked, created_at, updated_at') // Removed 'description'
      .eq('subject_id', subjectId)
      .order('order', { ascending: true, nullsFirst: false })
      .order('title', { ascending: true });

    if (error) {
      console.error(`[examService] Supabase error returned from 'subject_sections' query for subject ${subjectId}.`);
      console.error(`  Status: ${status}`);
      console.error(`  Message: ${error.message}`);
      console.error(`  Details: ${error.details}`);
      console.error(`  Hint: ${error.hint}`);
      console.error(`  Code: ${error.code}`);

      let displayError = new Error(error.message || `Failed to fetch sections for subject ${subjectId}. Supabase code: ${error.code || 'N/A'}`);
      // Enhance the error message for "Failed to fetch" specifically
      if (status === 0 && error.message && error.message.toLowerCase().includes('failed to fetch')) {
          displayError = new Error(
              `Failed to fetch sections for subject ${subjectId}. This is often a network or CORS issue. ` +
              `Ensure your Supabase project allows requests from this application's origin (${typeof window !== 'undefined' ? window.location.origin : 'UNKNOWN_ORIGIN'}). ` +
              `Original Supabase error: ${error.message} (Status: ${status}, Code: ${error.code || 'N/A'})`
          );
      }
      throw displayError; // This error will be caught by the catch block below
    }

    console.log(`[examService] Successfully fetched ${data?.length || 0} sections for subject_id: ${subjectId}`);
    return (data || []) as SubjectSection[];
  } catch (e: any) {
    // This catch block now primarily handles errors not originating from the Supabase client's 'error' object,
    // or re-throws the more specific error created in the `if (error)` block.
    console.error(`[examService] General catch block in getSubjectSections for subject ${subjectId}. Raw error object:`, e);
    
    // Check if 'e' is already one of our custom, more informative errors
    if (e instanceof Error && e.message.startsWith("Failed to fetch sections for subject")) {
        throw e;
    }
    // Specifically handle TypeError "Failed to fetch" if it wasn't caught and detailed by the `if (error)` block
    if (e instanceof TypeError && e.message.toLowerCase().includes('failed to fetch')) {
        throw new Error(
            `Network error: Failed to fetch sections for subject ${subjectId}. ` +
            `Please check your internet connection and Supabase CORS settings. ` +
            `Ensure Supabase allows requests from origin: ${typeof window !== 'undefined' ? window.location.origin : 'UNKNOWN_ORIGIN'}. ` +
            `Original error: ${e.message}`
        );
    }
    // For other types of errors, or if the message is not specific enough.
    throw new Error(e.message || `An unexpected error occurred in getSubjectSections for subject ${subjectId}.`);
  }
};

export const getSectionById = async (sectionId: string): Promise<SubjectSection | null> => {
  console.log(`[examService] getSectionById called for ID: ${sectionId}`);
   try {
    if (!sectionId) {
      console.warn("[examService] getSectionById called with missing sectionId. Returning null.");
      return null;
    }
    const { data, error, status } = await supabase
      .from('subject_sections')
      .select('id, subject_id, title, type, order, is_locked, created_at, updated_at') // Removed 'description'
      .eq('id', sectionId)
      .maybeSingle();

    if (error) {
      console.error(`[examService] Supabase error fetching section ${sectionId}. Status: ${status}`);
      console.error(`  Message: ${error.message}`);
      console.error(`  Details: ${error.details}`);
      console.error(`  Hint: ${error.hint}`);
      console.error(`  Code: ${error.code}`);
      let displayError = new Error(error.message || `Failed to fetch section ${sectionId}. Supabase code: ${error.code || 'N/A'}`);
      if (status === 0 && error.message && error.message.toLowerCase().includes('failed to fetch')) {
          displayError = new Error(
              `Failed to fetch section ${sectionId}. This is often a network or CORS issue. ` +
              `Ensure your Supabase project allows requests from this application's origin (${typeof window !== 'undefined' ? window.location.origin : 'UNKNOWN_ORIGIN'}). ` +
              `Original Supabase error: ${error.message} (Status: ${status}, Code: ${error.code || 'N/A'})`
          );
      }
      throw displayError;
    }
    return data ? data as SubjectSection : null;
  } catch (e: any) {
    console.error(`[examService] General catch block in getSectionById for section ${sectionId}. Raw error:`, e);
    if (e instanceof Error && e.message.startsWith("Failed to fetch section")) {
        throw e;
    }
    if (e instanceof TypeError && e.message.toLowerCase().includes('failed to fetch')) {
        throw new Error(
            `Network error: Failed to fetch section ${sectionId}. Please check your internet connection and Supabase CORS settings. ` +
            `Ensure Supabase allows requests from origin: ${typeof window !== 'undefined' ? window.location.origin : 'UNKNOWN_ORIGIN'}. Original error: ${e.message}`
        );
    }
    throw new Error(e.message || `An unexpected error occurred while fetching section ${sectionId}.`);
  }
};

export const getSectionLessons = async (sectionId: string): Promise<Lesson[]> => {
  console.log(`[examService] Initiating getSectionLessons for section_id: ${sectionId}`);
  if (!supabase) {
    console.error("[examService] Supabase client is not initialized in getSectionLessons!");
    throw new Error("Supabase client is not initialized. Cannot fetch lessons.");
  }
  // console.log(`[examService] Supabase URL being used by client for getSectionLessons: ${supabase.supabaseUrl}`);

  try {
    if (!sectionId) {
      console.warn("[examService] getSectionLessons called with no sectionId. Returning empty array.");
      return [];
    }
    console.log(`[examService] Querying Supabase 'lessons' for section_id: ${sectionId}`);
    const { data, error, status } = await supabase
      .from('lessons')
      .select('id, section_id, subject_id, title, content, notes, video_url, teachers, files, "order", teacher_id, teacher_name, linked_exam_ids, is_locked, is_used, created_at, updated_at, used_at, used_by_user_id')
      .eq('section_id', sectionId)
      .order('order', { ascending: true, nullsFirst: false })
      .order('title', { ascending: true });

    if (error) {
      console.error(`[examService] Supabase error returned from 'lessons' query for section ${sectionId}.`);
      console.error(`  Status: ${status}`);
      console.error(`  Message: ${error.message}`);
      console.error(`  Details: ${error.details}`);
      console.error(`  Hint: ${error.hint}`);
      console.error(`  Code: ${error.code}`);
      
      let displayError = new Error(error.message || `Failed to fetch lessons for section ${sectionId}. Supabase code: ${error.code || 'N/A'}`);
      if (status === 0 && error.message && error.message.toLowerCase().includes('failed to fetch')) {
          displayError = new Error(
              `Failed to fetch lessons for section ${sectionId}. This is often a network or CORS issue. ` +
              `Ensure your Supabase project allows requests from this application's origin (${typeof window !== 'undefined' ? window.location.origin : 'UNKNOWN_ORIGIN'}). ` +
              `Original Supabase error: ${error.message} (Status: ${status}, Code: ${error.code || 'N/A'})`
          );
      }
      throw displayError;
    }

    console.log(`[examService] Successfully fetched ${data?.length || 0} lessons for section_id: ${sectionId}`);
    return (data || []).map(item => ({
      ...item,
      teachers: (item.teachers || []) as LessonTeacher[],
      files: (item.files || []) as LessonFile[],
      linked_exam_ids: (item.linked_exam_ids || []) as string[],
    })) as Lesson[];
  } catch (e: any) {
    console.error(`[examService] General catch block in getSectionLessons for section ${sectionId}. Raw error:`, e);
    if (e instanceof Error && e.message.startsWith("Failed to fetch lessons for section")) {
        throw e;
    }
     if (e instanceof TypeError && e.message.toLowerCase().includes('failed to fetch')) {
        throw new Error(
            `Network error: Failed to fetch lessons for section ${sectionId}. Please check your internet connection and Supabase CORS settings. ` +
            `Ensure Supabase allows requests from origin: ${typeof window !== 'undefined' ? window.location.origin : 'UNKNOWN_ORIGIN'}. Original error: ${e.message}`
        );
    }
    throw new Error(e.message || `An unexpected error occurred while fetching lessons for section ${sectionId}.`);
  }
};

export const getLessonById = async (lessonId: string): Promise<Lesson | null> => {
  console.log(`[examService] getLessonById called for ID: ${lessonId}`);
  try {
    if (!lessonId) {
      console.warn("[examService] getLessonById called with no lessonId. Returning null.");
      return null;
    }
    const { data, error, status } = await supabase
      .from('lessons')
      .select('id, section_id, subject_id, title, content, notes, video_url, teachers, files, "order", teacher_id, teacher_name, linked_exam_ids, is_locked, is_used, created_at, updated_at, used_at, used_by_user_id')
      .eq('id', lessonId)
      .maybeSingle();

    if (error && status !== 406) { 
      console.error(`[examService] Supabase error fetching lesson ${lessonId}. Status: ${status}`);
      console.error(`  Message: ${error.message}`);
      console.error(`  Details: ${error.details}`);
      console.error(`  Hint: ${error.hint}`);
      console.error(`  Code: ${error.code}`);
      let displayError = new Error(error.message || `Failed to fetch lesson ${lessonId}. Supabase code: ${error.code || 'N/A'}`);
      if (status === 0 && error.message && error.message.toLowerCase().includes('failed to fetch')) {
          displayError = new Error(
              `Failed to fetch lesson ${lessonId}. This is often a network or CORS issue. ` +
              `Ensure your Supabase project allows requests from this application's origin (${typeof window !== 'undefined' ? window.location.origin : 'UNKNOWN_ORIGIN'}). ` +
              `Original Supabase error: ${error.message} (Status: ${status}, Code: ${error.code || 'N/A'})`
          );
      }
      throw displayError;
    }
    
    if (!data) {
        console.log(`[examService] No lesson found with id: ${lessonId}`);
        return null;
    }

    return {
      ...data,
      teachers: (data.teachers || []) as LessonTeacher[],
      files: (data.files || []) as LessonFile[],
      linked_exam_ids: (data.linked_exam_ids || []) as string[], 
    } as Lesson;
  } catch (e: any) {
    console.error(`[examService] General catch block in getLessonById for lesson ${lessonId}. Raw error:`, e);
    if (e instanceof Error && e.message.startsWith("Failed to fetch lesson")) {
        throw e;
    }
    if (e instanceof TypeError && e.message.toLowerCase().includes('failed to fetch')) {
        throw new Error(
            `Network error: Failed to fetch lesson ${lessonId}. Please check your internet connection and Supabase CORS settings. ` +
            `Ensure Supabase allows requests from origin: ${typeof window !== 'undefined' ? window.location.origin : 'UNKNOWN_ORIGIN'}. Original error: ${e.message}`
        );
    }
    throw new Error(e.message || `An unexpected error occurred while fetching lesson ${lessonId}.`);
  }
};
    
