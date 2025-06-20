
'use client';

import type { AppSettings, SocialMediaLink, LucideIconName } from '@/lib/types';
import React, { createContext, useContext, type ReactNode, useState, useEffect } from 'react';
import * as Icons from 'lucide-react';
import { supabase } from '@/lib/supabaseClient'; // Import Supabase client

interface AppSettingsContextType {
  settings: AppSettings | null;
  getIconComponent: (iconName?: LucideIconName | string) => React.ElementType;
}

const defaultAppName = 'Atmetny';
const defaultLogoUrl = null; 
const defaultLogoHint = 'application logo';
const defaultSupportEmail = 'support@example.com';

const defaultSettings: AppSettings = {
  id: 'default-settings-id', // This ID is a placeholder, the actual ID from DB will be used
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
  homepage_description: '✨ اجعل النجاح عادة!\nمنصتك التعليمية الشاملة للدراسة الذكية والاستعداد للاختبارات المؤتمتة في سوريا.\n📚 ابدأ الآن وكن من صُنّاع التفوق.',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const AppSettingsContext = createContext<AppSettingsContextType>({
  settings: defaultSettings,
  getIconComponent: (iconName?: LucideIconName | string): React.ElementType => {
    if (!iconName || typeof iconName !== 'string' || iconName.trim() === '') {
        return Icons.ExternalLink; 
    }
    let IconComponent = Icons[iconName as keyof typeof Icons];
    if (IconComponent) return IconComponent;
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
  const [currentSettings, setCurrentSettings] = useState<AppSettings | null>(fetchedSettings !== null ? fetchedSettings : defaultSettings);
  const settingsRowId = '438ae94a-f8ee-4a36-85a3-eed670aa55d8'; // Specific ID for the settings row

  useEffect(() => {
    // Set initial settings from fetchedSettings prop
    setCurrentSettings(fetchedSettings !== null ? fetchedSettings : defaultSettings);

    // Subscribe to real-time updates for the specific app_settings row
    const channel = supabase
      .channel('app-settings-changes')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'app_settings', filter: `id=eq.${settingsRowId}` },
        (payload) => {
          console.log('[AppSettingsProvider] Real-time app_settings update received:', payload);
          if (payload.new && (payload.new as AppSettings).id === settingsRowId) {
            const updatedAppSettings = payload.new as AppSettings;
            
            // Ensure social_media_links is parsed if it's a string or properly typed if already an array
            let socialMediaLinks: SocialMediaLink[] | null = [];
            if (Array.isArray(updatedAppSettings.social_media_links)) {
                socialMediaLinks = updatedAppSettings.social_media_links;
            } else if (typeof updatedAppSettings.social_media_links === 'string') {
                try {
                    socialMediaLinks = JSON.parse(updatedAppSettings.social_media_links);
                } catch (e) {
                    console.error("Failed to parse social_media_links from string:", e);
                    socialMediaLinks = null; // or keep as [] or handle error appropriately
                }
            } else {
                socialMediaLinks = updatedAppSettings.social_media_links || null;
            }

            setCurrentSettings({
                ...updatedAppSettings,
                social_media_links: socialMediaLinks
            });
          }
        }
      )
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          console.log('[AppSettingsProvider] Subscribed to app_settings changes.');
        }
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
          console.error(`[AppSettingsProvider] Subscription issue for app_settings: ${status}`, err || 'No error object provided');
        }
      });

    return () => {
      supabase.removeChannel(channel).then((status) => {
        console.log(`[AppSettingsProvider] Unsubscribed from app_settings changes. Status: ${status}`);
      }).catch(error => {
        console.error(`[AppSettingsProvider] Error unsubscribing from app_settings:`, error);
      });
    };
  }, [fetchedSettings]); // Re-run effect if fetchedSettings (initial prop) changes

  const getIconComponent = (iconName?: LucideIconName | string): React.ElementType => {
    if (!iconName || typeof iconName !== 'string' || iconName.trim() === '') {
        return Icons.ExternalLink; 
    }
    let IconComponent = Icons[iconName as keyof typeof Icons];
    if (IconComponent) return IconComponent;
    const pascalCaseIconName = iconName.charAt(0).toUpperCase() + iconName.slice(1);
    IconComponent = Icons[pascalCaseIconName as keyof typeof Icons];
    if (IconComponent) return IconComponent;
    const lowerCaseIconName = iconName.toLowerCase();
    IconComponent = Icons[lowerCaseIconName as keyof typeof Icons];
    if (IconComponent) return IconComponent;
    console.warn(`[AppSettingsContext Provider] Icon not found for name: "${iconName}". Defaulting to ExternalLink.`);
    return Icons.ExternalLink;
  };
  
  return (
    <AppSettingsContext.Provider value={{ settings: currentSettings, getIconComponent }}>
      {children}
    </AppSettingsContext.Provider>
  );
};
