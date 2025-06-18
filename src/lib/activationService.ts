
'use client';

import { supabase } from '@/lib/supabaseClient';
import type {
  ActivationCode,
  SubscriptionDetails,
  BackendCodeDetails,
  BackendCheckResult,
  BackendConfirmationPayload,
  BackendConfirmationResult,
} from './types';
import { saveUserProfile } from './userProfileService'; // Supabase version


export const getPlanNameFromType = (
    codeType: string,
    codeSubjectName?: string | null, 
    chosenSubjectName?: string | null 
): string => {
  if (chosenSubjectName) {
    return `اشتراك لمادة ${chosenSubjectName}`;
  }
  if (codeSubjectName) {
    return `اشتراك لمادة ${codeSubjectName}`;
  }

  if (codeType) {
    if (codeType.startsWith("general_")) {
      if (codeType === "general_monthly") return "اشتراك شهري عام";
      if (codeType === "general_quarterly") return "اشتراك ربع سنوي عام";
      if (codeType === "general_yearly") return "اشتراك سنوي عام";
    }
    if (codeType.startsWith("choose_single_subject_")) {
      // For these types, the subject name will be appended later or part of chosenSubjectName
      if (codeType === "choose_single_subject_monthly") return "اشتراك شهري لمادة واحدة";
      if (codeType === "choose_single_subject_quarterly") return "اشتراك ربع سنوي لمادة واحدة";
      if (codeType === "choose_single_subject_yearly") return "اشتراك سنوي لمادة واحدة";
    }
    // Fallback for other types or specific subject types like "specific_subject_math_monthly"
    const parts = codeType.replace(/_/g, ' ').split(' ');
    const capitalizedParts = parts.map(p => p.charAt(0).toUpperCase() + p.slice(1));
    return capitalizedParts.join(' ') || "اشتراك مخصص";
  }
  return "اشتراك مخصص";
};


export const checkCodeWithBackend = async (encodedValue: string): Promise<BackendCheckResult> => {
  console.log(`Checking code with Supabase: ${encodedValue}`);
  if (!encodedValue || encodedValue.trim() === "") {
    return { isValid: false, message: "الرجاء إدخال رمز التفعيل.", needsSubjectChoice: false };
  }

  try {
    const { data: codeData, error } = await supabase
      .from('activation_codes')
      .select('id, encoded_value, name, type, subject_id, subject_name, is_active, is_used, valid_from, valid_until')
      .eq('encoded_value', encodedValue.trim())
      .maybeSingle();

    if (error) {
      console.error("Supabase error checking code:", error);
      throw new Error(error.message || "حدث خطأ أثناء التحقق من الرمز.");
    }

    if (!codeData) {
      return { isValid: false, message: "رمز التفعيل غير موجود أو غير صحيح.", needsSubjectChoice: false };
    }

    const now = new Date();
    const validUntilDate = new Date(codeData.valid_until);
    const validFromDate = codeData.valid_from ? new Date(codeData.valid_from) : null;

    if (!codeData.is_active) {
      return { isValid: false, message: "رمز التفعيل هذا غير نشط حاليًا (قد يكون استخدم سابقًا أو تم إلغاؤه).", needsSubjectChoice: false };
    }
    if (codeData.is_used) {
      return { isValid: false, message: "رمز التفعيل هذا تم استخدامه مسبقاً.", needsSubjectChoice: false };
    }
    if (validFromDate && now < validFromDate) {
      const formattedValidFrom = validFromDate.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
      return { isValid: false, message: `رمز التفعيل هذا غير صالح للاستخدام قبل تاريخ ${formattedValidFrom}.`, needsSubjectChoice: false };
    }
    if (now > validUntilDate) {
      return { isValid: false, message: "صلاحية رمز التفعيل هذا قد انتهت.", needsSubjectChoice: false };
    }

    const codeDetailsForClient: BackendCodeDetails = {
      id: codeData.id, // UUID
      encodedValue: codeData.encoded_value,
      name: codeData.name,
      type: codeData.type,
      validUntil: codeData.valid_until, // ISO string
      subjectId: codeData.subject_id || null, // UUID
      subjectName: codeData.subject_name || null,
    };

    const needsSubjectChoice = codeData.type?.startsWith('choose_single_subject_') ?? false;

    return {
      isValid: true,
      message: needsSubjectChoice ? "الرمز صالح. يرجى اختيار المادة لتفعيل الاشتراك." : "الرمز صالح للتفعيل.",
      needsSubjectChoice,
      codeDetails: codeDetailsForClient,
    };

  } catch (error: any) {
    console.error("Error checking code with Supabase:", error);
    return { isValid: false, message: error.message || "حدث خطأ أثناء التحقق من الرمز.", needsSubjectChoice: false };
  }
};


