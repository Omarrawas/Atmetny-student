
'use client';

// TODO: Migrate ALL Firestore operations in this file to Supabase.
// This file currently still uses Firebase for most data fetching.
// Only saveExamAttempt and saveAiAnalysis have been (partially) adapted for Supabase.

import { collection, query, where, getDocs, doc, getDoc, orderBy, limit, Timestamp, serverTimestamp, updateDoc, collectionGroup, documentId, setDoc, type QueryConstraint } from 'firebase/firestore';
import { db } from './firebase'; // Original Firebase db
import { supabase } from '@/lib/supabaseClient'; // Supabase client for new/migrated functions
import type { Exam, Question, QuestionOption, AiAnalysisResult, Subject, SubjectSection, Lesson, LessonFile, LessonTeacher, SubjectBranch, UserProfileWriteData } from './types'; 
import { getUserProfile, saveUserProfile } from './userProfileService'; // Supabase version of userProfileService

const MAX_IDS_PER_IN_QUERY = 30; // Firestore 'in' query limit (still relevant if parts remain Firebase)

/**
 * Fetches all published exams, with optional filtering by subjectId and teacherId.
 * TODO: Migrate to Supabase.
 */
export const getPublicExams = async (filters?: { subjectId?: string; teacherId?: string }): Promise<Exam[]> => {
  console.warn("getPublicExams is still using Firebase. Needs migration to Supabase.");
  try {
    const examsCollectionRef = collection(db, 'exams');
    const queryConstraints: QueryConstraint[] = [where('published', '==', true)];
    const appliedQueryParts: string[] = ["published == true"];

    if (filters?.subjectId && filters.subjectId !== 'all' && filters.subjectId !== '') {
      queryConstraints.push(where('subjectId', '==', filters.subjectId));
      appliedQueryParts.push(`subjectId == '${filters.subjectId}'`);
    }
    if (filters?.teacherId && filters.teacherId !== 'all' && filters.teacherId !== '') {
      queryConstraints.push(where('teacherId', '==', filters.teacherId));
      appliedQueryParts.push(`teacherId == '${filters.teacherId}'`);
    }
    queryConstraints.push(orderBy('createdAt', 'desc')); // createdAt is a Timestamp field in Firebase
    appliedQueryParts.push("orderBy createdAt desc");
    
    console.log("Firestore query parts for getPublicExams:", appliedQueryParts.join(", "));


    const q = query(examsCollectionRef, ...queryConstraints);
    const querySnapshot = await getDocs(q);

    const rawExamsData = querySnapshot.docs.map(docSnap => ({
      id: docSnap.id,
      data: docSnap.data(),
    }));

    // Dynamic subject name resolution (assuming subjects collection is also in Firestore)
    const allSubjectIds = new Set<string>();
    rawExamsData.forEach(item => {
      if (item.data.subjectId) {
        allSubjectIds.add(item.data.subjectId);
      }
    });

    const subjectNamesMap = new Map<string, string>();
    if (allSubjectIds.size > 0) {
      const subjectIdChunks: string[][] = [];
      const idsArray = Array.from(allSubjectIds);
      for (let i = 0; i < idsArray.length; i += MAX_IDS_PER_IN_QUERY) {
        subjectIdChunks.push(idsArray.slice(i, i + MAX_IDS_PER_IN_QUERY));
      }

      const subjectsCollectionRef = collection(db, 'subjects');
      for (const chunk of subjectIdChunks) {
        if (chunk.length === 0) continue;
        const subjectQuery = query(subjectsCollectionRef, where(documentId(), 'in', chunk));
        const subjectSnapshot = await getDocs(subjectQuery);
        subjectSnapshot.forEach(subjectDoc => {
          if (subjectDoc.exists() && subjectDoc.data().name) {
            subjectNamesMap.set(subjectDoc.id, subjectDoc.data().name);
          }
        });
      }
    }

    const exams: Exam[] = rawExamsData.map(item => {
      const data = item.data;
      let currentSubjectName = data.subjectName; 

      if (data.subjectId && subjectNamesMap.has(data.subjectId)) {
        const lookedUpName = subjectNamesMap.get(data.subjectId);
        if (lookedUpName && lookedUpName.trim() !== "") {
          currentSubjectName = lookedUpName;
        }
      }
      
      const isPlaceholderOrEmpty = !currentSubjectName ||
                                   currentSubjectName.trim() === "" ||
                                   ["مادة غير معروفة", "unknown"].some(p => currentSubjectName.toLowerCase().includes(p.toLowerCase()));

      if (isPlaceholderOrEmpty) {
        currentSubjectName = "مادة غير معروفة";
      }

      return {
        id: item.id,
        title: data.title || "اختبار بدون عنوان",
        subjectId: data.subjectId || "unknown",
        subjectName: currentSubjectName,
        durationInMinutes: data.durationInMinutes as number | undefined,
        totalQuestions: data.totalQuestions || (data.questionIds && Array.isArray(data.questionIds) ? data.questionIds.length : 0),
        published: data.published || false,
        image: data.image,
        imageHint: data.imageHint,
        description: data.description,
        teacherId: data.teacherId,
        teacherName: data.teacherName,
        createdAt: (data.createdAt as Timestamp)?.toDate().toISOString(), // Convert to ISO string
        updatedAt: (data.updatedAt as Timestamp)?.toDate().toISOString(), // Convert to ISO string
        questionIds: data.questionIds as string[] || [],
      };
    });

    return exams;
  } catch (error) {
    console.error("Error fetching public exams (Firebase): ", error);
    throw error;
  }
};

