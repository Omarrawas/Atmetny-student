
'use client';

import { supabase } from '@/lib/supabaseClient';
import type { UserProfile, SubscriptionDetails, UserProfileWriteData, Badge, Reward } from './types';

export const saveUserProfile = async (data: UserProfileWriteData): Promise<void> => {
  if (!data.id) {
    console.error("User ID (Supabase compatible) is missing for saveUserProfile.");
    throw new Error("User ID is missing");
  }

  const payloadForSupabase: any = {
    id: data.id, // Primary key for upsert
    updated_at: new Date().toISOString(), // Always update this
  };

  // Conditionally add fields from `data` to `payloadForSupabase`, mapping names
  if (data.name !== undefined) payloadForSupabase.name = data.name;
  if (data.email !== undefined) payloadForSupabase.email = data.email;
  if (data.avatarUrl !== undefined) payloadForSupabase.avatar_url = data.avatarUrl;
  if (data.avatarHint !== undefined) payloadForSupabase.avatar_hint = data.avatarHint;
  if (data.points !== undefined) payloadForSupabase.points = data.points;
  if (data.level !== undefined) payloadForSupabase.level = data.level;
  if (data.progressToNextLevel !== undefined) payloadForSupabase.progress_to_next_level = data.progressToNextLevel;
  if (data.badges !== undefined) payloadForSupabase.badges = data.badges.map(b => ({...b, date: new Date(b.date).toISOString()}));
  if (data.rewards !== undefined) payloadForSupabase.rewards = data.rewards.map(r => ({...r, expiry: new Date(r.expiry).toISOString()}));
  if (data.studentGoals !== undefined) payloadForSupabase.student_goals = data.studentGoals;
  if (data.branch !== undefined) payloadForSupabase.branch = data.branch;
  if (data.university !== undefined) payloadForSupabase.university = data.university;
  if (data.major !== undefined) payloadForSupabase.major = data.major;

  if (Object.prototype.hasOwnProperty.call(data, 'activeSubscription')) {
    if (data.activeSubscription === null) {
      payloadForSupabase.active_subscription = null;
    } else if (data.activeSubscription) {
      payloadForSupabase.active_subscription = { // Content of JSONB is as-is from JS object
        ...data.activeSubscription,
        startDate: new Date(data.activeSubscription.startDate).toISOString(),
        endDate: new Date(data.activeSubscription.endDate).toISOString(),
      };
    }
  }
  
  // Check if profile exists to determine if it's an insert or update for defaults
  const { data: existingProfile, error: fetchError } = await supabase
    .from('profiles')
    .select('id, created_at') // only need to check existence and created_at
    .eq('id', data.id)
    .maybeSingle();

  if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116: "Searched for a single row, but N rows were found" (or 0 for maybeSingle)
      console.error("Supabase error fetching existing profile for upsert logic:", fetchError);
      throw fetchError;
  }

  if (!existingProfile) { // This is effectively an insert operation
    payloadForSupabase.created_at = data.createdAt ? new Date(data.createdAt).toISOString() : new Date().toISOString();
    // Set other defaults only if not provided in `data`
    if (data.name === undefined) payloadForSupabase.name = data.email?.split('@')[0] || "طالب جديد";
    if (data.email === undefined && data.id) payloadForSupabase.email = data.id; // Fallback for email if truly missing
    if (data.avatarUrl === undefined) payloadForSupabase.avatar_url = `https://placehold.co/150x150.png?text=${(payloadForSupabase.name || "U").charAt(0).toUpperCase()}`;
    if (data.avatarHint === undefined) payloadForSupabase.avatar_hint = 'person avatar';
    if (data.points === undefined) payloadForSupabase.points = 0;
    if (data.level === undefined) payloadForSupabase.level = 1;
    if (data.progressToNextLevel === undefined) payloadForSupabase.progress_to_next_level = 0;
    if (data.badges === undefined) payloadForSupabase.badges = [];
    if (data.rewards === undefined) payloadForSupabase.rewards = [];
    if (data.studentGoals === undefined) payloadForSupabase.student_goals = '';
    if (data.branch === undefined) payloadForSupabase.branch = 'undetermined';
    if (data.university === undefined) payloadForSupabase.university = '';
    if (data.major === undefined) payloadForSupabase.major = '';
    // active_subscription is already handled above if present in `data`
    if (!Object.prototype.hasOwnProperty.call(data, 'activeSubscription')) {
        payloadForSupabase.active_subscription = null;
    }
  }


  try {
    const { data: upsertedData, error: upsertError } = await supabase
      .from('profiles')
      .upsert(payloadForSupabase, { onConflict: 'id' }) // 'id' is the conflict target
      .select()
      .single();

    if (upsertError) {
      console.error("Supabase error saving user profile:", upsertError);
      throw upsertError;
    }
    console.log(`User profile for ID ${data.id} upserted/updated in Supabase:`, upsertedData);

  } catch (error) {
    console.error("Error in saveUserProfile (Supabase): ", error);
    throw error;
  }
};


