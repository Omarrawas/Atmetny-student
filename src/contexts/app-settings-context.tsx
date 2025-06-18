
'use client';

import type { AppSettings, SocialMediaLink, LucideIconName } from '@/lib/types';
import React, { createContext, useContext, type ReactNode } from 'react';
import * as Icons from 'lucide-react';

interface AppSettingsContextType {
  settings: AppSettings | null;
  getIconComponent: (iconName?: LucideIconName | string) => React.ElementType;
}

const defaultAppName = 'Atmetny';
const defaultLogoUrl = null; 
const defaultLogoHint = 'application logo';
const defaultSupportEmail = 'support@example.com';

const defaultSettings: AppSettings = {
  id: 'default-settings-id',
  app_name: defaultAppName,
  app_logo_url: defaultLogoUrl,
  app_logo_hint: defaultLogoHint,
  support_phone_number: null,
  support_email: defaultSupportEmail,
  social_media_links: [
    { platform: 'Default Link', url: '#', icon: 'Link' }
  ],
  terms_of_service_url: null,
  privacy_policy_url: null,
  homepage_promo_url: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const AppSettingsContext = createContext<AppSettingsContextType>({
  settings: defaultSettings,
  getIconComponent: (iconName?: LucideIconName | string): React.ElementType => {
    if (!iconName || typeof iconName !== 'string' || iconName.trim() === '') {
        return Icons.ExternalLink; 
    }
    // Try direct match
    let IconComponent = Icons[iconName as keyof typeof Icons];
    if (IconComponent) return IconComponent;

    // Try PascalCase
    const pascalCaseIconName = iconName.charAt(0).toUpperCase() + iconName.slice(1);
    IconComponent = Icons[pascalCaseIconName as keyof typeof Icons];
    if (IconComponent) return IconComponent;
    
    console.warn(`[AppSettingsContext Default] Icon not found for name: "${iconName}". Defaulting to ExternalLink.`);
    return Icons.ExternalLink;
  }
});

export const useAppSettings = () => {
  const context = useContext(AppSettingsContext);
  if (context === undefined) {
    throw new Error('useAppSettings must be used within an AppSettingsProvider');
  }
  return context;
};

interface AppSettingsProviderProps {
  children: ReactNode;
  fetchedSettings: AppSettings | null;
}

export const AppSettingsProvider: React.FC<AppSettingsProviderProps> = ({ children, fetchedSettings }) => {
  const settings = fetchedSettings !== null ? fetchedSettings : defaultSettings;

  const getIconComponent = (iconName?: LucideIconName | string): React.ElementType => {
    if (!iconName || typeof iconName !== 'string' || iconName.trim() === '') {
        return Icons.ExternalLink; // Default for empty or invalid
    }

    // Try direct match (e.g., "Facebook" or user correctly provided PascalCase)
    let IconComponent = Icons[iconName as keyof typeof Icons];
    if (IconComponent) {
        return IconComponent;
    }

    // Try converting to PascalCase (e.g., "instagram" -> "Instagram")
    const pascalCaseIconName = iconName.charAt(0).toUpperCase() + iconName.slice(1);
    IconComponent = Icons[pascalCaseIconName as keyof typeof Icons];
    if (IconComponent) {
        return IconComponent;
    }
    
    // Try all lowercase (less common for lucide-react but worth a shot for icons like 'github')
    const lowerCaseIconName = iconName.toLowerCase();
    IconComponent = Icons[lowerCaseIconName as keyof typeof Icons];
    if (IconComponent) {
        return IconComponent;
    }

    // Fallback if no match after trying common variations
    console.warn(`[AppSettingsContext Provider] Icon not found for name: "${iconName}". Defaulting to ExternalLink.`);
    return Icons.ExternalLink;
  };
  
  return (
    <AppSettingsContext.Provider value={{ settings, getIconComponent }}>
      {children}
    </AppSettingsContext.Provider>
  );
};
