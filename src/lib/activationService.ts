
'use client';

import { supabase } from '@/lib/supabaseClient';
import type {
  ActivationCode,
  SubscriptionDetails,
  UserProfileWriteData,
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
      if (codeType === "choose_single_subject_monthly") return "اشتراك شهري لمادة واحدة";
      if (codeType === "choose_single_subject_quarterly") return "اشتراك ربع سنوي لمادة واحدة";
      if (codeType === "choose_single_subject_yearly") return "اشتراك سنوي لمادة واحدة";
    }
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
      .from('activation_codes') // Assuming table name
      .select('*')
      .eq('encoded_value', encodedValue.trim()) // Assuming column name
      .limit(1)
      .single(); // Expects a single row or null

    if (error && error.code !== 'PGRST116') { // PGRST116: "Row Not Found" when .single() is used and no row matches
      throw error;
    }

    if (!codeData) {
      return { isValid: false, message: "رمز التفعيل غير موجود أو غير صحيح.", needsSubjectChoice: false };
    }

    const now = new Date();
    const validUntilDate = new Date(codeData.valid_until); // Assuming valid_until is ISO string
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
      id: codeData.id, // Supabase primary key 'id'
      encodedValue: codeData.encoded_value,
      name: codeData.name,
      type: codeData.type,
      validUntil: codeData.valid_until, // ISO string
      subjectId: codeData.subject_id || null,
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
  const { userId, email, codeId, codeType, codeValidUntil, chosenSubjectId, chosenSubjectName } = payload;

  if (!userId || !email || !codeId || !codeType) {
    return { success: false, message: "بيانات التفعيل الأساسية غير مكتملة (المستخدم، الرمز)." };
  }
  // Note: True atomicity requires a database function (PostgreSQL stored procedure) called via supabase.rpc()
  // The following operations are sequential and not truly atomic on the client-side.

  try {
    // 1. Fetch the code again to ensure it's still valid (important for non-atomic operations)
    const { data: codeData, error: fetchError } = await supabase
      .from('activation_codes')
      .select('*')
      .eq('id', codeId)
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
      used_by_user_id: userId,
      used_at: now.toISOString(),
      updated_at: now.toISOString(),
    };
    if (chosenSubjectId) {
      codeUpdatePayload.used_for_subject_id = chosenSubjectId;
    } else if (codeData.subject_id) {
      codeUpdatePayload.used_for_subject_id = codeData.subject_id;
    }
    
    const { error: updateCodeError } = await supabase
      .from('activation_codes')
      .update(codeUpdatePayload)
      .eq('id', codeId);

    if (updateCodeError) {
      console.error("Supabase error updating activation code:", updateCodeError);
      throw new Error("فشل تحديث حالة رمز التفعيل.");
    }

    // 3. Prepare and Update User Profile (activeSubscription) in Supabase
    const planName = getPlanNameFromType(
      codeData.type,
      codeData.subject_name, 
      chosenSubjectName
    );
    const subscriptionEndDateISO = codeData.valid_until; // This is already an ISO string from Supabase

    const finalSubjectId = chosenSubjectId || codeData.subject_id || null;
    const finalSubjectName = chosenSubjectName || codeData.subject_name || null;

    const newSubscription: SubscriptionDetails = {
      planId: codeData.type,
      planName: planName,
      startDate: now.toISOString(),
      endDate: subscriptionEndDateISO,
      status: 'active',
      activationCodeId: codeId, 
      subjectId: finalSubjectId,
      subjectName: finalSubjectName,
    };
    
    // We use the saveUserProfile function which handles upsert for profiles
    // It requires the user's Supabase ID (which is userId in this context)
    await saveUserProfile({
      id: userId, // Supabase user ID
      email: email, // Pass email for consistency if profile is new
      activeSubscription: newSubscription,
      updatedAt: now.toISOString() // Ensure updatedAt is set
    });


    // 4. Log Activation in Supabase
    const { error: logError } = await supabase
      .from('activation_logs') // Assuming table name
      .insert({
        user_id: userId,
        code_id: codeId, 
        subject_id: finalSubjectId, 
        email: email, 
        code_type: codeData.type, 
        plan_name: planName,
        activated_at: now.toISOString(), 
      });

    if (logError) {
      console.error("Supabase error logging activation:", logError);
      // Log this error but don't necessarily fail the whole activation if user profile and code updated
    }

    let successMessage = `تم تفعيل اشتراكك بنجاح!`;
    const subEndDateForMessage = new Date(subscriptionEndDateISO);
    
    successMessage += ` ينتهي في ${subEndDateForMessage.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}`;
    
    if (finalSubjectName) {
        successMessage = `تم تفعيل اشتراكك في مادة "${finalSubjectName}" بنجاح! ينتهي في ${subEndDateForMessage.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}.`;
    }

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