/**
 * Fetches multiple questions by their IDs from the central 'questions' collection.
 * TODO: Migrate to Supabase.
 */
export const getQuestionsByIds = async (questionIds: string[]): Promise<Question[]> => {
  console.warn("getQuestionsByIds is still using Firebase. Needs migration to Supabase.");
  if (!questionIds || questionIds.length === 0) {
    return [];
  }

  const allFetchedQuestions: Question[] = [];
  const idChunks: string[][] = [];

  for (let i = 0; i < questionIds.length; i += MAX_IDS_PER_IN_QUERY) {
    idChunks.push(questionIds.slice(i, i + MAX_IDS_PER_IN_QUERY));
  }
  
  if (questionIds.length > MAX_IDS_PER_IN_QUERY) {
    console.warn(`Fetching ${questionIds.length} questions, which exceeds the Firestore 'in' query limit per query. This will be done in ${idChunks.length} batches.`);
  }

  try {
    const questionsCollectionRef = collection(db, 'questions');
    for (const chunk of idChunks) {
        if (chunk.length === 0) continue;
        const q = query(questionsCollectionRef, where(documentId(), 'in', chunk));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((docSnap) => {
        const qData = docSnap.data();
        const sanitizedOptions = (qData.options as any[] || []).map((opt: any, optIndex: number): QuestionOption => ({
            id: opt.id || `opt-${docSnap.id}-${optIndex}`, 
            text: opt.text || `خيار ${optIndex + 1}`
        }));
        allFetchedQuestions.push({
            id: docSnap.id,
            questionText: qData.questionText || "نص السؤال مفقود",
            options: sanitizedOptions,
            correctOptionId: qData.correctOptionId || null,
            subjectId: qData.subjectId || 'unknown',
            subjectName: qData.subjectName || 'Unknown Subject',
            explanation: qData.explanation || '',
            points: qData.points ?? 1,
            topic: qData.topic || '',
            difficulty: qData.difficulty as Question['difficulty'] || 'medium',
            tags: qData.tags || [],
            createdBy: qData.createdBy || '',
        });
        });
    }
    const orderedQuestions = questionIds.map(id => allFetchedQuestions.find(q => q.id === id)).filter(q => q !== undefined) as Question[];
    return orderedQuestions;

  } catch (error) {
    console.error(`Error fetching questions by IDs (Firebase): `, error);
    throw error;
  }
};


/**
 * Fetches a single exam by its ID, and resolves its questions using `questionIds`.
 * TODO: Migrate to Supabase.
 */
