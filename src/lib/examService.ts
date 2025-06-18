
'use client';

import { supabase } from '@/lib/supabaseClient';
import type { Exam, Question, QuestionOption, AiAnalysisResult, Subject, SubjectSection, Lesson, LessonTeacher, LessonFile, ExamQuestion } from './types';
import { getUserProfile, saveUserProfile } from './userProfileService';

/**
 * Fetches all published exams, with optional filtering by subjectId and teacherId.
 */
export const getPublicExams = async (filters?: { subjectId?: string; teacherId?: string }): Promise<Exam[]> => {
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

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching public exams from Supabase: ", error);
      throw error;
    }
    
    const exams = (data || []).map(exam => ({
      ...exam,
      subjectName: exam.subjects?.name || 'غير محدد',
      durationInMinutes: exam.duration, // Map DB 'duration' to 'durationInMinutes' for type consistency
      // totalQuestions will need to be fetched separately or calculated if not denormalized
      // For now, we can fetch it per exam
    }));

    // Optionally, fetch totalQuestions for each exam
    for (const exam of exams) {
        const { count, error: countError } = await supabase
            .from('exam_questions')
            .select('question_id', { count: 'exact', head: true })
            .eq('exam_id', exam.id);
        if (countError) {
            console.warn(`Could not fetch question count for exam ${exam.id}:`, countError.message);
            exam.totalQuestions = 0;
        } else {
            exam.totalQuestions = count ?? 0;
        }
    }
    return exams as Exam[];

  } catch (error) {
    console.error("Error in getPublicExams (Supabase): ", error);
    throw error;
  }
};

/**
 * Fetches multiple questions by their IDs from the 'questions' table.
 */
export const getQuestionsByIds = async (questionIds: string[]): Promise<Question[]> => {
  if (!questionIds || questionIds.length === 0) {
    return [];
  }
  try {
    const { data, error } = await supabase
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
      console.error("Error fetching questions by IDs from Supabase: ", error);
      throw error;
    }
    return (data || []).map(q => ({
        ...q,
        subjectName: q.subjects?.name, // Correctly access nested subject name
        options: q.options as QuestionOption[] || [], // Ensure options is an array
        explanation: q.model_answer // Map model_answer to explanation for compatibility if needed
    })) as Question[];
  } catch (error) {
    console.error("Error in getQuestionsByIds (Supabase): ", error);
    throw error;
  }
};

/**
 * Fetches a single exam by its ID, and resolves its questions.
 */
export const getExamById = async (examId: string): Promise<Exam | null> => {
  try {
    const { data: examData, error: examError } = await supabase
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
      console.error(`Error fetching exam ${examId} from Supabase: `, examError);
      throw examError;
    }
    if (!examData) {
      return null;
    }

    const { data: examQuestionsLinks, error: linksError } = await supabase
      .from('exam_questions')
      .select('question_id, order_number, points')
      .eq('exam_id', examId)
      .order('order_number', { ascending: true, nullsFirst: false });

    if (linksError) {
      console.error(`Error fetching question links for exam ${examId}: `, linksError);
      throw linksError;
    }

    const questionIds = (examQuestionsLinks || []).map(link => link.question_id);
    let fetchedQuestions: Question[] = [];
    if (questionIds.length > 0) {
      fetchedQuestions = await getQuestionsByIds(questionIds);
      // Map points and order from exam_questions to the fetched questions
      fetchedQuestions = fetchedQuestions.map(q => {
        const link = examQuestionsLinks?.find(l => l.question_id === q.id);
        return { 
          ...q, 
          points: link?.points ?? 1, 
          // order_number: link?.order_number // If you add order_number to Question type
        };
      }).sort((a: any, b: any) => (a.order_number ?? Infinity) - (b.order_number ?? Infinity)); // Sort if order_number is used
    }
    
    return {
      ...examData,
      subjectName: examData.subjects?.name || 'غير محدد',
      questions: fetchedQuestions,
      totalQuestions: fetchedQuestions.length,
      durationInMinutes: examData.duration // Map to legacy type field
    } as Exam;

  } catch (error) {
    console.error(`Error in getExamById (${examId}) (Supabase): `, error);
    throw error;
  }
};