export const confirmActivationWithBackend = async (payload: BackendConfirmationPayload): Promise<BackendConfirmationResult> => {
  const { userId, email, codeId, chosenSubjectId, chosenSubjectName } = payload;

  if (!userId || !email || !codeId) {
    return { success: false, message: "بيانات التفعيل الأساسية غير مكتملة (المستخدم، الرمز)." };
  }

  try {
    // 1. Fetch the code again to ensure it's still valid
    const { data: codeData, error: fetchError } = await supabase
      .from('activation_codes')
      .select('*') // Select all columns needed
      .eq('id', codeId) // codeId is UUID
      .single();

    if (fetchError || !codeData) {
      throw new Error(fetchError?.message || "رمز التفعيل المحدد غير موجود أو تعذر الوصول إليه.");
    }

    if (!codeData.is_active) throw new Error("رمز التفعيل هذا غير نشط حاليًا.");
    if (codeData.is_used) throw new Error("رمز التفعيل هذا تم استخدامه مسبقاً.");
    
    const now = new Date();
    const codeValidUntilDate = new Date(codeData.valid_until);
    if (now > codeValidUntilDate) throw new Error("صلاحية رمز التفعيل هذا قد انتهت.");
    
    if (codeData.type.startsWith("choose_single_subject_") && (!chosenSubjectId || !chosenSubjectName)) {
        throw new Error("لم يتم اختيار المادة للاشتراك الفردي المحدد بالرمز.");
    }

    // 2. Update Activation Code in Supabase
    const codeUpdatePayload: Partial<ActivationCode> & { used_by_user_id?: string, used_at?: string, used_for_subject_id?: string | null, updated_at: string } = {
      is_active: false,
      is_used: true,
      used_by_user_id: userId, // UUID
      used_at: now.toISOString(),
      updated_at: now.toISOString(),
    };

    // If it's a 'choose_single_subject_*' type code, store the chosen subject's NAME in used_for_subject_id (TEXT)
    if (codeData.type.startsWith("choose_single_subject_") && chosenSubjectName) {
      codeUpdatePayload.used_for_subject_id = chosenSubjectName;
    }
    
    const { error: updateCodeError } = await supabase
      .from('activation_codes')
      .update(codeUpdatePayload)
      .eq('id', codeId); // UUID

    if (updateCodeError) {
      console.error("Supabase error updating activation code:", updateCodeError);
      throw new Error("فشل تحديث حالة رمز التفعيل.");
    }

    // 3. Prepare and Update User Profile (activeSubscription) in Supabase
    const planName = getPlanNameFromType(
      codeData.type,
      codeData.subject_name, // Name of pre-linked subject (if any)
      chosenSubjectName // Name of CHOSEN subject (if any)
    );
    const subscriptionEndDateISO = codeData.valid_until; // This is already an ISO string

    // Determine final subjectId (UUID) and subjectName (TEXT) for the subscription
    let finalSubscriptionSubjectId: string | null = null;
    let finalSubscriptionSubjectName: string | null = null;

    if (codeData.type.startsWith("choose_single_subject_")) {
        finalSubscriptionSubjectId = chosenSubjectId || null; // UUID
        finalSubscriptionSubjectName = chosenSubjectName || null;
    } else if (codeData.subject_id) { // If code is pre-linked to a subject
        finalSubscriptionSubjectId = codeData.subject_id; // UUID
        finalSubscriptionSubjectName = codeData.subject_name;
    }
    // If it's a general plan, finalSubscriptionSubjectId and finalSubscriptionSubjectName will remain null.


    const newSubscription: SubscriptionDetails = {
      planId: codeData.type, // Store the original code type as planId
      planName: planName,
      startDate: now.toISOString(),
      endDate: subscriptionEndDateISO,
      status: 'active',
      activationCodeId: codeId, // UUID
      subjectId: finalSubscriptionSubjectId, // UUID or null
      subjectName: finalSubscriptionSubjectName, // TEXT or null
    };
    
    await saveUserProfile({
      id: userId, // Supabase user ID (UUID)
      email: email, 
      activeSubscription: newSubscription,
      updatedAt: now.toISOString()
    });


    // 4. Log Activation in Supabase
    const { error: logError } = await supabase
      .from('activation_logs')
      .insert({
        user_id: userId, // UUID
        code_id: codeId, // UUID
        subject_id: finalSubscriptionSubjectId, // UUID of the subject the subscription is for (if any)
        email: email, 
        code_type: codeData.type, 
        plan_name: planName,
        activated_at: now.toISOString(), 
      });

    if (logError) {
      console.error("Supabase error logging activation:", logError);
      // Log this error but don't necessarily fail the whole activation if user profile and code updated
    }

    let successMessage = `تم تفعيل اشتراكك "${planName}" بنجاح!`;
    const subEndDateForMessage = new Date(subscriptionEndDateISO);
    
    successMessage += ` ينتهي في ${subEndDateForMessage.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}`;
    
    return {
      success: true,
      message: successMessage,
      activatedPlanName: planName,
      subscriptionEndDate: subscriptionEndDateISO,
    };

  } catch (error: any) {
    console.error("Error confirming activation with Supabase:", error);
    return { success: false, message: error.message || "حدث خطأ أثناء تأكيد التفعيل." };
  }
};

