
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useTheme } from 'next-themes';
import { predefinedThemes, type ColorTheme } from '@/lib/color-themes';
import { useAuthAndProfile } from './auth-profile-context';
import type { UserSettings } from '@/lib/types';

const LS_CUSTOM_THEME_KEY_PREFIX = 'custom-app-theme-override-'; // Prefix for individual theme overrides

interface CustomThemeContextType {
  selectedThemeId: string;
  selectTheme: (themeId: string) => void;
  themes: ColorTheme[];
  getActiveThemeDefinition: () => ColorTheme | null; // To get potentially customized theme
  updateThemeColorValue: (themeId: string, mode: 'light' | 'dark', colorKey: keyof ColorTheme['colors']['light'], newValue: string) => void;
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
  const { authUser, userProfile, isLoadingAuthProfile, updateUserSetting } = useAuthAndProfile();

  const [selectedThemeId, setSelectedThemeId] = useState<string>(predefinedThemes[0].id);
  // State to hold all theme definitions, potentially with user overrides applied from localStorage
  const [effectiveThemes, setEffectiveThemes] = useState<ColorTheme[]>(predefinedThemes);
  const [isMounted, setIsMounted] = useState(false);

  // Load theme choice from DB or localStorage
  useEffect(() => {
    setIsMounted(true);
    let initialThemeId = predefinedThemes[0].id;
    const storedGlobalThemeId = localStorage.getItem('custom-app-theme-id'); // Legacy key for selected theme ID

    if (userProfile?.user_settings?.selectedThemeId && predefinedThemes.find(t => t.id === userProfile.user_settings.selectedThemeId)) {
      initialThemeId = userProfile.user_settings.selectedThemeId;
    } else if (storedGlobalThemeId && predefinedThemes.find(t => t.id === storedGlobalThemeId)) {
      initialThemeId = storedGlobalThemeId;
    }
    setSelectedThemeId(initialThemeId);
  }, [isMounted, userProfile, isLoadingAuthProfile]);


  // Load theme customizations from localStorage for all themes on mount
  useEffect(() => {
    if (isMounted) {
      const loadedThemes = predefinedThemes.map(pTheme => {
        const storedOverridesString = localStorage.getItem(`${LS_CUSTOM_THEME_KEY_PREFIX}${pTheme.id}`);
        if (storedOverridesString) {
          try {
            const overrides = JSON.parse(storedOverridesString);
            // Deep merge overrides into a copy of the predefined theme
            const customizedTheme = JSON.parse(JSON.stringify(pTheme)); // Deep copy
            if (overrides.light) {
              customizedTheme.colors.light = { ...customizedTheme.colors.light, ...overrides.light };
            }
            if (overrides.dark) {
              customizedTheme.colors.dark = { ...customizedTheme.colors.dark, ...overrides.dark };
            }
            return customizedTheme;
          } catch (e) {
            console.error(`Failed to parse theme overrides for ${pTheme.id}:`, e);
            return pTheme; // Fallback to predefined if parsing fails
          }
        }
        return pTheme;
      });
      setEffectiveThemes(loadedThemes);
    }
  }, [isMounted]);


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

    const currentThemeDefinition = effectiveThemes.find(t => t.id === selectedThemeId) || predefinedThemes.find(t => t.id === selectedThemeId) || predefinedThemes[0];
    const colorsToApply = resolvedMode === 'dark' ? currentThemeDefinition.colors.dark : currentThemeDefinition.colors.light;

    const root = document.documentElement;

    // Apply all color properties from the theme
    Object.entries(colorsToApply).forEach(([key, value]) => {
        // Convert camelCase to kebab-case for CSS variables
        const cssVarName = key.replace(/([A-Z])/g, '-$1').toLowerCase();
        if (value && typeof value === 'string') {
          // Specific handling for user colors vs HSL general colors
          if (key.startsWith('user') || key.includes('Gradient') || key.startsWith('button')) {
            root.style.setProperty(`--${cssVarName}`, value);
          } else if (key === 'appBackgroundGradient' || key === 'sidebarBackgroundGradient' || key === 'cardBackgroundGradient'){
            root.style.setProperty(`--${cssVarName.replace('-gradient', '-bg-actual')}`, value); // Ensure mapping for actual backgrounds
          } else if (key.endsWith('TextGradient')){
             root.style.setProperty(`--${cssVarName.replace('-text-gradient', '-text-gradient-actual')}`, value);
          }
           else {
            // For standard HSL vars like 'background', 'primary'
            root.style.setProperty(`--${cssVarName}`, value);
          }
        }
    });
    
    // Ensure actual background gradients are set correctly
    const appBgActual = colorsToApply.appBackgroundGradient || `hsl(${colorsToApply.background})`;
    root.style.setProperty('--app-bg-actual', appBgActual);

    const sidebarBgActual = colorsToApply.sidebarBackgroundGradient || `hsl(${colorsToApply.sidebarBackground})`;
    root.style.setProperty('--sidebar-bg-actual', sidebarBgActual);

    const cardBgActual = colorsToApply.cardBackgroundGradient || `hsl(${colorsToApply.card})`;
    root.style.setProperty('--card-bg-actual', cardBgActual);