/**
 * Fetches multiple exams by their IDs.
 */
export const getExamsByIds = async (examIds: string[]): Promise<Exam[]> => {
  if (!examIds || examIds.length === 0) {
    return [];
  }
  try {
    const { data, error } = await supabase
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
      console.error("Error fetching exams by IDs from Supabase: ", error);
      throw error;
    }
    
    const exams = (data || []).map(exam => ({
      ...exam,
      subjectName: exam.subjects?.name || 'غير محدد',
      durationInMinutes: exam.duration,
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

  } catch (error) {
    console.error("Error in getExamsByIds (Supabase): ", error);
    throw error;
  }
};


/**
 * Fetches questions for a specific subject (for practice mode).
 */
export const getQuestionsBySubject = async (subjectId: string, questionLimit: number = 20): Promise<Question[]> => {
   try {
    const { data, error } = await supabase
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
      // .eq('is_locked', false) // RLS should handle this
      .limit(questionLimit); 

    if (error) {
      console.error(`Error fetching questions for subject ${subjectId} from Supabase: `, error);
      throw error;
    }
    return (data || []).map(q => ({
        ...q,
        subjectName: q.subjects?.name || 'غير محدد',
        options: q.options as QuestionOption[] || [],
        explanation: q.model_answer
    })) as Question[];
  } catch (error) {
    console.error("Error in getQuestionsBySubject (Supabase): ", error);
    throw error;
  }
};

export const saveExamAttempt = async (attemptData: {
  userId: string;
  examId?: string; // UUID
  subjectId?: string; // UUID
  examType: 'general_exam' | 'subject_practice';
  score: number;
  correctAnswersCount: number;
  totalQuestionsAttempted: number;
  answers: Array<{ questionId: string; selectedOptionId: string | null; isCorrect: boolean }>; // questionId is UUID, selectedOptionId from JSONB
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
        answers: restOfAttemptData.answers, 
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
        updated_at: new Date().toISOString(),
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

export const saveAiAnalysis = async (analysisData: Omit<AiAnalysisResult, 'id' | 'analyzedAt'>): Promise<string> => {
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

export const getSubjectSections = async (subjectId: string): Promise<SubjectSection[]> => {
  console.log(`[examService] Attempting to fetch sections for subject_id: ${subjectId}`);
  try {
    if (!subjectId) {
      console.warn("[examService] getSubjectSections called with no subjectId. Returning empty array.");
      return [];
    }
    const { data, error, status } = await supabase
      .from('subject_sections')
      .select('id, subject_id, title, type, order, is_locked, created_at, updated_at')
      .eq('subject_id', subjectId)
      .order('order', { ascending: true, nullsFirst: false })
      .order('title', { ascending: true });

    if (error) {
      console.error(`[examService] Supabase error fetching sections for subject ${subjectId}. Status: ${status}.`);
      console.error(`[examService] Error Message: ${error.message}`);
      console.error(`[examService] Error Details: ${error.details}`);
      console.error(`[examService] Error Hint: ${error.hint}`);
      console.error(`[examService] Error Code: ${error.code}`);
      throw new Error(`Supabase error (Code: ${error.code || 'UNKNOWN'}, Status: ${status}): ${error.message || 'Failed to fetch subject sections.'}`);
    }

    console.log(`[examService] Successfully fetched ${data?.length || 0} sections for subject_id: ${subjectId}`);
    return (data || []) as SubjectSection[];
  } catch (e: any) {
    console.error(`[examService] Catch block in getSubjectSections for subject ${subjectId}:`, e.message || e);
    throw new Error(e.message || `An unexpected error occurred while fetching sections for subject ${subjectId}.`);
  }
};

export const getSectionById = async (sectionId: string): Promise<SubjectSection | null> => {
   try {
    if (!sectionId) {
      console.warn("getSectionById called with missing sectionId. Returning null.");
      return null;
    }
    const { data, error } = await supabase
      .from('subject_sections')
      .select('id, subject_id, title, type, order, is_locked, created_at, updated_at')
      .eq('id', sectionId)
      .maybeSingle();

    if (error) {
      console.error(`Error fetching section ${sectionId} from Supabase: `, error);
      throw error;
    }
    return data ? data as SubjectSection : null;
  } catch (error) {
    console.error("Error in getSectionById (Supabase): ", error);
    throw error;
  }
};

export const getSectionLessons = async (sectionId: string): Promise<Lesson[]> => {
  console.log(`[examService] Attempting to fetch lessons for section_id: ${sectionId}`);
  try {
    if (!sectionId) {
      console.warn("[examService] getSectionLessons called with no sectionId. Returning empty array.");
      return [];
    }
    const { data, error, status } = await supabase
      .from('lessons')
      .select('id, section_id, subject_id, title, content, notes, video_url, teachers, files, "order", teacher_id, teacher_name, linked_exam_ids, is_locked, is_used, created_at, updated_at, used_at, used_by_user_id')
      .eq('section_id', sectionId)
      .order('order', { ascending: true, nullsFirst: false })
      .order('title', { ascending: true });

    if (error) {
      console.error(`[examService] Supabase error fetching lessons for section ${sectionId}. Status: ${status}.`);
      console.error(`[examService] Error Message: ${error.message}`);
      console.error(`[examService] Error Details: ${error.details}`);
      console.error(`[examService] Error Hint: ${error.hint}`);
      console.error(`[examService] Error Code: ${error.code}`);
      throw new Error(`Supabase error (Code: ${error.code || 'UNKNOWN'}, Status: ${status}): ${error.message || 'Failed to fetch lessons.'}`);
    }

    console.log(`[examService] Successfully fetched ${data?.length || 0} lessons for section_id: ${sectionId}`);
    return (data || []).map(item => ({
      ...item,
      teachers: (item.teachers || []) as LessonTeacher[],
      files: (item.files || []) as LessonFile[],
      linked_exam_ids: (item.linked_exam_ids || []) as string[],
    })) as Lesson[];
  } catch (e: any) {
    console.error(`[examService] Catch block in getSectionLessons for section ${sectionId}:`, e.message || e);
    throw new Error(e.message || `An unexpected error occurred while fetching lessons for section ${sectionId}.`);
  }
};

export const getLessonById = async (lessonId: string): Promise<Lesson | null> => {
  console.log(`[examService] Attempting to fetch lesson by id: ${lessonId}`);
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
      console.error(`[examService] Supabase error fetching lesson ${lessonId}. Status: ${status}.`);
      console.error(`[examService] Error Message: ${error.message}`);
      throw new Error(`Supabase error (Code: ${error.code || 'UNKNOWN'}, Status: ${status}): ${error.message || 'Failed to fetch lesson.'}`);
    }
    
    if (!data) {
        console.log(`[examService] No lesson found with id: ${lessonId}`);
        return null;
    }

    console.log(`[examService] Successfully fetched lesson with id: ${lessonId}`);
    return {
      ...data,
      teachers: (data.teachers || []) as LessonTeacher[],
      files: (data.files || []) as LessonFile[],
      linked_exam_ids: (data.linked_exam_ids || []) as string[], // Ensure this is treated as string[]
    } as Lesson;
  } catch (e: any) {
    console.error(`[examService] Catch block in getLessonById for lesson ${lessonId}:`, e.message || e);
    throw new Error(e.message || `An unexpected error occurred while fetching lesson ${lessonId}.`);
  }
};

