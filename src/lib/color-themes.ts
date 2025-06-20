
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
      light: { 
        background: "250 20% 98%", 
        primary: "275 70% 55%",    
        accent: "300 70% 60%",     
        secondary: "275 60% 90%",   
        card: "0 0% 100%",          
        border: "250 15% 88%",      
        muted: "250 15% 94%",       
        sidebarBackground: "275 50% 96%", 
        sidebarForeground: "275 50% 25%", 
        sidebarPrimary: "275 70% 55%",    
        sidebarPrimaryForeground: "0 0% 100%", 
        sidebarAccent: "275 50% 92%",    
        sidebarAccentForeground: "275 50% 20%", 
        sidebarBorder: "275 40% 90%",      
        sidebarRing: "275 70% 60%",       
      },
      dark: { 
        background: "250 10% 10%", 
        primary: "275 75% 65%",    
        accent: "300 80% 70%",     
        secondary: "250 10% 25%",   
        card: "250 10% 15%",       
        border: "250 10% 20%",      
        muted: "250 10% 20%",       
        sidebarBackground: "250 12% 12%", 
        sidebarForeground: "250 15% 95%", 
        sidebarPrimary: "275 75% 65%",    
        sidebarPrimaryForeground: "0 0% 100%", 
        sidebarAccent: "250 10% 20%",    
        sidebarAccentForeground: "250 15% 95%", 
        sidebarBorder: "250 10% 10%",      
        sidebarRing: "275 75% 70%",       
      },
    },
  },
  {
    name: "وردي عصري",
    id: "modern-pink",
    colors: {
      light: {
        background: "345 100% 97%", 
        primary: "335 85% 60%",    
        accent: "340 90% 68%",     
        secondary: "340 70% 92%",   
        card: "0 0% 100%",          
        border: "345 50% 90%",      
        muted: "345 60% 93%",       
        sidebarBackground: "330 70% 95%", 
        sidebarForeground: "330 30% 25%", 
        sidebarPrimary: "335 85% 60%",    
        sidebarPrimaryForeground: "0 0% 100%", 
        sidebarAccent: "330 60% 90%",    
        sidebarAccentForeground: "330 30% 20%", 
        sidebarBorder: "330 50% 88%",      
        sidebarRing: "335 85% 65%",       
      },
      dark: {
        background: "330 15% 10%", 
        primary: "335 80% 65%",    
        accent: "340 85% 70%",     
        secondary: "330 15% 20%",   
        card: "330 15% 14%",       
        border: "330 10% 25%",      
        muted: "330 10% 22%",       
        sidebarBackground: "330 12% 12%", 
        sidebarForeground: "330 20% 90%", 
        sidebarPrimary: "335 80% 65%",    
        sidebarPrimaryForeground: "0 0% 100%", 
        sidebarAccent: "330 15% 22%",    
        sidebarAccentForeground: "330 20% 95%", 
        sidebarBorder: "330 10% 10%",      
        sidebarRing: "335 80% 70%",       
      },
    },
  },
  {
    name: "زمردي داكن",
    id: "dark-emerald",
    colors: {
      light: {
        background: "175 50% 97%", // Very light cyan/teal
        primary: "145 60% 45%",    // Vibrant green (slightly desaturated for light)
        accent: "205 70% 55%",     // Bright blue (slightly desaturated for light)
        secondary: "175 40% 90%",   // Soft, light cyan/teal
        card: "0 0% 100%",          // White cards
        border: "175 30% 88%",      // Soft cyan/teal border
        muted: "175 30% 93%",       // Muted light cyan/teal
        sidebarBackground: "170 40% 94%", // Light slightly desaturated teal/cyan for sidebar
        sidebarForeground: "170 35% 25%", // Dark, desaturated teal text
        sidebarPrimary: "145 60% 45%",    // Same vibrant green
        sidebarPrimaryForeground: "0 0% 100%", // White text on primary
        sidebarAccent: "170 35% 90%",    // Lighter cyan/teal for hover
        sidebarAccentForeground: "170 35% 20%", // Darker text on hover
        sidebarBorder: "170 30% 85%",      // Soft sidebar border
        sidebarRing: "145 60% 50%",       // Primary green for focus rings
      },
      dark: {
        background: "190 15% 8%",  // Very dark, slightly desaturated blue-green/teal
        primary: "140 65% 50%",    // Vibrant, almost neon green
        accent: "200 75% 55%",     // Bright blue
        secondary: "190 12% 12%",   // Muted dark teal for secondary elements or gradient stop
        card: "190 15% 11%",       // Slightly lighter than main dark background, dark teal
        border: "190 10% 18%",      // Subtle dark teal border
        muted: "190 10% 22%",       // Muted dark teal color
        sidebarBackground: "190 14% 10%", // Distinct dark shade for sidebar, similar to cards
        sidebarForeground: "190 15% 88%", // Light, slightly desaturated cyan/off-white text
        sidebarPrimary: "140 65% 50%",    // Vibrant green
        sidebarPrimaryForeground: "0 0% 100%", // White text on primary
        sidebarAccent: "190 12% 15%",    // Slightly lighter dark color for hover
        sidebarAccentForeground: "190 15% 92%", // Text on hover
        sidebarBorder: "190 10% 7%",      // Darker border for sidebar
        sidebarRing: "140 65% 55%",       // Ring color (primary green)
      },
    },
  },
  {
    name: "أزرق افتراضي (نظام)",
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
        background: "208 20% 10%", // Default dark mode background
        primary: "207 82% 68%",    // Default dark mode primary (kept same as light for this specific "default blue")
        accent: "45 100% 85%",     // Default dark mode accent (kept same)
        secondary: "208 20% 20%",   // Darker secondary for dark mode
        card: "208 20% 15%",       // Darker card for dark mode
        border: "208 20% 25%",      // Darker border
        muted: "208 20% 20%",       // Darker muted
        sidebarBackground: "208 20% 8%", // Darker sidebar background
        sidebarForeground: "208 100% 97%", // Light text for dark sidebar
        sidebarPrimary: "45 100% 85%",    // Accent as primary in dark sidebar
        sidebarPrimaryForeground: "45 70% 25%", // Dark text on accent
        sidebarAccent: "208 20% 18%",    // Darker hover for sidebar
        sidebarAccentForeground: "208 100% 97%", // Light text on hover
        sidebarBorder: "208 20% 22%",      // Darker sidebar border
        sidebarRing: "45 100% 85%",       // Accent for ring
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
    name: "بنفسجي ملكي",
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


    