export const getUserProfile = async (id: string): Promise<UserProfile | null> => {
  if (!id) {
    console.warn("User ID is missing for getUserProfile (Supabase).");
    return null;
  }
  try {
    const { data, error, status } = await supabase
      .from('profiles')
      .select('id, name, email, avatar_url, avatar_hint, points, level, progress_to_next_level, badges, rewards, student_goals, branch, university, major, created_at, updated_at, active_subscription')
      .eq('id', id)
      .single(); // Use single() if you expect exactly one row or an error

    if (error) {
      if (status === 406 || error.code === 'PGRST116') { // PGRST116: "Searched for a single row, but 0 rows were found"
         console.log(`No user profile found in Supabase for ID: ${id}. Returning null.`);
         return null;
      }
      console.error("Supabase error fetching user profile:", error);
      throw error;
    }

    if (data) {
      return {
        id: data.id,
        name: data.name || "مستخدم جديد",
        email: data.email || "لا يوجد بريد إلكتروني",
        avatarUrl: data.avatar_url || `https://placehold.co/150x150.png?text=${(data.name || data.email || 'U').charAt(0).toUpperCase()}`,
        avatarHint: data.avatar_hint || 'person avatar',
        points: data.points ?? 0,
        level: data.level ?? 1,
        progressToNextLevel: data.progress_to_next_level ?? 0,
        badges: (data.badges ?? []).map((badge: any): Badge => ({
            ...badge,
            date: typeof badge.date === 'string' ? badge.date : new Date(badge.date).toISOString(),
        })),
        rewards: (data.rewards ?? []).map((reward: any): Reward => ({
            ...reward,
            expiry: typeof reward.expiry === 'string' ? reward.expiry : new Date(reward.expiry).toISOString(),
        })),
        studentGoals: data.student_goals ?? '',
        branch: data.branch ?? 'undetermined',
        university: data.university ?? '',
        major: data.major ?? '',
        createdAt: typeof data.created_at === 'string' ? data.created_at : new Date(data.created_at).toISOString(),
        updatedAt: typeof data.updated_at === 'string' ? data.updated_at : new Date(data.updated_at).toISOString(),
        activeSubscription: data.active_subscription ? {
          planId: data.active_subscription.planId,
          planName: data.active_subscription.planName,
          status: data.active_subscription.status,
          activationCodeId: data.active_subscription.activationCodeId,
          subjectId: data.active_subscription.subjectId,
          subjectName: data.active_subscription.subjectName,
          startDate: typeof data.active_subscription.startDate === 'string' ? data.active_subscription.startDate : new Date(data.active_subscription.startDate).toISOString(),
          endDate: typeof data.active_subscription.endDate === 'string' ? data.active_subscription.endDate : new Date(data.active_subscription.endDate).toISOString(),
        } : null,
      } as UserProfile;
    } else {
      // This case should ideally be handled by single() throwing an error if status is not 406
      console.log(`No user profile data returned from Supabase for ID: ${id}, though no error was thrown.`);
      return null;
    }
  } catch (error) {
    console.error("Error fetching user profile from Supabase: ", error);
    // If you want to distinguish "not found" from other errors, you might check error.code here.
    // For example, PostgREST error PGRST116 indicates "Searched for a single row, but 0 rows were found"
    if ((error as any).code === 'PGRST116') {
        console.log(`No user profile found in Supabase for ID (caught): ${id}. Returning null.`);
        return null;
    }
    throw error; // Re-throw other errors
  }
};

    