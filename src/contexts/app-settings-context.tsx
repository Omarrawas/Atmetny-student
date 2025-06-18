
'use client';

import type { AppSettings, SocialMediaLink, LucideIconName } from '@/lib/types';
import React, { createContext, useContext, type ReactNode } from 'react';
import * as Icons from 'lucide-react';

interface AppSettingsContextType {
  settings: AppSettings | null;
  getIconComponent: (iconName?: LucideIconName | string) => React.ElementType;
}

const defaultAppName = 'Atmetny';
const defaultLogoUrl = null; // Changed from '/default-logo.svg' to null
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
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const AppSettingsContext = createContext<AppSettingsContextType>({
  settings: defaultSettings,
  getIconComponent: (iconName?: LucideIconName | string): React.ElementType => {
    if (!iconName || typeof iconName !== 'string') return Icons.ExternalLink;
    const IconComponent = Icons[iconName as keyof typeof Icons];
    return IconComponent || Icons.ExternalLink;
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
  // If fetchedSettings is null (e.g., DB error), use defaultSettings.
  // If fetchedSettings is an object but app_logo_url is null/undefined within it, it will correctly use that null.
  const settings = fetchedSettings !== null ? fetchedSettings : defaultSettings;


  const getIconComponent = (iconName?: LucideIconName | string): React.ElementType => {
    if (!iconName || typeof iconName !== 'string') return Icons.ExternalLink; // Default icon
    const IconComponent = Icons[iconName as keyof typeof Icons];
    return IconComponent || Icons.ExternalLink; // Default if name doesn't match any Lucide icon
  };
  
  return (
    <AppSettingsContext.Provider value={{ settings, getIconComponent }}>
      {children}
    </AppSettingsContext.Provider>
  );
};

