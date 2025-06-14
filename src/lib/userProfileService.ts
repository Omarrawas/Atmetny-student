
'use client';

import { supabase } from '@/lib/supabaseClient';
import type { UserProfile, SubscriptionDetails, UserProfileWriteData, Badge, Reward } from './types';

export const saveUserProfile = async (data: UserProfileWriteData): Promise<void> => {
  if (!data.id) {
    console.error("User ID (Supabase compatible) is missing for saveUserProfile.");
    throw new Error("User ID is missing");
  }

  // Prepare the object to be upserted
  // Ensure all fields are present or defaulted as Supabase upsert might not merge deeply like Firestore set with merge:true
  // For new profiles, Supabase can auto-generate createdAt via default value in DB schema.
  // For updates, we explicitly set updatedAt.

  const profilePayload: Partial<UserProfile> = {
    id: data.id, // This is the Supabase auth user ID
    updatedAt: new Date().toISOString(),
  };

  if (data.name !== undefined) profilePayload.name = data.name;
  // Email is typically managed by Supabase auth and synced to profiles table via trigger or upon signup.
  // Avoid direct update here unless specifically intended and secured.
  if (data.email !== undefined) profilePayload.email = data.email; 
  if (data.avatarUrl !== undefined) profilePayload.avatarUrl = data.avatarUrl;
  if (data.avatarHint !== undefined) profilePayload.avatarHint = data.avatarHint;
  if (data.points !== undefined) profilePayload.points = data.points;
  if (data.level !== undefined) profilePayload.level = data.level;
  if (data.progressToNextLevel !== undefined) profilePayload.progressToNextLevel = data.progressToNextLevel;
  if (data.badges !== undefined) profilePayload.badges = data.badges.map(b => ({...b, date: new Date(b.date).toISOString()}));
  if (data.rewards !== undefined) profilePayload.rewards = data.rewards.map(r => ({...r, expiry: new Date(r.expiry).toISOString()}));
  if (data.studentGoals !== undefined) profilePayload.studentGoals = data.studentGoals;
  if (data.branch !== undefined) profilePayload.branch = data.branch;
  if (data.university !== undefined) profilePayload.university = data.university;
  if (data.major !== undefined) profilePayload.major = data.major;
  
  if (Object.prototype.hasOwnProperty.call(data, 'activeSubscription')) {
    if (data.activeSubscription === null) {
      profilePayload.activeSubscription = null;
    } else if (data.activeSubscription) {
      profilePayload.activeSubscription = {
        ...data.activeSubscription,
        startDate: new Date(data.activeSubscription.startDate).toISOString(),
        endDate: new Date(data.activeSubscription.endDate).toISOString(),
      };
    }
  }
  
  // For initial creation, set default values not provided directly but part of UserProfile
  const defaultValuesOnCreate = {
    name: data.name ?? "طالب جديد",
    email: data.email!,
    avatarUrl: data.avatarUrl || `https://placehold.co/150x150.png?text=${(data.name || data.email || "U").charAt(0).toUpperCase()}`,
    avatarHint: data.avatarHint || 'person avatar',
    points: data.points ?? 0,
    level: data.level ?? 1,
    progressToNextLevel: data.progressToNextLevel ?? 0,
    badges: (data.badges ?? []).map(b => ({...b, date: new Date(b.date).toISOString()})),
    rewards: (data.rewards ?? []).map(r => ({...r, expiry: new Date(r.expiry).toISOString()})),
    studentGoals: data.studentGoals ?? '',
    branch: data.branch ?? 'undetermined',
    university: data.university ?? '',
    major: data.major ?? '',
    createdAt: new Date().toISOString(), // Set on client for upsert if not handled by DB
    activeSubscription: profilePayload.activeSubscription // already processed
  };

  try {
    // Using upsert: if a profile with this 'id' exists, it's updated. Otherwise, it's inserted.
    // Supabase needs the 'id' column to be part of the payload for upsert to identify the row.
    const { data: upsertedData, error } = await supabase
      .from('profiles') // Assuming your Supabase table for user profiles is named 'profiles'
      .upsert({ ...defaultValuesOnCreate, ...profilePayload }, { onConflict: 'id' }) // 'id' is the conflict target
      .select()
      .single();

    if (error) {
      console.error("Supabase error saving user profile:", error);
      throw error;
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
      .from('profiles') // Assuming table is 'profiles'
      .select('*')
      .eq('id', id) // 'id' column in 'profiles' table matches the auth user's id
      .single();

    if (error && status !== 406) { // 406 is expected if no row is found (single())
      console.error("Supabase error fetching user profile:", error);
      throw error;
    }

    if (data) {
      // Map data to UserProfile type, converting dates if necessary
      // Supabase returns ISO strings for timestamp fields.
      return {
        ...data,
        id: data.id,
        // Ensure all fields from UserProfile type are mapped
        name: data.name || "مستخدم جديد",
        email: data.email || "لا يوجد بريد إلكتروني",
        avatarUrl: data.avatar_url || data.avatarUrl || `https://placehold.co/150x150.png?text=${(data.name || data.email || 'U').charAt(0).toUpperCase()}`, // check for avatar_url if that's the col name
        avatarHint: data.avatar_hint || data.avatarHint || 'person avatar',
        points: data.points ?? 0,
        level: data.level ?? 1,
        progressToNextLevel: data.progress_to_next_level ?? data.progressToNextLevel ?? 0,
        badges: (data.badges ?? []).map((badge: any): Badge => ({
            ...badge,
            date: typeof badge.date === 'string' ? badge.date : new Date(badge.date).toISOString(),
        })),
        rewards: (data.rewards ?? []).map((reward: any): Reward => ({
            ...reward,
            expiry: typeof reward.expiry === 'string' ? reward.expiry : new Date(reward.expiry).toISOString(),
        })),
        studentGoals: data.student_goals ?? data.studentGoals ?? '',
        branch: data.branch ?? 'undetermined',
        university: data.university ?? '',
        major: data.major ?? '',
        createdAt: typeof data.created_at === 'string' ? data.created_at : new Date(data.created_at).toISOString(), // Supabase uses created_at
        updatedAt: typeof data.updated_at === 'string' ? data.updated_at : new Date(data.updated_at).toISOString(), // Supabase uses updated_at
        activeSubscription: data.active_subscription ? {
          ...data.active_subscription,
          startDate: typeof data.active_subscription.startDate === 'string' ? data.active_subscription.startDate : new Date(data.active_subscription.startDate).toISOString(),
          endDate: typeof data.active_subscription.endDate === 'string' ? data.active_subscription.endDate : new Date(data.active_subscription.endDate).toISOString(),
        } : null,
      } as UserProfile;
    } else {
      console.log(`No user profile found in Supabase for ID: ${id}.`);
      return null;
    }
  } catch (error) {
    console.error("Error fetching user profile from Supabase: ", error);
    throw error;
  }
};
