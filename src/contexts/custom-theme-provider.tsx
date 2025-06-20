
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useTheme } from 'next-themes';
import { predefinedThemes, type ColorTheme } from '@/lib/color-themes';

const LS_CUSTOM_THEME_KEY = 'custom-app-theme-id';

interface CustomThemeContextType {
  selectedThemeId: string;
  selectTheme: (themeId: string) => void;
  themes: ColorTheme[];
  getActiveThemeColors: () => ColorTheme['colors']['light'] | null; // Return type simplified for example
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

    // Apply sidebar colors
    root.style.setProperty('--sidebar-background', colorsToApply.sidebarBackground);
    root.style.setProperty('--sidebar-foreground', colorsToApply.sidebarForeground);
    root.style.setProperty('--sidebar-primary', colorsToApply.sidebarPrimary);
    root.style.setProperty('--sidebar-primary-foreground', colorsToApply.sidebarPrimaryForeground);
    root.style.setProperty('--sidebar-accent', colorsToApply.sidebarAccent);
    root.style.setProperty('--sidebar-accent-foreground', colorsToApply.sidebarAccentForeground);
    root.style.setProperty('--sidebar-border', colorsToApply.sidebarBorder);
    root.style.setProperty('--sidebar-ring', colorsToApply.sidebarRing);

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
  
  const getActiveThemeColors = useCallback((): ColorTheme['colors']['light'] | null => {
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