    // Ensure text gradients actuals are set
    const primaryTextGradientActual = colorsToApply.primaryTextGradient || colorsToApply.userTextPrimary || `hsl(${colorsToApply.foreground || '0 0% 13%'})`;
    root.style.setProperty('--primary-text-gradient-actual', primaryTextGradientActual);
    const accentTextGradientActual = colorsToApply.accentTextGradient || colorsToApply.userTextPrimary || `hsl(${colorsToApply.accentForeground || '0 0% 100%'})`;
    root.style.setProperty('--accent-text-gradient-actual', accentTextGradientActual);
    const secondaryTextGradientActual = colorsToApply.secondaryTextGradient || colorsToApply.userTextSecondary || `hsl(${colorsToApply.secondaryForeground || '270 85% 30%'})`;
    root.style.setProperty('--secondary-text-gradient-actual', secondaryTextGradientActual);
    const foregroundTextGradientActual = colorsToApply.foregroundTextGradient || colorsToApply.userTextPrimary || `hsl(${colorsToApply.foreground || '0 0% 13%'})`;
    root.style.setProperty('--foreground-text-gradient-actual', foregroundTextGradientActual);

    // Button gradients from user's theme palette
    const buttonPrimaryGradient = `linear-gradient(to right, ${colorsToApply.userGradientAccentStart || `hsl(${colorsToApply.primary})`}, ${colorsToApply.userGradientAccentEnd || `hsl(${colorsToApply.accent})`})`;
    root.style.setProperty('--button-primary-gradient', buttonPrimaryGradient);
    const buttonPrimaryHoverGradient = `linear-gradient(to right, ${colorsToApply.userGradientAccentEnd || `hsl(${colorsToApply.accent})`}, ${colorsToApply.userGradientAccentStart || `hsl(${colorsToApply.primary})`})`;
    root.style.setProperty('--button-primary-hover-gradient', buttonPrimaryHoverGradient);
    const buttonAccentGradient = `linear-gradient(to right, ${colorsToApply.userGradientRedStart || `hsl(${colorsToApply.accent})`}, ${colorsToApply.userGradientRedEnd || `hsl(${colorsToApply.destructive || '0 84.2% 60.2%'})`})`;
    root.style.setProperty('--button-accent-gradient', buttonAccentGradient);
    const buttonAccentHoverGradient = `linear-gradient(to right, ${colorsToApply.userGradientRedEnd || `hsl(${colorsToApply.destructive || '0 84.2% 60.2%'})`}, ${colorsToApply.userGradientRedStart || `hsl(${colorsToApply.accent})`})`;
    root.style.setProperty('--button-accent-hover-gradient', buttonAccentHoverGradient);


  }, [isMounted, selectedThemeId, getResolvedMode, effectiveThemes]);


  useEffect(() => {
    applyThemeColors();
  }, [selectedThemeId, activeMode, systemTheme, applyThemeColors, effectiveThemes]);


  const selectTheme = async (themeId: string) => {
    if (predefinedThemes.find(t => t.id === themeId)) {
      setSelectedThemeId(themeId);
      localStorage.setItem('custom-app-theme-id', themeId); // Save selected ID globally
      if (authUser) {
        try {
          await updateUserSetting('selectedThemeId', themeId);
        } catch (error) {
          console.error("CustomThemeProvider: Failed to save theme ID to DB", error);
        }
      }
    } else {
      console.warn(`Attempted to select non-existent theme ID: ${themeId}`);
    }
  };

  const getActiveThemeDefinition = useCallback((): ColorTheme | null => {
    if (!isMounted) return null;
    return effectiveThemes.find(t => t.id === selectedThemeId) || predefinedThemes.find(t => t.id === selectedThemeId) || null;
  }, [isMounted, selectedThemeId, effectiveThemes]);

  const updateThemeColorValue = (
    themeIdToUpdate: string,
    mode: 'light' | 'dark',
    colorKey: keyof ColorTheme['colors']['light'], // Assuming light and dark have same keys
    newValue: string
  ) => {
    setEffectiveThemes(currentThemes =>
      currentThemes.map(theme => {
        if (theme.id === themeIdToUpdate) {
          const updatedTheme = JSON.parse(JSON.stringify(theme)); // Deep copy
          // @ts-ignore
          updatedTheme.colors[mode][colorKey] = newValue;

          // Persist this specific theme's overrides to localStorage
          const themeOverridesKey = `${LS_CUSTOM_THEME_KEY_PREFIX}${themeIdToUpdate}`;
          let currentOverrides = {};
          try {
            const stored = localStorage.getItem(themeOverridesKey);
            if (stored) currentOverrides = JSON.parse(stored);
          } catch (e) { console.error("Error parsing stored theme overrides:", e); }
          
          const newModeOverrides = {
            ...(currentOverrides[mode] || {}),
            [colorKey]: newValue,
          };
          const newTotalOverrides = {
            ...currentOverrides,
            [mode]: newModeOverrides,
          };
          localStorage.setItem(themeOverridesKey, JSON.stringify(newTotalOverrides));
          
          return updatedTheme;
        }
        return theme;
      })
    );
    // The useEffect for applyThemeColors will pick up the change in effectiveThemes
  };

  return (
    <CustomThemeContext.Provider value={{ selectedThemeId, selectTheme, themes: effectiveThemes, getActiveThemeDefinition, updateThemeColorValue }}>
      {children}
    </CustomThemeContext.Provider>
  );
};

