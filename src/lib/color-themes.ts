
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
      // Optional gradient properties
      appBackgroundGradient?: string;
      sidebarBackgroundGradient?: string;
      primaryGradient?: string;
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
      // Optional gradient properties
      appBackgroundGradient?: string;
      sidebarBackgroundGradient?: string;
      primaryGradient?: string;
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
        background: "270 100% 97%", 
        primary: "330 85% 60%",    
        accent: "180 75% 70%",     
        secondary: "270 80% 93%",   
        card: "270 100% 98%",       
        border: "270 60% 88%",      
        muted: "270 80% 93%",       
        sidebarBackground: "270 60% 95%", 
        sidebarForeground: "270 40% 25%", 
        sidebarPrimary: "330 85% 60%",    
        sidebarPrimaryForeground: "0 0% 100%", 
        sidebarAccent: "270 60% 90%",    
        sidebarAccentForeground: "270 40% 20%", 
        sidebarBorder: "270 50% 88%",      
        sidebarRing: "330 85% 65%",       
      },
      dark: {
        background: "270 30% 10%", 
        primary: "330 80% 65%",    
        accent: "180 70% 55%",     
        secondary: "270 25% 18%",   
        card: "270 30% 13%",       
        border: "270 25% 22%",      
        muted: "270 25% 18%",       
        sidebarBackground: "270 30% 8%",  
        sidebarForeground: "270 100% 90%",
        sidebarPrimary: "330 80% 65%",    
        sidebarPrimaryForeground: "0 0% 100%", 
        sidebarAccent: "270 30% 15%",    
        sidebarAccentForeground: "270 100% 90%", 
        sidebarBorder: "270 30% 18%",      
        sidebarRing: "330 80% 65%",       
      },
    },
  },
  {
    name: "شروق ديناميكي",
    id: "dynamic-sunrise",
    colors: {
      light: {
        background: "45 100% 98%", // Very light, almost white yellow
        primary: "35 90% 60%",    // Vibrant Orange
        accent: "50 95% 55%",     // Bright Yellow
        secondary: "20 80% 88%",   // Soft Peach for gradients
        card: "0 0% 100%",          // White cards
        border: "30 50% 85%",      // Light warm grey border
        muted: "30 50% 90%",       // Muted warm grey
        sidebarBackground: "30 85% 95%", // Light peach sidebar
        sidebarForeground: "25 50% 30%", // Darker warm text
        sidebarPrimary: "35 90% 60%",    // Orange for active items
        sidebarPrimaryForeground: "0 0% 100%", // White text on orange
        sidebarAccent: "30 80% 90%",    // Lighter peach hover
        sidebarAccentForeground: "25 50% 25%", // Darker warm text on hover
        sidebarBorder: "30 70% 88%",      // Warm border
        sidebarRing: "35 90% 65%",       // Orange ring
        appBackgroundGradient: "linear-gradient(135deg, hsl(50, 100%, 90%), hsl(30, 100%, 88%))", // Light Yellow to Pale Orange
        sidebarBackgroundGradient: "linear-gradient(180deg, hsl(35, 95%, 92%), hsl(25, 90%, 90%))", // Subtle warm gradient
      },
      dark: {
        background: "25 30% 8%",  // Very dark warm brown
        primary: "30 90% 65%",    // Vibrant Orange
        accent: "45 100% 60%",     // Bright Yellow
        secondary: "20 40% 15%",   // Darker warm brown for gradients
        card: "25 30% 12%",       // Dark warm brown card
        border: "25 20% 20%",      // Subtle warm border
        muted: "25 20% 15%",       // Muted dark brown
        sidebarBackground: "20 35% 6%",  // Even darker warm brown for sidebar
        sidebarForeground: "30 80% 85%", // Light warm text
        sidebarPrimary: "30 90% 65%",    // Orange for active items
        sidebarPrimaryForeground: "0 0% 100%", // White text
        sidebarAccent: "20 30% 10%",    // Hover for sidebar items
        sidebarAccentForeground: "30 80% 90%", // Light warm text on hover
        sidebarBorder: "20 30% 12%",      // Dark warm border
        sidebarRing: "30 90% 70%",       // Orange ring
        appBackgroundGradient: "linear-gradient(135deg, hsl(25, 40%, 10%), hsl(200, 30%, 8%))", // Dark Warm Brown to Very Dark Desaturated Blue
        sidebarBackgroundGradient: "linear-gradient(180deg, hsl(25, 30%, 9%), hsl(20, 25%, 7%))", // Subtle dark warm gradient
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
    
