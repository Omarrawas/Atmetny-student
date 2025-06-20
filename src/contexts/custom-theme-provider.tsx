
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useTheme } from 'next-themes';
import { predefinedThemes, type ColorTheme } from '@/lib/color-themes';
import { useAuthAndProfile } from './auth-profile-context'; // Import the new context
import type { UserSettings } from '@/lib/types';

const LS_CUSTOM_THEME_KEY = 'custom-app-theme-id';

interface CustomThemeContextType {
  selectedThemeId: string;
  selectTheme: (themeId: string) => void;
  themes: ColorTheme[];
  getActiveThemeColors: () => ColorTheme['colors']['light'] | ColorTheme['colors']['dark'] | null;
}

const CustomThemeContext = createContext<CustomThemeContextType | undefined>(undefined);

export const useCustomTheme = () => {
  const context = useContext(CustomThemeContext);
  if (!context) {
    throw new Error('useCustomTheme must be used within a CustomThemeProvider');
  }
  return context;
};

export const CustomThemeProvider = ({ children }: { children: ReactNode }) => {
  const { theme: activeMode, systemTheme } = useTheme(); 
  const { authUser, userProfile, isLoadingAuthProfile, updateUserSetting } = useAuthAndProfile(); // Get user and profile
  
  const [selectedThemeId, setSelectedThemeId] = useState<string>(predefinedThemes[0].id);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Local storage is fallback if no user or no setting in DB
    const storedThemeId = localStorage.getItem(LS_CUSTOM_THEME_KEY);
    if (storedThemeId && predefinedThemes.find(t => t.id === storedThemeId)) {
      setSelectedThemeId(storedThemeId);
    }
  }, []);

  useEffect(() => {
    if (isMounted && !isLoadingAuthProfile && userProfile?.user_settings?.selectedThemeId) {
      const dbThemeId = userProfile.user_settings.selectedThemeId;
      if (predefinedThemes.find(t => t.id === dbThemeId)) {
        if (selectedThemeId !== dbThemeId) {
          setSelectedThemeId(dbThemeId);
          localStorage.setItem(LS_CUSTOM_THEME_KEY, dbThemeId); // Sync local storage
        }
      }
    }
  }, [isMounted, isLoadingAuthProfile, userProfile, selectedThemeId]);


  const getResolvedMode = useCallback(() => {
    if (activeMode === 'system') {
      return systemTheme; 
    }
    return activeMode; 
  }, [activeMode, systemTheme]);

  const applyThemeColors = useCallback(() => {
    if (!isMounted) return;

    const resolvedMode = getResolvedMode();
    if (!resolvedMode) return; 

    const currentThemeDefinition = predefinedThemes.find(t => t.id === selectedThemeId) || predefinedThemes[0];
    const colorsToApply = resolvedMode === 'dark' ? currentThemeDefinition.colors.dark : currentThemeDefinition.colors.light;

    const root = document.documentElement;
    
    root.style.setProperty('--background', colorsToApply.background);
    root.style.setProperty('--primary', colorsToApply.primary);
    root.style.setProperty('--accent', colorsToApply.accent);
    root.style.setProperty('--secondary', colorsToApply.secondary);
    root.style.setProperty('--card', colorsToApply.card); 
    root.style.setProperty('--border', colorsToApply.border); 
    root.style.setProperty('--muted', colorsToApply.muted);
    root.style.setProperty('--foreground', colorsToApply.userTextPrimary || '210 10% 25%'); 

    root.style.setProperty('--sidebar-background', colorsToApply.sidebarBackground);
    root.style.setProperty('--sidebar-foreground', colorsToApply.sidebarForeground);
    root.style.setProperty('--sidebar-primary', colorsToApply.sidebarPrimary);
    root.style.setProperty('--sidebar-primary-foreground', colorsToApply.sidebarPrimaryForeground);
    root.style.setProperty('--sidebar-accent', colorsToApply.sidebarAccent);
    root.style.setProperty('--sidebar-accent-foreground', colorsToApply.sidebarAccentForeground);
    root.style.setProperty('--sidebar-border', colorsToApply.sidebarBorder);
    root.style.setProperty('--sidebar-ring', colorsToApply.sidebarRing);

    if (colorsToApply.userGradientStart) root.style.setProperty('--user-gradient-start', colorsToApply.userGradientStart);
    if (colorsToApply.userGradientEnd) root.style.setProperty('--user-gradient-end', colorsToApply.userGradientEnd);
    if (colorsToApply.userGradientAccentStart) root.style.setProperty('--user-gradient-accent-start', colorsToApply.userGradientAccentStart);
    if (colorsToApply.userGradientAccentEnd) root.style.setProperty('--user-gradient-accent-end', colorsToApply.userGradientAccentEnd);
    if (colorsToApply.userGradientRedStart) root.style.setProperty('--user-gradient-red-start', colorsToApply.userGradientRedStart);
    if (colorsToApply.userGradientRedEnd) root.style.setProperty('--user-gradient-red-end', colorsToApply.userGradientRedEnd);
    
    if (colorsToApply.userTextPrimary) root.style.setProperty('--user-text-primary', colorsToApply.userTextPrimary);
    if (colorsToApply.userTextSecondary) root.style.setProperty('--user-text-secondary', colorsToApply.userTextSecondary);
    if (colorsToApply.userBorderColor) root.style.setProperty('--user-border-color', colorsToApply.userBorderColor);
    if (colorsToApply.userPrimaryBg) root.style.setProperty('--user-primary-bg', colorsToApply.userPrimaryBg);
    if (colorsToApply.userSecondaryBg) root.style.setProperty('--user-secondary-bg', colorsToApply.userSecondaryBg);

    const appBgActual = colorsToApply.appBackgroundGradient || `hsl(${colorsToApply.background})`;
    root.style.setProperty('--app-bg-actual', appBgActual);

    const sidebarBgActual = colorsToApply.sidebarBackgroundGradient || `hsl(${colorsToApply.sidebarBackground})`;
    root.style.setProperty('--sidebar-bg-actual', sidebarBgActual);

    const cardBgActual = colorsToApply.cardBackgroundGradient || `hsl(${colorsToApply.card})`; 
    root.style.setProperty('--card-bg-actual', cardBgActual);
    
    const primaryTextGradientActual = colorsToApply.primaryTextGradient || colorsToApply.userTextPrimary || `hsl(var(--foreground))`;
    root.style.setProperty('--primary-text-gradient-actual', primaryTextGradientActual);

    const accentTextGradientActual = colorsToApply.accentTextGradient || colorsToApply.userTextPrimary || `hsl(var(--accent-foreground))`; 
    root.style.setProperty('--accent-text-gradient-actual', accentTextGradientActual);

    const secondaryTextGradientActual = colorsToApply.secondaryTextGradient || colorsToApply.userTextSecondary || `hsl(var(--secondary-foreground))`;
    root.style.setProperty('--secondary-text-gradient-actual', secondaryTextGradientActual);
    
    const foregroundTextGradientActual = colorsToApply.foregroundTextGradient || colorsToApply.userTextPrimary || `hsl(var(--foreground))`;
    root.style.setProperty('--foreground-text-gradient-actual', foregroundTextGradientActual);

    const buttonPrimaryGradient = `linear-gradient(to right, ${colorsToApply.userGradientAccentStart || 'hsl(var(--primary))'}, ${colorsToApply.userGradientAccentEnd || 'hsl(var(--accent))'})`;
    root.style.setProperty('--button-primary-gradient', buttonPrimaryGradient);
    
    const buttonPrimaryHoverGradient = `linear-gradient(to right, ${colorsToApply.userGradientAccentEnd || 'hsl(var(--accent))'}, ${colorsToApply.userGradientAccentStart || 'hsl(var(--primary))'})`;
    root.style.setProperty('--button-primary-hover-gradient', buttonPrimaryHoverGradient);

    const buttonAccentGradient = `linear-gradient(to right, ${colorsToApply.userGradientRedStart || 'hsl(var(--accent))'}, ${colorsToApply.userGradientRedEnd || 'hsl(var(--primary))'})`;
    root.style.setProperty('--button-accent-gradient', buttonAccentGradient);

    const buttonAccentHoverGradient = `linear-gradient(to right, ${colorsToApply.userGradientRedEnd || 'hsl(var(--primary))'}, ${colorsToApply.userGradientRedStart || 'hsl(var(--accent))'})`;
    root.style.setProperty('--button-accent-hover-gradient', buttonAccentHoverGradient);

  }, [isMounted, selectedThemeId, getResolvedMode]);


  useEffect(() => {
    applyThemeColors();
  }, [selectedThemeId, activeMode, systemTheme, applyThemeColors]);


  const selectTheme = async (themeId: string) => {
    if (predefinedThemes.find(t => t.id === themeId)) {
      setSelectedThemeId(themeId);
      localStorage.setItem(LS_CUSTOM_THEME_KEY, themeId);
      if (authUser) {
        try {
          await updateUserSetting('selectedThemeId', themeId);
        } catch (error) {
            console.error("CustomThemeProvider: Failed to save theme to DB", error);
        }
      }
    } else {
      console.warn(`Attempted to select non-existent theme ID: ${themeId}`);
    }
  };
  
  const getActiveThemeColors = useCallback((): ColorTheme['colors']['light'] | ColorTheme['colors']['dark'] | null => {
    if (!isMounted) return null;
    const resolvedMode = getResolvedMode();
    if (!resolvedMode) return null;
    const themeDefinition = predefinedThemes.find(t => t.id === selectedThemeId) || predefinedThemes[0];
    return resolvedMode === 'dark' ? themeDefinition.colors.dark : themeDefinition.colors.light;
  }, [isMounted, selectedThemeId, getResolvedMode]);


  return (
    <CustomThemeContext.Provider value={{ selectedThemeId, selectTheme, themes: predefinedThemes, getActiveThemeColors }}>
      {children}
    </CustomThemeContext.Provider>
  );
};
