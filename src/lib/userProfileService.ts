
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
  
  // Correctly handle 'avatar_url' (snake_case) from UserProfileWriteData
  if (Object.prototype.hasOwnProperty.call(data, 'avatar_url')) {
    payloadForSupabase.avatar_url = data.avatar_url === '' ? null : data.avatar_url;
  }
  
  if (data.avatar_hint !== undefined) payloadForSupabase.avatar_hint = data.avatar_hint;
  if (data.points !== undefined) payloadForSupabase.points = data.points;
  if (data.level !== undefined) payloadForSupabase.level = data.level;
  if (data.progress_to_next_level !== undefined) payloadForSupabase.progress_to_next_level = data.progress_to_next_level;
  if (data.badges !== undefined) payloadForSupabase.badges = data.badges.map(b => ({...b, date: new Date(b.date).toISOString()}));
  if (data.rewards !== undefined) payloadForSupabase.rewards = data.rewards.map(r => ({...r, expiry: new Date(r.expiry).toISOString()}));
  if (data.student_goals !== undefined) payloadForSupabase.student_goals = data.student_goals;
  if (data.branch !== undefined) payloadForSupabase.branch = data.branch;
  if (data.university !== undefined) payloadForSupabase.university = data.university;
  if (data.major !== undefined) payloadForSupabase.major = data.major;

  if (Object.prototype.hasOwnProperty.call(data, 'active_subscription')) {
    if (data.active_subscription === null) {
      payloadForSupabase.active_subscription = null;
    } else if (data.active_subscription) {
      payloadForSupabase.active_subscription = { 
        ...data.active_subscription,
        startDate: new Date(data.active_subscription.startDate).toISOString(),
        endDate: new Date(data.active_subscription.endDate).toISOString(),
      };
    }
  }
  
  const { data: existingProfile, error: fetchError } = await supabase
    .from('profiles')
    .select('id, created_at') 
    .eq('id', data.id)
    .maybeSingle();

  if (fetchError && fetchError.code !== 'PGRST116') { 
      console.error("Supabase error fetching existing profile for upsert logic:", fetchError);
      throw fetchError;
  }

  if (!existingProfile) { 
    payloadForSupabase.created_at = data.created_at ? new Date(data.created_at).toISOString() : new Date().toISOString();
    if (data.name === undefined) payloadForSupabase.name = data.email?.split('@')[0] || "طالب جديد";
    if (data.email === undefined && data.id) payloadForSupabase.email = data.id; 
    if (payloadForSupabase.avatar_url === undefined) payloadForSupabase.avatar_url = `https://placehold.co/150x150.png?text=${(payloadForSupabase.name || "U").charAt(0).toUpperCase()}`;
    if (data.avatar_hint === undefined) payloadForSupabase.avatar_hint = 'person avatar';
    if (data.points === undefined) payloadForSupabase.points = 0;
    if (data.level === undefined) payloadForSupabase.level = 1;
    if (data.progress_to_next_level === undefined) payloadForSupabase.progress_to_next_level = 0;
    if (data.badges === undefined) payloadForSupabase.badges = [];
    if (data.rewards === undefined) payloadForSupabase.rewards = [];
    if (data.student_goals === undefined) payloadForSupabase.student_goals = '';
    if (data.branch === undefined) payloadForSupabase.branch = 'undetermined';
    if (data.university === undefined) payloadForSupabase.university = '';
    if (data.major === undefined) payloadForSupabase.major = '';
    if (!Object.prototype.hasOwnProperty.call(data, 'active_subscription')) {
        payloadForSupabase.active_subscription = null;
    }
  }


  try {
    const { data: upsertedData, error: upsertError } = await supabase
      .from('profiles')
      .upsert(payloadForSupabase, { onConflict: 'id' }) 
      .select()
      .single();

    if (upsertError) {
      console.error("Supabase error saving user profile:", upsertError);
      throw upsertError;
    }
    console.log(`User profile for ID ${data.id} upserted/updated in Supabase 'profiles' table:`, upsertedData);

    // After successfully updating the profiles table, if avatar_url was changed,
    // update it in the auth.users.user_metadata as well.
    // Check if 'avatar_url' was explicitly provided in the input data.
    if (Object.prototype.hasOwnProperty.call(data, 'avatar_url')) {
      const newAvatarForAuth = data.avatar_url === '' ? null : data.avatar_url; // Use null if cleared, otherwise the new URL
      const { data: updatedUser, error: updateUserError } = await supabase.auth.updateUser({
        data: { avatar_url: newAvatarForAuth } // Supabase Auth expects avatar_url in user_metadata.data
      });

      if (updateUserError) {
        console.error("Supabase error updating user_metadata (avatar_url) in auth:", updateUserError);
        // Do not throw here, as the primary profile save was successful. Log the error.
      } else {
        console.log("User metadata (avatar_url) successfully updated in Supabase Auth for user ID:", updatedUser?.user?.id);
      }
    }

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
      .single(); 

    if (error) {
      if (status === 406 || error.code === 'PGRST116') { 
         console.log(`No user profile found in Supabase for ID: ${id}. Returning null.`);
         return null;
      }
      // Updated error logging
      console.error(
        `Supabase error fetching user profile for ID: ${id}. ` +
        `Status: ${status}, Code: ${error.code}, Message: ${error.message}, ` +
        `Details: ${error.details}, Hint: ${error.hint}. Full error object:`, error
      );
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
      console.log(`No user profile data returned from Supabase for ID: ${id}, though no error was thrown.`);
      return null;
    }
  } catch (error) {
    console.error("Error fetching user profile from Supabase: ", error);
    if ((error as any).code === 'PGRST116') {
        console.log(`No user profile found in Supabase for ID (caught): ${id}. Returning null.`);
        return null;
    }
    throw error; 
  }
};
    

