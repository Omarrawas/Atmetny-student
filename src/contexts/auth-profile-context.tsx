
'use client';

import React, { createContext, useContext, useState, useEffect, type ReactNode, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { User as SupabaseAuthUser, Session as SupabaseSession } from '@supabase/supabase-js';
import { getUserProfile, saveUserProfile } from '@/lib/userProfileService';
import type { UserProfile, UserSettings } from '@/lib/types';

interface AuthAndProfileContextType {
  authUser: SupabaseAuthUser | null;
  userProfile: UserProfile | null;
  isLoadingAuthProfile: boolean;
  updateUserSetting: <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => Promise<void>;
}

const AuthAndProfileContext = createContext<AuthAndProfileContextType | undefined>(undefined);

export const useAuthAndProfile = () => {
  const context = useContext(AuthAndProfileContext);
  if (!context) {
    throw new Error('useAuthAndProfile must be used within an AuthAndProfileProvider');
  }
  return context;
};

interface AuthAndProfileProviderProps {
  children: ReactNode;
}

export const AuthAndProfileProvider = ({ children }: AuthAndProfileProviderProps) => {
  const [authUser, setAuthUser] = useState<SupabaseAuthUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoadingAuthProfile, setIsLoadingAuthProfile] = useState(true);

  const fetchProfile = useCallback(async (user: SupabaseAuthUser | null) => {
    if (user) {
      try {
        const profile = await getUserProfile(user.id);
        setUserProfile(profile);
      } catch (error) {
        console.error("AuthAndProfileProvider: Error fetching user profile:", error);
        setUserProfile(null);
      }
    } else {
      setUserProfile(null);
    }
  }, []);

  useEffect(() => {
    setIsLoadingAuthProfile(true);
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const user = session?.user ?? null;
      setAuthUser(user);
      await fetchProfile(user);
      setIsLoadingAuthProfile(false);
    }).catch(error => {
      console.error("AuthAndProfileProvider: Error getting initial Supabase session:", error);
      setIsLoadingAuthProfile(false);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setIsLoadingAuthProfile(true);
      const currentUser = session?.user ?? null;
      setAuthUser(currentUser);
      await fetchProfile(currentUser);
      setIsLoadingAuthProfile(false);
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const updateUserSetting = useCallback(async <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
    if (authUser && userProfile) {
      const currentUserSettings = userProfile.user_settings || {};
      const newSettings: UserSettings = {
        ...currentUserSettings,
        [key]: value,
      };
      try {
        await saveUserProfile({ id: authUser.id, email: authUser.email, user_settings: newSettings });
        // Optimistically update local profile state
        setUserProfile(prevProfile => prevProfile ? { ...prevProfile, user_settings: newSettings } : null);
      } catch (error) {
        console.error(`AuthAndProfileProvider: Failed to update user setting ${key}:`, error);
        // Optionally, revert optimistic update or show toast
      }
    } else {
      console.warn("AuthAndProfileProvider: Cannot update user setting, user not authenticated or profile not loaded.");
    }
  }, [authUser, userProfile]);


  return (
    <AuthAndProfileContext.Provider value={{ authUser, userProfile, isLoadingAuthProfile, updateUserSetting }}>
      {children}
    </AuthAndProfileContext.Provider>
  );
};