export const getExamById = async (examId: string): Promise<Exam | null> => {
  console.warn(`getExamById (${examId}) is still using Firebase. Needs migration to Supabase.`);
  try {
    const examDocRef = doc(db, 'exams', examId);
    const examDocSnap = await getDoc(examDocRef);

    if (!examDocSnap.exists()) {
      console.warn(`Exam with ID ${examId} not found (Firebase).`);
      return null;
    }

    const examData = examDocSnap.data();
    let resolvedQuestions: Question[] = [];

    if (examData.questionIds && Array.isArray(examData.questionIds) && examData.questionIds.length > 0) {
      resolvedQuestions = await getQuestionsByIds(examData.questionIds as string[]); // This also needs migration
    }

    let resolvedSubjectName = examData.subjectName; 
    const subjectId = examData.subjectId;

    if (subjectId) {
        const isPlaceholderOrEmpty = !resolvedSubjectName?.trim() ||
                                     resolvedSubjectName.trim() === "" ||
                                     ["مادة غير معروفة", "unknown"].some(p => resolvedSubjectName!.toLowerCase().includes(p.toLowerCase()));
        if (isPlaceholderOrEmpty) {
            console.log(`Subject name for exam ${examId} is '${resolvedSubjectName}'. Attempting dynamic lookup using subjectId: ${subjectId} (Firebase)`);
            const subjectDetails = await getSubjectById(subjectId); // This also needs migration
            if (subjectDetails && subjectDetails.name?.trim()) {
                resolvedSubjectName = subjectDetails.name;
            }
        }
    }
    
    if (!resolvedSubjectName?.trim() || 
        resolvedSubjectName.trim() === "" || 
        ["مادة غير معروفة", "unknown"].some(p => resolvedSubjectName!.toLowerCase().includes(p.toLowerCase()))) {
        resolvedSubjectName = "مادة غير معروفة";
    }


    return {
      id: examDocSnap.id,
      title: examData.title || "اختبار بدون عنوان",
      subjectId: examData.subjectId || "unknown",
      subjectName: resolvedSubjectName,
      durationInMinutes: examData.durationInMinutes as number | undefined,
      totalQuestions: examData.totalQuestions || resolvedQuestions.length || (examData.questionIds ? examData.questionIds.length : 0),
      published: examData.published || false,
      image: examData.image,
      imageHint: examData.imageHint,
      description: examData.description || "",
      teacherId: examData.teacherId,
      teacherName: examData.teacherName,
      createdAt: (examData.createdAt as Timestamp)?.toDate().toISOString(),
      updatedAt: (examData.updatedAt as Timestamp)?.toDate().toISOString(),
      questionIds: examData.questionIds as string[] || [],
      questions: resolvedQuestions 
    };
  } catch (error) {
    console.error(`Error fetching exam with ID ${examId} (Firebase): `, error);
    throw error;
  }
};


/**
 * Fetches multiple exams by their IDs.
 * TODO: Migrate to Supabase.
 */
export const getExamsByIds = async (examIds: string[]): Promise<Exam[]> => {
  console.warn("getExamsByIds is still using Firebase. Needs migration to Supabase.");
  if (!examIds || examIds.length === 0) {
    return [];
  }
  
  const rawExamsData: { id: string; data: any }[] = [];
  const idChunks: string[][] = [];

  for (let i = 0; i < examIds.length; i += MAX_IDS_PER_IN_QUERY) {
    idChunks.push(examIds.slice(i, i + MAX_IDS_PER_IN_QUERY));
  }

  try {
    const examsCollectionRef = collection(db, 'exams');
    for (const chunk of idChunks) {
        if (chunk.length === 0) continue;
        const q = query(examsCollectionRef, where(documentId(), 'in', chunk));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((docSnap) => {
            rawExamsData.push({ id: docSnap.id, data: docSnap.data() });
        });
    }

    // Subject name resolution (assuming subjects are in Firestore)
    const allSubjectIds = new Set<string>();
    rawExamsData.forEach(item => { if (item.data.subjectId) allSubjectIds.add(item.data.subjectId); });
    const subjectNamesMap = new Map<string, string>();
    if (allSubjectIds.size > 0) { /* ... Firestore subject name lookup ... */ } 
    
    const resolvedExams = rawExamsData.map(item => {
        const data = item.data;
        // ... (subject name resolution logic as in getPublicExams) ...
        let currentSubjectName = data.subjectName || "مادة غير معروفة"; // Simplified

        return {
            id: item.id,
            title: data.title || "اختبار بدون عنوان",
            subjectId: data.subjectId || "unknown",
            subjectName: currentSubjectName,
            durationInMinutes: data.durationInMinutes as number | undefined,
            totalQuestions: data.totalQuestions || (data.questionIds && Array.isArray(data.questionIds) ? data.questionIds.length : 0),
            published: data.published || false, 
            image: data.image,
            imageHint: data.imageHint,
            description: data.description || "",
            teacherId: data.teacherId,
            teacherName: data.teacherName,
            createdAt: (data.createdAt as Timestamp)?.toDate().toISOString(),
            updatedAt: (data.updatedAt as Timestamp)?.toDate().toISOString(),
            questionIds: data.questionIds as string[] || [],
        };
    });
    const orderedExams = examIds.map(id => resolvedExams.find(e => e.id === id)).filter(e => e !== undefined) as Exam[];
    return orderedExams;

  } catch (error) {
    console.error("Error fetching exams by IDs (Firebase): ", error);
    throw error;
  }
};


/**
 * Fetches questions for a specific subject.
 * TODO: Migrate to Supabase.
 */
