
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
        background: "175 50% 97%", 
        primary: "145 60% 45%",    
        accent: "205 70% 55%",     
        secondary: "175 40% 90%",   
        card: "0 0% 100%",          
        border: "175 30% 88%",      
        muted: "175 30% 93%",       
        sidebarBackground: "170 40% 94%", 
        sidebarForeground: "170 35% 25%", 
        sidebarPrimary: "145 60% 45%",    
        sidebarPrimaryForeground: "0 0% 100%", 
        sidebarAccent: "170 35% 90%",    
        sidebarAccentForeground: "170 35% 20%", 
        sidebarBorder: "170 30% 85%",      
        sidebarRing: "145 60% 50%",       
      },
      dark: {
        background: "190 15% 8%",  
        primary: "140 65% 50%",    
        accent: "200 75% 55%",     
        secondary: "190 12% 12%",   
        card: "190 15% 11%",       
        border: "190 10% 18%",      
        muted: "190 10% 22%",       
        sidebarBackground: "190 14% 10%", 
        sidebarForeground: "190 15% 88%", 
        sidebarPrimary: "140 65% 50%",    
        sidebarPrimaryForeground: "0 0% 100%", 
        sidebarAccent: "190 12% 15%",    
        sidebarAccentForeground: "190 15% 92%", 
        sidebarBorder: "190 10% 7%",      
        sidebarRing: "140 65% 55%",       
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
        background: "270 100% 97%", // Very light lavender
        primary: "330 85% 60%",    // Vibrant Pink/Magenta (for primary actions)
        accent: "180 75% 70%",     // Softer Cyan (for accents)
        secondary: "270 80% 93%",   // Light muted lavender
        card: "270 100% 98%",       // Almost white lavender
        border: "270 60% 88%",      // Light greyish purple
        muted: "270 80% 93%",       // Greyish purple
        // Sidebar for light Royal Purple
        sidebarBackground: "270 60% 95%", // Lighter purple sidebar
        sidebarForeground: "270 40% 25%", // Darker text
        sidebarPrimary: "330 85% 60%",    // Pink primary for active/hover
        sidebarPrimaryForeground: "0 0% 100%", // White text on pink
        sidebarAccent: "270 60% 90%",    // Lighter hover
        sidebarAccentForeground: "270 40% 20%", // Darker text on hover
        sidebarBorder: "270 50% 88%",      // Subtle border
        sidebarRing: "330 85% 65%",       // Pink ring
      },
      dark: {
        background: "270 30% 10%", // Very dark purple (almost black)
        primary: "330 80% 65%",    // Vibrant Pink/Magenta (for buttons, active sidebar)
        accent: "180 70% 55%",     // Bright Cyan/Turquoise (for other buttons, accents)
        secondary: "270 25% 18%",   // Muted dark purple (for gradients with primary)
        card: "270 30% 13%",       // Dark purple card, slightly lighter than bg
        border: "270 25% 22%",      // Subtle border
        muted: "270 25% 18%",       // Muted text/elements
        // Sidebar for dark Royal Purple
        sidebarBackground: "270 30% 8%",  // Even darker purple for sidebar
        sidebarForeground: "270 100% 90%",// Light text
        sidebarPrimary: "330 80% 65%",    // Pink primary for active item
        sidebarPrimaryForeground: "0 0% 100%", // White text on active
        sidebarAccent: "270 30% 15%",    // Hover for sidebar items
        sidebarAccentForeground: "270 100% 90%", // Light text on hover
        sidebarBorder: "270 30% 18%",      // Border for sidebar
        sidebarRing: "330 80% 65%",       // Pink ring for focus
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
];


    
