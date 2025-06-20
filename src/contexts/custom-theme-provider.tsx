
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useTheme } from 'next-themes';
import { predefinedThemes, type ColorTheme } from '@/lib/color-themes';

const LS_CUSTOM_THEME_KEY = 'custom-app-theme-id'; // Changed key to be more specific

interface CustomThemeContextType {
  selectedThemeId: string;
  selectTheme: (themeId: string) => void;
  themes: ColorTheme[];
  getActiveThemeColors: () => { background: string; primary: string; accent: string; } | null;
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
  const { theme: activeMode, systemTheme } = useTheme(); // 'light' or 'dark' from next-themes
  const [selectedThemeId, setSelectedThemeId] = useState<string>(predefinedThemes[0].id);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const storedThemeId = localStorage.getItem(LS_CUSTOM_THEME_KEY);
    if (storedThemeId && predefinedThemes.find(t => t.id === storedThemeId)) {
      setSelectedThemeId(storedThemeId);
    }
  }, []);

  const getResolvedMode = useCallback(() => {
    if (activeMode === 'system') {
      return systemTheme; // 'light' or 'dark'
    }
    return activeMode; // 'light' or 'dark'
  }, [activeMode, systemTheme]);

  const applyThemeColors = useCallback(() => {
    if (!isMounted) return;

    const resolvedMode = getResolvedMode();
    if (!resolvedMode) return; // If mode is not yet resolved (e.g. systemTheme is undefined briefly)

    const currentThemeDefinition = predefinedThemes.find(t => t.id === selectedThemeId);
    if (!currentThemeDefinition) {
        console.warn(`Custom theme with ID "${selectedThemeId}" not found. Reverting to default for application.`);
        const defaultThemeDef = predefinedThemes[0];
        if (!defaultThemeDef) {
            console.error("Critical: Default theme definition is missing.");
            return;
        }
         const colorsToApplyFallback = resolvedMode === 'dark' ? defaultThemeDef.colors.dark : defaultThemeDef.colors.light;
         document.documentElement.style.setProperty('--background', colorsToApplyFallback.background);
         document.documentElement.style.setProperty('--primary', colorsToApplyFallback.primary);
         document.documentElement.style.setProperty('--accent', colorsToApplyFallback.accent);
        return;
    }

    const colorsToApply = resolvedMode === 'dark' ? currentThemeDefinition.colors.dark : currentThemeDefinition.colors.light;

    document.documentElement.style.setProperty('--background', colorsToApply.background);
    document.documentElement.style.setProperty('--primary', colorsToApply.primary);
    document.documentElement.style.setProperty('--accent', colorsToApply.accent);

  }, [isMounted, selectedThemeId, getResolvedMode]);


  useEffect(() => {
    applyThemeColors();
  }, [selectedThemeId, activeMode, systemTheme, applyThemeColors]);


  const selectTheme = (themeId: string) => {
    if (predefinedThemes.find(t => t.id === themeId)) {
      setSelectedThemeId(themeId);
      localStorage.setItem(LS_CUSTOM_THEME_KEY, themeId);
    } else {
      console.warn(`Attempted to select non-existent theme ID: ${themeId}`);
    }
  };
  
  const getActiveThemeColors = useCallback(() => {
    if (!isMounted) return null;
    const resolvedMode = getResolvedMode();
    if (!resolvedMode) return null;
    const themeDefinition = predefinedThemes.find(t => t.id === selectedThemeId);
    if (!themeDefinition) return predefinedThemes[0].colors[resolvedMode]; // Fallback to default if somehow selected is invalid
    return resolvedMode === 'dark' ? themeDefinition.colors.dark : themeDefinition.colors.light;
  }, [isMounted, selectedThemeId, getResolvedMode]);


  return (
    <CustomThemeContext.Provider value={{ selectedThemeId, selectTheme, themes: predefinedThemes, getActiveThemeColors }}>
      {children}
    </CustomThemeContext.Provider>
  );
};