export const getQuestionsBySubject = async (subjectId: string, questionLimit: number = 20): Promise<Question[]> => {
  console.warn(`getQuestionsBySubject (${subjectId}) is still using Firebase. Needs migration to Supabase.`);
  try {
    const questionsCollectionRef = collection(db, 'questions');
    const q = query(questionsCollectionRef, where('subjectId', '==', subjectId), limit(questionLimit));
    const querySnapshot = await getDocs(q);
    // ... (mapping logic remains similar, ensure types are consistent) ...
    return querySnapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as Question));
  } catch (error) {
    console.error(`Error fetching questions for subject ${subjectId} (Firebase): `, error);
    throw error;
  }
};

/**
 * Saves an exam attempt and updates user points (Using Supabase).
 */
export const saveExamAttempt = async (attemptData: {
  userId: string; // This will be Supabase auth user ID
  examId?: string; // Keep if you have a general exams table
  subjectId?: string; // For subject-specific practice
  examType: 'general_exam' | 'subject_practice';
  score: number;
  correctAnswersCount: number;
  totalQuestionsAttempted: number;
  answers: Array<{ questionId: string; selectedOptionId: string; isCorrect: boolean }>;
  startedAt: Date; // JS Date object
  completedAt: Date; // JS Date object
}): Promise<string> => {
  try {
    const { userId, startedAt, completedAt, ...restOfAttemptData } = attemptData;
    
    const { data: insertedAttempt, error: attemptError } = await supabase
      .from('user_exam_attempts') // Assuming table name
      .insert({
        user_id: userId,
        ...restOfAttemptData,
        started_at: startedAt.toISOString(),
        completed_at: completedAt.toISOString(),
        created_at: new Date().toISOString(), // Supabase typically uses `created_at`
      })
      .select()
      .single();

    if (attemptError) throw attemptError;
    if (!insertedAttempt) throw new Error("Failed to save exam attempt, no data returned.");

    // Update user points
    const userProfile = await getUserProfile(userId); // Supabase version
    if (userProfile) {
      const pointsPerCorrectAnswer = 10; 
      const pointsEarned = attemptData.correctAnswersCount * pointsPerCorrectAnswer;
      
      const currentPoints = userProfile.points || 0;
      const newTotalPoints = currentPoints + pointsEarned;
      
      await saveUserProfile({ // Supabase version
        id: userId, 
        points: newTotalPoints,
        updatedAt: new Date().toISOString(),
      }); 
      console.log(`User ${userId} earned ${pointsEarned} points. New total: ${newTotalPoints} (Supabase)`);
    } else {
      console.warn(`User profile not found for ID ${userId} (Supabase) while trying to update points.`);
    }

    return insertedAttempt.id; // Return ID of the inserted attempt record
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
      ...analysisData, // userId, inputExamResultsText, etc.
      user_id: analysisData.userId, // Ensure snake_case if that's your Supabase convention
      input_exam_results_text: analysisData.inputExamResultsText,
      input_student_goals_text: analysisData.inputStudentGoalsText,
      analyzed_at: new Date().toISOString(), 
    };
    // Remove original camelCase keys if Supabase table uses snake_case
    delete (dataToSave as any).userId;
    delete (dataToSave as any).inputExamResultsText;
    delete (dataToSave as any).inputStudentGoalsText;


    const { data: insertedAnalysis, error } = await supabase
      .from('ai_analyses') // Assuming table name
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
 * TODO: Migrate to Supabase.
 */
export const getSubjects = async (): Promise<Subject[]> => {
  console.warn("getSubjects is still using Firebase. Needs migration to Supabase.");
  try {
    const subjectsCollectionRef = collection(db, 'subjects');
    const q = query(subjectsCollectionRef, orderBy('name')); 
    const querySnapshot = await getDocs(q);
    // ... (mapping logic, ensure types are consistent for dates if any) ...
    return querySnapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as Subject));
  } catch (error) {
    console.error("Error fetching subjects from Firestore: ", error);
    throw error;
  }
};

/**
 * Fetches a single subject by its ID.
 * TODO: Migrate to Supabase.
 */
export const getSubjectById = async (subjectId: string): Promise<Subject | null> => {
  console.warn(`getSubjectById (${subjectId}) is still using Firebase. Needs migration to Supabase.`);
  try {
    const subjectDocRef = doc(db, 'subjects', subjectId);
    const subjectDocSnap = await getDoc(subjectDocRef);
    if (!subjectDocSnap.exists()) return null;
    return { id: subjectDocSnap.id, ...subjectDocSnap.data() } as Subject;
  } catch (error) {
    console.error(`Error fetching subject with ID ${subjectId} (Firebase): `, error);
    throw error;
  }
};

