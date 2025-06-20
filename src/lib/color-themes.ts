
export interface ColorTheme {
  name: string; // User-friendly name
  id: string;   // Unique ID for localStorage
  colors: {
    light: {
      background: string; // HSL string e.g., "210 40% 98%"
      primary: string;
      accent: string;
      secondary: string;
      card: string;
      border: string;
      muted: string;
      // Sidebar specific HSL colors
      sidebarBackground: string;
      sidebarForeground: string;
      sidebarPrimary: string;
      sidebarPrimaryForeground: string;
      sidebarAccent: string;
      sidebarAccentForeground: string;
      sidebarBorder: string;
      sidebarRing: string;
    };
    dark: {
      background: string;
      primary: string;
      accent: string;
      secondary: string;
      card: string;
      border: string;
      muted: string;
      // Sidebar specific HSL colors
      sidebarBackground: string;
      sidebarForeground: string;
      sidebarPrimary: string;
      sidebarPrimaryForeground: string;
      sidebarAccent: string;
      sidebarAccentForeground: string;
      sidebarBorder: string;
      sidebarRing: string;
    };
  };
}

export const predefinedThemes: ColorTheme[] = [
  {
    name: "بنفسجي ليلي",
    id: "night-purple",
    colors: {
      light: { // Conceptual light version for "Night Purple"
        background: "250 20% 98%", // Very Light Lavender White
        primary: "275 70% 55%",    // Vibrant Purple (adjusted for light bg)
        accent: "300 70% 60%",     // Pinkish-Purple accent
        secondary: "275 60% 90%",   // Very Light Purple
        card: "0 0% 100%",          // White
        border: "250 15% 88%",      // Light Lavender Border
        muted: "250 15% 94%",       // Light Lavender Grey
        sidebarBackground: "275 50% 96%", // Very Light Purple/Lavender
        sidebarForeground: "275 50% 25%", // Dark Purple text
        sidebarPrimary: "275 70% 55%",    // Primary color for active items
        sidebarPrimaryForeground: "0 0% 100%", // White text on primary
        sidebarAccent: "275 50% 92%",    // Slightly darker light purple for hover
        sidebarAccentForeground: "275 50% 20%", // Darker purple for text on hover
        sidebarBorder: "275 40% 90%",      // Light border
        sidebarRing: "275 70% 60%",       // Ring color
      },
      dark: { // Colors derived from the provided image
        background: "250 10% 10%", // Dark Indigo/Deep Purple-Blue
        primary: "275 75% 65%",    // Vibrant Purple/Magenta
        accent: "300 80% 70%",     // Bright Pinkish-Purple as an accent
        secondary: "250 10% 25%",   // Muted Dark Indigo for secondary elements
        card: "250 10% 15%",       // Slightly Lighter Dark Indigo
        border: "250 10% 20%",      // Subtle border
        muted: "250 10% 20%",       // Muted color
        sidebarBackground: "250 12% 12%", // Distinct dark indigo for sidebar
        sidebarForeground: "250 15% 95%", // White/Light Lavender text
        sidebarPrimary: "275 75% 65%",    // Primary color for active items
        sidebarPrimaryForeground: "0 0% 100%", // White text on primary
        sidebarAccent: "250 10% 20%",    // Slightly lighter dark indigo for hover
        sidebarAccentForeground: "250 15% 95%", // Text on hover
        sidebarBorder: "250 10% 10%",      // Darker border for sidebar
        sidebarRing: "275 75% 70%",       // Ring color
      },
    },
  },
  {
    name: "أزرق افتراضي (نظام)", // This was the previous default
    id: "default-system-blue",
    colors: {
      light: {
        background: "208 100% 97%",
        primary: "207 82% 68%",
        accent: "45 100% 85%",
        secondary: "208 60% 93%",
        card: "208 100% 98%",
        border: "208 40% 85%",
        muted: "208 60% 93%",
        sidebarBackground: "207 80% 55%",
        sidebarForeground: "0 0% 100%",
        sidebarPrimary: "45 100% 85%",
        sidebarPrimaryForeground: "45 70% 35%",
        sidebarAccent: "207 82% 65%",
        sidebarAccentForeground: "0 0% 100%",
        sidebarBorder: "207 80% 50%",
        sidebarRing: "45 100% 85%",
      },
      dark: {
        background: "208 20% 10%",
        primary: "207 82% 68%",
        accent: "45 100% 85%",
        secondary: "208 20% 20%",
        card: "208 20% 15%",
        border: "208 20% 25%",
        muted: "208 20% 20%",
        sidebarBackground: "208 20% 8%",
        sidebarForeground: "208 100% 97%",
        sidebarPrimary: "45 100% 85%",
        sidebarPrimaryForeground: "45 70% 25%",
        sidebarAccent: "208 20% 18%",
        sidebarAccentForeground: "208 100% 97%",
        sidebarBorder: "208 20% 22%",
        sidebarRing: "45 100% 85%",
      },
    },
  },
  {
    name: "أخضر غابي",
    id: "forest-green",
    colors: {
      light: {
        background: "120 60% 97%",
        primary: "120 39% 53%",
        accent: "90 50% 75%",
        secondary: "120 50% 90%",
        card: "120 60% 98%",
        border: "120 40% 85%",
        muted: "120 50% 90%",
        sidebarBackground: "120 39% 43%",
        sidebarForeground: "120 25% 95%",
        sidebarPrimary: "90 50% 75%",
        sidebarPrimaryForeground: "90 50% 25%",
        sidebarAccent: "120 39% 58%",
        sidebarAccentForeground: "120 25% 95%",
        sidebarBorder: "120 39% 38%",
        sidebarRing: "90 50% 75%",
      },
      dark: {
        background: "120 25% 10%",
        primary: "120 39% 63%",
        accent: "90 50% 65%",
        secondary: "120 20% 18%",
        card: "120 25% 13%",
        border: "120 20% 22%",
        muted: "120 20% 18%",
        sidebarBackground: "120 25% 8%",
        sidebarForeground: "120 60% 90%",
        sidebarPrimary: "90 50% 65%",
        sidebarPrimaryForeground: "90 50% 20%",
        sidebarAccent: "120 25% 15%",
        sidebarAccentForeground: "120 60% 90%",
        sidebarBorder: "120 25% 18%",
        sidebarRing: "90 50% 65%",
      },
    },
  },
  {
    name: "برتقالي الغروب",
    id: "sunset-orange",
    colors: {
      light: {
        background: "30 100% 97%",
        primary: "25 85% 60%",
        accent: "45 100% 70%",
        secondary: "30 80% 92%",
        card: "30 100% 98%",
        border: "30 60% 88%",
        muted: "30 80% 92%",
        sidebarBackground: "25 85% 50%",
        sidebarForeground: "0 0% 100%",
        sidebarPrimary: "45 100% 70%",
        sidebarPrimaryForeground: "45 70% 25%",
        sidebarAccent: "25 85% 65%",
        sidebarAccentForeground: "0 0% 100%",
        sidebarBorder: "25 85% 45%",
        sidebarRing: "45 100% 70%",
      },
      dark: {
        background: "25 40% 10%",
        primary: "25 85% 70%",
        accent: "45 100% 60%",
        secondary: "25 30% 18%",
        card: "25 40% 13%",
        border: "25 30% 22%",
        muted: "25 30% 18%",
        sidebarBackground: "25 40% 8%",
        sidebarForeground: "30 100% 90%",
        sidebarPrimary: "45 100% 60%",
        sidebarPrimaryForeground: "45 70% 15%",
        sidebarAccent: "25 40% 15%",
        sidebarAccentForeground: "30 100% 90%",
        sidebarBorder: "25 40% 18%",
        sidebarRing: "45 100% 60%",
      },
    },
  },
  {
    name: "بنفسجي ملكي", // This was the ID the user previously had potentially selected from settings
    id: "royal-purple",
    colors: {
      light: {
        background: "270 100% 97%",
        primary: "270 50% 60%",
        accent: "300 70% 80%",
        secondary: "270 80% 93%",
        card: "270 100% 98%",
        border: "270 60% 88%",
        muted: "270 80% 93%",
        sidebarBackground: "270 50% 50%",
        sidebarForeground: "0 0% 100%",
        sidebarPrimary: "300 70% 80%",
        sidebarPrimaryForeground: "300 70% 30%",
        sidebarAccent: "270 50% 65%",
        sidebarAccentForeground: "0 0% 100%",
        sidebarBorder: "270 50% 45%",
        sidebarRing: "300 70% 80%",
      },
      dark: {
        background: "270 30% 10%",
        primary: "270 50% 70%",
        accent: "300 70% 70%",
        secondary: "270 25% 18%",
        card: "270 30% 13%",
        border: "270 25% 22%",
        muted: "270 25% 18%",
        sidebarBackground: "270 30% 8%",
        sidebarForeground: "270 100% 90%",
        sidebarPrimary: "300 70% 70%",
        sidebarPrimaryForeground: "300 70% 25%",
        sidebarAccent: "270 30% 15%",
        sidebarAccentForeground: "270 100% 90%",
        sidebarBorder: "270 30% 18%",
        sidebarRing: "300 70% 70%",
      },
    },
  },
];