/**
 * Fetches all sections for a given subject.
 * TODO: Migrate to Supabase.
 */
export const getSubjectSections = async (subjectId: string): Promise<SubjectSection[]> => {
  console.warn(`getSubjectSections (${subjectId}) is still using Firebase. Needs migration to Supabase.`);
  try {
    const sectionsCollectionRef = collection(db, 'subjects', subjectId, 'sections');
    const q = query(sectionsCollectionRef, orderBy('order', 'asc')); 
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(docSnap => {
        const data = docSnap.data();
        return { 
            id: docSnap.id, 
            ...data,
            createdAt: (data.createdAt as Timestamp)?.toDate().toISOString(),
            updatedAt: (data.updatedAt as Timestamp)?.toDate().toISOString(),
            usedAt: (data.usedAt as Timestamp)?.toDate().toISOString() || null,
        } as SubjectSection;
    });
  } catch (error) {
    console.error(`Error fetching sections for subject ${subjectId} (Firebase): `, error);
    throw error;
  }
};

/**
 * Fetches a single section by its ID within a subject.
 * TODO: Migrate to Supabase.
 */
export const getSectionById = async (subjectId: string, sectionId: string): Promise<SubjectSection | null> => {
  console.warn(`getSectionById (${subjectId}/${sectionId}) is still using Firebase. Needs migration to Supabase.`);
  try {
    const sectionDocRef = doc(db, 'subjects', subjectId, 'sections', sectionId);
    const sectionDocSnap = await getDoc(sectionDocRef);
    if (!sectionDocSnap.exists()) return null;
    const data = sectionDocSnap.data();
    return { 
        id: sectionDocSnap.id, 
        ...data,
        createdAt: (data.createdAt as Timestamp)?.toDate().toISOString(),
        updatedAt: (data.updatedAt as Timestamp)?.toDate().toISOString(),
        usedAt: (data.usedAt as Timestamp)?.toDate().toISOString() || null,
    } as SubjectSection;
  } catch (error) {
    console.error(`Error fetching section ${sectionId} for subject ${subjectId} (Firebase): `, error);
    throw error;
  }
};


/**
 * Fetches all lessons for a given section within a subject.
 * TODO: Migrate to Supabase.
 */
export const getSectionLessons = async (subjectId: string, sectionId: string): Promise<Lesson[]> => {
  console.warn(`getSectionLessons (${subjectId}/${sectionId}) is still using Firebase. Needs migration to Supabase.`);
  try {
    const lessonsCollectionRef = collection(db, 'subjects', subjectId, 'sections', sectionId, 'lessons');
    const q = query(lessonsCollectionRef, orderBy('order', 'asc')); 
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(docSnap => {
        const data = docSnap.data();
        return { 
            id: docSnap.id, 
            ...data,
            createdAt: (data.createdAt as Timestamp)?.toDate().toISOString(),
            updatedAt: (data.updatedAt as Timestamp)?.toDate().toISOString(),
            usedAt: (data.usedAt as Timestamp)?.toDate().toISOString() || null,
        } as Lesson;
    });
  } catch (error) {
    console.error(`Error fetching lessons for section ${sectionId} in subject ${subjectId} (Firebase): `, error);
    throw error;
  }
};

/**
 * Fetches a single lesson by its ID within a section and subject.
 * TODO: Migrate to Supabase.
 */
export const getLessonById = async (subjectId: string, sectionId: string, lessonId: string): Promise<Lesson | null> => {
  console.warn(`getLessonById (${subjectId}/${sectionId}/${lessonId}) is still using Firebase. Needs migration to Supabase.`);
  try {
    const lessonDocRef = doc(db, 'subjects', subjectId, 'sections', sectionId, 'lessons', lessonId);
    const lessonDocSnap = await getDoc(lessonDocRef);
    if (!lessonDocSnap.exists()) return null;
    const data = lessonDocSnap.data();
    return { 
        id: lessonDocSnap.id, 
        ...data,
        createdAt: (data.createdAt as Timestamp)?.toDate().toISOString(),
        updatedAt: (data.updatedAt as Timestamp)?.toDate().toISOString(),
        usedAt: (data.usedAt as Timestamp)?.toDate().toISOString() || null,
    } as Lesson;
  } catch (error) {
    console.error(`Error fetching lesson ${lessonId} (Firebase): `, error);
    throw error;
  }
};
    
