
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
      cardBackgroundGradient?: string;
      primaryGradient?: string; // For general element backgrounds
      // Optional text gradient properties
      primaryTextGradient?: string;
      accentTextGradient?: string;
      secondaryTextGradient?: string;
      foregroundTextGradient?: string;
      // Specific HEX/gradient stops from user's theme
      // For Atmety Tech theme (HEX or full gradient strings)
      userGradientStart?: string;
      userGradientEnd?: string;
      userGradientAccentStart?: string;
      userGradientAccentEnd?: string;
      userGradientRedStart?: string;
      userGradientRedEnd?: string;
      userTextPrimary?: string;
      userTextSecondary?: string;
      userBorderColor?: string;
      userPrimaryBg?: string;
      userSecondaryBg?: string;
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
      cardBackgroundGradient?: string;
      primaryGradient?: string; // For general element backgrounds
      // Optional text gradient properties
      primaryTextGradient?: string;
      accentTextGradient?: string;
      secondaryTextGradient?: string;
      foregroundTextGradient?: string;
      // Specific HEX/gradient stops from user's theme
      // For Atmety Tech theme (HEX or full gradient strings)
      userGradientStart?: string;
      userGradientEnd?: string;
      userGradientAccentStart?: string;
      userGradientAccentEnd?: string;
      userGradientRedStart?: string;
      userGradientRedEnd?: string;
      userTextPrimary?: string;
      userTextSecondary?: string;
      userBorderColor?: string;
      userPrimaryBg?: string;
      userSecondaryBg?: string;
    };
  };
}

export const predefinedThemes: ColorTheme[] = [
  {
    name: "Atmety Tech",
    id: "atmety-tech",
    colors: {
      light: { 
        background: "220 100% 97%", 
        primary: "270 85% 60%",    
        accent: "330 90% 65%",     
        secondary: "220 70% 92%",   
        card: "0 0% 100%",          
        border: "220 50% 90%",      
        muted: "220 60% 93%",       
        sidebarBackground: "220 70% 95%", 
        sidebarForeground: "270 40% 35%", 
        sidebarPrimary: "270 85% 60%",    
        sidebarPrimaryForeground: "0 0% 100%", 
        sidebarAccent: "220 60% 90%",    
        sidebarAccentForeground: "270 30% 30%", 
        sidebarBorder: "220 50% 88%",      
        sidebarRing: "270 85% 65%",
        appBackgroundGradient: "linear-gradient(to bottom right, #e0f7fa, #e8eaf6)",
        sidebarBackgroundGradient: "linear-gradient(to bottom, #f1f5f9, #e8eaf6)",
        cardBackgroundGradient: "linear-gradient(to bottom right, #ffffff, #f9fafb)",
        primaryTextGradient: "linear-gradient(to right, #6200ea, #3700b3)", 
        accentTextGradient: "linear-gradient(to right, #E91E63, #018786)",
        secondaryTextGradient: "linear-gradient(to right, #e0e0e0, #bdbdbd)",
        foregroundTextGradient: "linear-gradient(to right, #424242, #616161)",
        userGradientStart: "#D1C4E9", 
        userGradientEnd: "#B2EBF2",   
        userGradientAccentStart: "#F48FB1", 
        userGradientAccentEnd: "#80DEEA",  
        userGradientRedStart: "#FFCC80",   
        userGradientRedEnd: "#FFF59D",    
        userTextPrimary: "#212121",        
        userTextSecondary: "#757575",      
        userBorderColor: "#BDBDBD",        
        userPrimaryBg: "#FFFFFF",          
        userSecondaryBg: "#F5F5F5",        
      },
      dark: { 
        background: "222 47% 11%", 
        primary: "260 80% 60%",    
        accent: "300 100% 60%",     
        secondary: "187 89% 31%",   
        card: "222 30% 15%",       
        border: "215 28% 35%",      
        muted: "222 20% 20%",       
        sidebarBackground: "222 30% 15%", 
        sidebarForeground: "#E0E0E0", 
        sidebarPrimary: "#fc00ff",    
        sidebarPrimaryForeground: "#FFFFFF", 
        sidebarAccent: "#4A5568",    
        sidebarAccentForeground: "#E0E0E0", 
        sidebarBorder: "222 20% 10%",      
        sidebarRing: "#fc00ff",
        userGradientStart: "#360033",
        userGradientEnd: "#0b8793",
        userGradientAccentStart: "#fc00ff",
        userGradientAccentEnd: "#00dbde",
        userGradientRedStart: "#FF8008",
        userGradientRedEnd: "#FFC837",
        userTextPrimary: "#E0E0E0",
        userTextSecondary: "#BDBDBD",
        userBorderColor: "#4A5568",
        userPrimaryBg: "#1A202C",
        userSecondaryBg: "#2D3748",
        appBackgroundGradient: "linear-gradient(to bottom right, var(--user-gradient-start, #360033), var(--user-gradient-end, #0b8793))",
        sidebarBackgroundGradient: "linear-gradient(to bottom, var(--user-secondary-bg, #2D3748), var(--user-primary-bg, #1A202C))",
        cardBackgroundGradient: "linear-gradient(to bottom right, var(--user-secondary-bg, #2D3748), var(--user-primary-bg, #1A202C))",
        primaryTextGradient: "linear-gradient(to right, var(--user-gradient-accent-start, #fc00ff), var(--user-gradient-accent-end, #00dbde))",
        accentTextGradient: "linear-gradient(to right, var(--user-gradient-red-start, #FF8008), var(--user-gradient-red-end, #FFC837))",
        secondaryTextGradient: "linear-gradient(to right, var(--user-text-secondary, #BDBDBD), var(--user-text-primary, #E0E0E0))",
        foregroundTextGradient: "linear-gradient(to right, var(--user-text-primary, #E0E0E0), var(--user-text-secondary, #BDBDBD))",
      },
    },
  },
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
        appBackgroundGradient: "linear-gradient(to bottom right, hsl(250, 60%, 98%), hsl(275, 60%, 95%))",
        sidebarBackgroundGradient: "linear-gradient(to bottom, hsl(275, 60%, 95%), hsl(275, 40%, 90%))",
        cardBackgroundGradient: "linear-gradient(to bottom right, hsl(0, 0%, 100%), hsl(270, 40%, 98%))",
        primaryTextGradient: "linear-gradient(to right, hsl(275, 80%, 55%), hsl(300, 70%, 60%))",
        accentTextGradient: "linear-gradient(to right, hsl(300, 70%, 58%), hsl(275, 60%, 68%))",
        secondaryTextGradient: "linear-gradient(to right, hsl(275, 40%, 35%), hsl(275, 30%, 40%))",
        foregroundTextGradient: "linear-gradient(to right, hsl(275, 30%, 30%), hsl(275, 30%, 35%))",
        userGradientAccentStart: "hsl(275, 70%, 55%)",
        userGradientAccentEnd: "hsl(300, 70%, 60%)",
        userGradientRedStart: "hsl(0, 80%, 60%)",
        userGradientRedEnd: "hsl(350, 80%, 65%)"
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
        appBackgroundGradient: "linear-gradient(to bottom right, hsl(250, 20%, 8%), hsl(275, 20%, 12%))",
        sidebarBackgroundGradient: "linear-gradient(to bottom, hsl(250, 15%, 10%), hsl(275, 15%, 14%))",
        cardBackgroundGradient: "linear-gradient(to bottom right, hsl(250, 15%, 12%), hsl(250, 10%, 18%))",
        primaryTextGradient: "linear-gradient(to right, hsl(275, 80%, 65%), hsl(300, 80%, 70%))",
        accentTextGradient: "linear-gradient(to right, hsl(300, 80%, 68%), hsl(275, 70%, 75%))",
        secondaryTextGradient: "linear-gradient(to right, hsl(250, 20%, 85%), hsl(250, 15%, 75%))",
        foregroundTextGradient: "linear-gradient(to right, hsl(250, 25%, 92%), hsl(0, 0%, 100%))",
        userGradientAccentStart: "hsl(275, 75%, 65%)",
        userGradientAccentEnd: "hsl(300, 80%, 70%)",
        userGradientRedStart: "hsl(0, 70%, 60%)",
        userGradientRedEnd: "hsl(350, 70%, 65%)"
      }
    }
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
        appBackgroundGradient: "linear-gradient(to bottom right, hsl(345, 95%, 96%), hsl(335, 80%, 94%), hsl(330, 70%, 93%))",
        sidebarBackgroundGradient: "linear-gradient(to bottom, hsl(330, 70%, 94%), hsl(340, 65%, 90%))",
        cardBackgroundGradient: "linear-gradient(to bottom right, hsl(0, 0%, 100%), hsl(335, 50%, 98%))",
        primaryTextGradient: "linear-gradient(to right, hsl(335, 85%, 55%), hsl(340, 90%, 62%))",
        accentTextGradient: "linear-gradient(to right, hsl(340, 90%, 62%), hsl(330, 80%, 72%))",
        secondaryTextGradient: "linear-gradient(to right, hsl(330, 30%, 30%), hsl(330, 25%, 40%))",
        foregroundTextGradient: "linear-gradient(to right, hsl(330, 30%, 20%), hsl(330, 25%, 35%))",
        userGradientAccentStart: "hsl(335, 85%, 60%)",
        userGradientAccentEnd: "hsl(340, 90%, 68%)",
        userGradientRedStart: "hsl(0, 80%, 65%)",
        userGradientRedEnd: "hsl(350, 85%, 70%)"
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
        appBackgroundGradient: "linear-gradient(to bottom right, hsl(330, 15%, 8%), hsl(340, 20%, 12%), hsl(345, 25%, 15%))",
        sidebarBackgroundGradient: "linear-gradient(to bottom, hsl(330, 12%, 10%), hsl(340, 15%, 14%))",
        cardBackgroundGradient: "linear-gradient(to bottom right, hsl(330, 15%, 14%), hsl(330, 15%, 18%))",
        primaryTextGradient: "linear-gradient(to right, hsl(335, 80%, 60%), hsl(340, 85%, 65%))",
        accentTextGradient: "linear-gradient(to right, hsl(340, 85%, 65%), hsl(330, 75%, 75%))",
        secondaryTextGradient: "linear-gradient(to right, hsl(330, 20%, 80%), hsl(330, 15%, 70%))",
        foregroundTextGradient: "linear-gradient(to right, hsl(330, 20%, 85%), hsl(0, 0%, 100%))",
        userGradientAccentStart: "hsl(335, 80%, 65%)",
        userGradientAccentEnd: "hsl(340, 85%, 70%)",
        userGradientRedStart: "hsl(0, 75%, 60%)",
        userGradientRedEnd: "hsl(350, 75%, 65%)"
      }
    }
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
        appBackgroundGradient: "linear-gradient(to bottom right, hsl(175, 60%, 96%), hsl(165, 50%, 94%), hsl(160, 45%, 92%))",
        sidebarBackgroundGradient: "linear-gradient(to bottom, hsl(170, 40%, 92%), hsl(165, 45%, 90%))",
        cardBackgroundGradient: "linear-gradient(to bottom right, hsl(0, 0%, 100%), hsl(170, 40%, 98%))",
        primaryTextGradient: "linear-gradient(to right, hsl(145, 60%, 40%), hsl(150, 65%, 42%))",
        accentTextGradient: "linear-gradient(to right, hsl(205, 70%, 52%), hsl(210, 75%, 55%))",
        secondaryTextGradient: "linear-gradient(to right, hsl(170, 35%, 30%), hsl(165, 30%, 40%))",
        foregroundTextGradient: "linear-gradient(to right, hsl(170, 30%, 20%), hsl(170, 25%, 35%))",
        userGradientAccentStart: "hsl(145, 60%, 45%)",
        userGradientAccentEnd: "hsl(150, 65%, 48%)",
        userGradientRedStart: "hsl(0, 70%, 60%)",
        userGradientRedEnd: "hsl(10, 70%, 62%)"
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
        appBackgroundGradient: "linear-gradient(to bottom right, hsl(190, 15%, 7%), hsl(180, 20%, 10%), hsl(170, 25%, 12%))",
        sidebarBackgroundGradient: "linear-gradient(to bottom, hsl(190, 14%, 9%), hsl(180, 18%, 12%))",
        cardBackgroundGradient: "linear-gradient(to bottom right, hsl(190, 15%, 11%), hsl(185, 18%, 13%))",
        primaryTextGradient: "linear-gradient(to right, hsl(140, 65%, 45%), hsl(145, 70%, 48%))",
        accentTextGradient: "linear-gradient(to right, hsl(200, 75%, 52%), hsl(205, 80%, 55%))",
        secondaryTextGradient: "linear-gradient(to right, hsl(190, 15%, 78%), hsl(185, 10%, 68%))",
        foregroundTextGradient: "linear-gradient(to right, hsl(190, 20%, 85%), hsl(0, 0%, 100%))",
        userGradientAccentStart: "hsl(140, 65%, 50%)",
        userGradientAccentEnd: "hsl(145, 70%, 53%)",
        userGradientRedStart: "hsl(0, 60%, 55%)",
        userGradientRedEnd: "hsl(10, 60%, 58%)"
      }
    }
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
        muted: "30 80% 93%",
        sidebarBackground: "30 85% 96%",
        sidebarForeground: "30 40% 20%",
        sidebarPrimary: "25 85% 60%",
        sidebarPrimaryForeground: "0 0% 100%",
        sidebarAccent: "45 100% 70%",
        sidebarAccentForeground: "45 60% 25%",
        sidebarBorder: "30 60% 85%",
        sidebarRing: "25 85% 65%",
        appBackgroundGradient: "linear-gradient(to bottom right, hsl(30, 100%, 96%), hsl(35, 95%, 94%), hsl(40, 90%, 92%))",
        sidebarBackgroundGradient: "linear-gradient(to bottom, hsl(30, 90%, 94%), hsl(30, 85%, 91%))",
        cardBackgroundGradient: "linear-gradient(to bottom right, hsl(30, 100%, 98%), hsl(30, 90%, 95%))",
        primaryTextGradient: "linear-gradient(to right, hsl(25, 85%, 58%), hsl(35, 90%, 60%))",
        accentTextGradient: "linear-gradient(to right, hsl(45, 100%, 65%), hsl(40, 95%, 70%))",
        secondaryTextGradient: "linear-gradient(to right, hsl(30, 60%, 30%), hsl(30, 50%, 40%))",
        foregroundTextGradient: "linear-gradient(to right, hsl(30, 60%, 25%), hsl(30, 50%, 35%))",
        userGradientAccentStart: "hsl(25, 85%, 60%)",
        userGradientAccentEnd: "hsl(45, 100%, 70%)",
        userGradientRedStart: "hsl(10, 90%, 60%)",
        userGradientRedEnd: "hsl(0, 90%, 65%)",
      },
      dark: {
        background: "25 30% 10%",
        primary: "25 85% 68%",
        accent: "45 100% 60%",
        secondary: "25 20% 16%",
        card: "25 30% 14%",
        border: "25 20% 22%",
        muted: "25 20% 20%",
        sidebarBackground: "25 25% 10%",
        sidebarForeground: "30 90% 88%",
        sidebarPrimary: "25 85% 68%",
        sidebarPrimaryForeground: "0 0% 100%",
        sidebarAccent: "45 100% 60%",
        sidebarAccentForeground: "45 70% 15%",
        sidebarBorder: "25 20% 18%",
        sidebarRing: "25 85% 70%",
        appBackgroundGradient: "linear-gradient(to bottom right, hsl(25, 25%, 9%), hsl(30, 30%, 11%), hsl(35, 35%, 13%))",
        sidebarBackgroundGradient: "linear-gradient(to bottom, hsl(25, 25%, 9%), hsl(30, 25%, 11%))",
        cardBackgroundGradient: "linear-gradient(to bottom right, hsl(25, 30%, 14%), hsl(30, 25%, 15%))",
        primaryTextGradient: "linear-gradient(to right, hsl(25, 85%, 65%), hsl(35, 90%, 68%))",
        accentTextGradient: "linear-gradient(to right, hsl(45, 100%, 60%), hsl(40, 95%, 62%))",
        secondaryTextGradient: "linear-gradient(to right, hsl(30, 80%, 80%), hsl(30, 60%, 70%))",
        foregroundTextGradient: "linear-gradient(to right, hsl(30, 90%, 85%), hsl(0, 0%, 100%))",
        userGradientAccentStart: "hsl(25, 85%, 70%)",
        userGradientAccentEnd: "hsl(45, 100%, 65%)",
        userGradientRedStart: "hsl(10, 80%, 60%)",
        userGradientRedEnd: "hsl(0, 80%, 65%)",
      },
    },
  },
  {
    name: "بنفسجي ملكي",
    id: "royal-purple",
    colors: {
      light: {
        background: "270 100% 97%",
        primary: "300 80% 60%",
        accent: "200 70% 65%",
        secondary: "270 80% 93%",
        card: "270 100% 98%",
        border: "270 60% 88%",
        muted: "270 80% 94%",
        sidebarBackground: "270 60% 95%",
        sidebarForeground: "270 40% 25%",
        sidebarPrimary: "300 80% 60%",
        sidebarPrimaryForeground: "0 0% 100%",
        sidebarAccent: "270 60% 90%",
        sidebarAccentForeground: "270 40% 20%",
        sidebarBorder: "270 50% 88%",
        sidebarRing: "300 80% 65%",
        appBackgroundGradient: "linear-gradient(135deg, hsl(270, 100%, 96%), hsl(290, 85%, 94%), hsl(310, 75%, 92%))",
        sidebarBackgroundGradient: "linear-gradient(180deg, hsl(270, 60%, 93%), hsl(285, 55%, 91%))",
        cardBackgroundGradient: "linear-gradient(135deg, hsl(270, 100%, 98%), hsl(280, 90%, 97%))",
        primaryTextGradient: "linear-gradient(135deg, hsl(300, 80%, 55%), hsl(320, 75%, 60%))",
        accentTextGradient: "linear-gradient(135deg, hsl(200, 70%, 62%), hsl(220, 75%, 67%))",
        secondaryTextGradient: "linear-gradient(to right, hsl(270, 40%, 30%), hsl(270, 35%, 40%))",
        foregroundTextGradient: "linear-gradient(to right, hsl(270, 40%, 25%), hsl(270, 35%, 35%))",
        userGradientAccentStart: "hsl(300, 80%, 60%)",
        userGradientAccentEnd: "hsl(320, 75%, 65%)",
        userGradientRedStart: "hsl(0, 80%, 65%)",
        userGradientRedEnd: "hsl(350, 85%, 70%)"
      },
      dark: {
        background: "270 30% 10%",
        primary: "300 75% 65%",
        accent: "200 70% 55%",
        secondary: "270 25% 18%",
        card: "270 30% 13%",
        border: "270 25% 22%",
        muted: "270 25% 18%",
        sidebarBackground: "270 30% 8%",
        sidebarForeground: "270 100% 90%",
        sidebarPrimary: "300 75% 65%",
        sidebarPrimaryForeground: "0 0% 100%",
        sidebarAccent: "270 30% 15%",
        sidebarAccentForeground: "270 100% 90%",
        sidebarBorder: "270 30% 18%",
        sidebarRing: "300 75% 65%",
        appBackgroundGradient: "linear-gradient(135deg, hsl(270, 30%, 9%), hsl(290, 35%, 11%), hsl(310, 30%, 13%))",
        sidebarBackgroundGradient: "linear-gradient(180deg, hsl(270, 30%, 7%), hsl(285, 25%, 10%))",
        cardBackgroundGradient: "linear-gradient(135deg, hsl(270, 30%, 13%), hsl(280, 25%, 14%))",
        primaryTextGradient: "linear-gradient(135deg, hsl(300, 75%, 60%), hsl(320, 70%, 65%))",
        accentTextGradient: "linear-gradient(135deg, hsl(200, 70%, 50%), hsl(220, 75%, 55%))",
        secondaryTextGradient: "linear-gradient(to right, hsl(270, 100%, 80%), hsl(270, 80%, 70%))",
        foregroundTextGradient: "linear-gradient(to right, hsl(270, 100%, 85%), hsl(0, 0%, 100%))",
        userGradientAccentStart: "hsl(300, 75%, 65%)",
        userGradientAccentEnd: "hsl(320, 70%, 70%)",
        userGradientRedStart: "hsl(0, 70%, 60%)",
        userGradientRedEnd: "hsl(350, 70%, 65%)"
      }
    }
  },
  {
    name: "شروق ديناميكي",
    id: "dynamic-sunrise",
    colors: {
      light: {
        background: "32 100% 97%",
        primary: "20 95% 60%",
        accent: "40 100% 65%",
        secondary: "30 90% 90%",
        card: "0 0% 100%",
        border: "30 60% 85%",
        muted: "30 60% 93%",
        sidebarBackground: "30 85% 95%",
        sidebarForeground: "30 30% 25%",
        sidebarPrimary: "20 95% 60%",
        sidebarPrimaryForeground: "0 0% 100%",
        sidebarAccent: "40 100% 85%",
        sidebarAccentForeground: "30 30% 20%",
        sidebarBorder: "30 50% 80%",
        sidebarRing: "20 95% 65%",
        appBackgroundGradient: "linear-gradient(to bottom right, hsl(30, 100%, 96%), hsl(20, 90%, 94%), hsl(40, 100%, 92%))",
        sidebarBackgroundGradient: "linear-gradient(to bottom, hsl(30, 85%, 93%), hsl(40, 80%, 90%))",
        cardBackgroundGradient: "linear-gradient(135deg, hsl(0, 0%, 100%), hsl(40, 80%, 98%))",
        primaryTextGradient: "linear-gradient(to right, hsl(20, 95%, 55%), hsl(35, 90%, 60%))",
        accentTextGradient: "linear-gradient(to right, hsl(40, 100%, 60%), hsl(45, 95%, 65%))",
        secondaryTextGradient: "linear-gradient(to right, hsl(30, 30%, 30%), hsl(30, 25%, 40%))",
        foregroundTextGradient: "linear-gradient(to right, hsl(30, 30%, 25%), hsl(30, 25%, 35%))",
        userGradientAccentStart: "hsl(20, 95%, 60%)",
        userGradientAccentEnd: "hsl(40, 100%, 65%)",
        userGradientRedStart: "hsl(5, 80%, 60%)",
        userGradientRedEnd: "hsl(355, 85%, 65%)"
      },
      dark: {
        background: "30 30% 10%",
        primary: "20 95% 70%",
        accent: "40 100% 60%",
        secondary: "30 20% 18%",
        card: "30 30% 13%",
        border: "30 20% 22%",
        muted: "30 20% 18%",
        sidebarBackground: "30 25% 8%",
        sidebarForeground: "30 100% 90%",
        sidebarPrimary: "20 95% 70%",
        sidebarPrimaryForeground: "0 0% 100%",
        sidebarAccent: "40 100% 65%",
        sidebarAccentForeground: "30 100% 90%",
        sidebarBorder: "30 25% 18%",
        sidebarRing: "20 95% 70%",
        appBackgroundGradient: "linear-gradient(to bottom right, hsl(30, 30%, 9%), hsl(20, 35%, 11%), hsl(40, 30%, 12%))",
        sidebarBackgroundGradient: "linear-gradient(to bottom, hsl(30, 25%, 7%), hsl(35, 20%, 9%))",
        cardBackgroundGradient: "linear-gradient(135deg, hsl(30, 30%, 13%), hsl(20, 30%, 12%))",
        primaryTextGradient: "linear-gradient(to right, hsl(20, 95%, 65%), hsl(35, 90%, 68%))",
        accentTextGradient: "linear-gradient(to right, hsl(40, 100%, 55%), hsl(45, 95%, 60%))",
        secondaryTextGradient: "linear-gradient(to right, hsl(30, 100%, 80%), hsl(30, 80%, 70%))",
        foregroundTextGradient: "linear-gradient(to right, hsl(30, 100%, 85%), hsl(0, 0%, 100%))",
        userGradientAccentStart: "hsl(20, 95%, 70%)",
        userGradientAccentEnd: "hsl(40, 100%, 65%)",
        userGradientRedStart: "hsl(5, 80%, 60%)",
        userGradientRedEnd: "hsl(355, 80%, 65%)"
      }
    }
  },
  {
    name: "أخضر متدرج",
    id: "gradient-green",
    colors: {
      light: {
        background: "140 60% 97%",
        primary: "145 70% 50%",
        accent: "160 80% 55%",
        secondary: "135 50% 90%",
        card: "0 0% 100%",
        border: "135 40% 85%",
        muted: "135 40% 93%",
        sidebarBackground: "135 50% 95%",
        sidebarForeground: "145 30% 25%",
        sidebarPrimary: "145 70% 50%",
        sidebarPrimaryForeground: "0 0% 100%",
        sidebarAccent: "160 60% 90%",
        sidebarAccentForeground: "145 30% 20%",
        sidebarBorder: "135 40% 82%",
        sidebarRing: "145 70% 55%",
        appBackgroundGradient: "linear-gradient(to bottom right, hsl(135, 60%, 96%), hsl(150, 55%, 94%), hsl(160, 60%, 92%))",
        sidebarBackgroundGradient: "linear-gradient(to bottom, hsl(135, 50%, 93%), hsl(145, 45%, 90%))",
        cardBackgroundGradient: "linear-gradient(135deg, hsl(0, 0%, 100%), hsl(135, 40%, 98%))",
        primaryTextGradient: "linear-gradient(to right, hsl(145, 70%, 45%), hsl(160, 75%, 50%))",
        accentTextGradient: "linear-gradient(to right, hsl(160, 80%, 50%), hsl(165, 80%, 60%))",
        secondaryTextGradient: "linear-gradient(to right, hsl(145, 30%, 30%), hsl(135, 25%, 40%))",
        foregroundTextGradient: "linear-gradient(to right, hsl(145, 30%, 25%), hsl(135, 25%, 35%))",
        userGradientAccentStart: "hsl(145, 70%, 50%)",
        userGradientAccentEnd: "hsl(160, 80%, 55%)",
        userGradientRedStart: "hsl(0, 70%, 60%)",
        userGradientRedEnd: "hsl(350, 70%, 65%)"
      },
      dark: {
        background: "145 25% 10%",
        primary: "140 70% 60%",
        accent: "160 80% 60%",
        secondary: "145 20% 20%",
        card: "145 25% 13%",
        border: "145 20% 22%",
        muted: "145 20% 18%",
        sidebarBackground: "145 25% 8%",
        sidebarForeground: "140 20% 90%",
        sidebarPrimary: "140 70% 60%",
        sidebarPrimaryForeground: "0 0% 100%",
        sidebarAccent: "160 60% 65%",
        sidebarAccentForeground: "140 20% 95%",
        sidebarBorder: "145 20% 18%",
        sidebarRing: "145 70% 60%",
        appBackgroundGradient: "linear-gradient(to bottom right, hsl(145, 25%, 9%), hsl(160, 25%, 12%), hsl(165, 30%, 14%))",
        sidebarBackgroundGradient: "linear-gradient(to bottom, hsl(145, 25%, 7%), hsl(155, 20%, 10%))",
        cardBackgroundGradient: "linear-gradient(135deg, hsl(145, 25%, 13%), hsl(150, 25%, 12%))",
        primaryTextGradient: "linear-gradient(to right, hsl(140, 70%, 55%), hsl(160, 75%, 58%))",
        accentTextGradient: "linear-gradient(to right, hsl(160, 80%, 55%), hsl(165, 85%, 60%))",
        secondaryTextGradient: "linear-gradient(to right, hsl(140, 100%, 80%), hsl(135, 80%, 70%))",
        foregroundTextGradient: "linear-gradient(to right, hsl(140, 100%, 85%), hsl(0, 0%, 100%))",
        userGradientAccentStart: "hsl(140, 70%, 60%)",
        userGradientAccentEnd: "hsl(160, 80%, 60%)",
        userGradientRedStart: "hsl(0, 65%, 55%)",
        userGradientRedEnd: "hsl(10, 65%, 60%)"
      }
    }
  },
  {
    name: "أزرق متدرج (توت بري)",
    id: "berry-blue",
    colors: {
      light: {
        background: "225 100% 97%",
        primary: "240 70% 55%",
        accent: "265 80% 65%",
        secondary: "230 60% 90%",
        card: "0 0% 100%",
        border: "230 40% 88%",
        muted: "230 40% 94%",
        sidebarBackground: "230 60% 96%",
        sidebarForeground: "240 30% 25%",
        sidebarPrimary: "240 70% 55%",
        sidebarPrimaryForeground: "0 0% 100%",
        sidebarAccent: "265 60% 90%",
        sidebarAccentForeground: "250 30% 20%",
        sidebarBorder: "230 50% 85%",
        sidebarRing: "240 70% 60%",
        appBackgroundGradient: "linear-gradient(to bottom right, hsl(225, 100%, 96%), hsl(240, 70%, 94%), hsl(265, 75%, 92%))",
        sidebarBackgroundGradient: "linear-gradient(to bottom, hsl(230, 60%, 94%), hsl(240, 55%, 91%))",
        cardBackgroundGradient: "linear-gradient(135deg, hsl(0, 0%, 100%), hsl(240, 50%, 98%))",
        primaryTextGradient: "linear-gradient(to right, hsl(240, 70%, 50%), hsl(260, 75%, 55%))",
        accentTextGradient: "linear-gradient(to right, hsl(265, 80%, 60%), hsl(270, 85%, 65%))",
        secondaryTextGradient: "linear-gradient(to right, hsl(230, 30%, 30%), hsl(230, 25%, 40%))",
        foregroundTextGradient: "linear-gradient(to right, hsl(230, 30%, 25%), hsl(230, 25%, 35%))",
        userGradientAccentStart: "hsl(240, 70%, 55%)",
        userGradientAccentEnd: "hsl(265, 80%, 65%)",
        userGradientRedStart: "hsl(340, 70%, 60%)",
        userGradientRedEnd: "hsl(350, 75%, 65%)"
      },
      dark: {
        background: "230 25% 10%",
        primary: "240 80% 65%",
        accent: "265 85% 70%",
        secondary: "230 20% 20%",
        card: "230 25% 13%",
        border: "230 20% 22%",
        muted: "230 20% 18%",
        sidebarBackground: "230 25% 8%",
        sidebarForeground: "230 20% 88%",
        sidebarPrimary: "240 80% 65%",
        sidebarPrimaryForeground: "0 0% 100%",
        sidebarAccent: "265 60% 65%",
        sidebarAccentForeground: "230 20% 95%",
        sidebarBorder: "230 20% 18%",
        sidebarRing: "240 80% 70%",
        appBackgroundGradient: "linear-gradient(to bottom right, hsl(230, 25%, 9%), hsl(250, 30%, 12%), hsl(265, 35%, 14%))",
        sidebarBackgroundGradient: "linear-gradient(to bottom, hsl(230, 25%, 7%), hsl(250, 20%, 9%))",
        cardBackgroundGradient: "linear-gradient(135deg, hsl(230, 25%, 13%), hsl(240, 25%, 12%))",
        primaryTextGradient: "linear-gradient(to right, hsl(240, 80%, 60%), hsl(265, 85%, 63%))",
        accentTextGradient: "linear-gradient(to right, hsl(265, 85%, 60%), hsl(270, 90%, 65%))",
        secondaryTextGradient: "linear-gradient(to right, hsl(230, 100%, 80%), hsl(230, 80%, 70%))",
        foregroundTextGradient: "linear-gradient(to right, hsl(230, 100%, 85%), hsl(0, 0%, 100%))",
        userGradientAccentStart: "hsl(240, 80%, 65%)",
        userGradientAccentEnd: "hsl(265, 85%, 70%)",
        userGradientRedStart: "hsl(340, 70%, 60%)",
        userGradientRedEnd: "hsl(350, 70%, 65%)"
      }
    }
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
        appBackgroundGradient: "hsl(208, 100%, 97%)",
        sidebarBackgroundGradient: "hsl(207, 80%, 55%)",
        cardBackgroundGradient: "hsl(208, 100%, 98%)",
        primaryTextGradient: "linear-gradient(to right, hsl(207, 82%, 60%), hsl(210, 85%, 65%))",
        accentTextGradient: "linear-gradient(to right, hsl(45, 100%, 75%), hsl(50, 100%, 70%))",
        secondaryTextGradient: "linear-gradient(to right, hsl(45, 70%, 40%), hsl(45, 60%, 50%))",
        foregroundTextGradient: "linear-gradient(to right, hsl(45, 70%, 35%), hsl(45, 60%, 45%))",
        userGradientAccentStart: "hsl(207, 82%, 68%)",
        userGradientAccentEnd: "hsl(45, 100%, 85%)",
        userGradientRedStart: "hsl(0, 80%, 60%)",
        userGradientRedEnd: "hsl(350, 80%, 65%)",
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
        appBackgroundGradient: "hsl(208, 20%, 10%)",
        sidebarBackgroundGradient: "hsl(208, 20%, 8%)",
        cardBackgroundGradient: "hsl(208, 20%, 15%)",
        primaryTextGradient: "linear-gradient(to right, hsl(207, 82%, 65%), hsl(210, 85%, 70%))",
        accentTextGradient: "linear-gradient(to right, hsl(45, 100%, 80%), hsl(50, 100%, 75%))",
        secondaryTextGradient: "linear-gradient(to right, hsl(208, 100%, 87%), hsl(208, 80%, 77%))",
        foregroundTextGradient: "linear-gradient(to right, hsl(208, 100%, 92%), hsl(0, 0%, 100%))",
        userGradientAccentStart: "hsl(207, 82%, 68%)",
        userGradientAccentEnd: "hsl(45, 100%, 85%)",
        userGradientRedStart: "hsl(0, 70%, 60%)",
        userGradientRedEnd: "hsl(350, 70%, 65%)",
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
        appBackgroundGradient: "linear-gradient(to bottom right, hsl(120, 60%, 96%), hsl(110, 65%, 94%))",
        sidebarBackgroundGradient: "linear-gradient(to bottom, hsl(120, 39%, 40%), hsl(115, 42%, 35%))",
        cardBackgroundGradient: "hsl(120, 60%, 98%)",
        primaryTextGradient: "linear-gradient(to right, hsl(120, 39%, 50%), hsl(110, 42%, 55%))",
        accentTextGradient: "linear-gradient(to right, hsl(90, 50%, 70%), hsl(95, 55%, 68%))",
        secondaryTextGradient: "linear-gradient(to right, hsl(90, 50%, 30%), hsl(90, 40%, 40%))",
        foregroundTextGradient: "linear-gradient(to right, hsl(90, 50%, 25%), hsl(90, 40%, 35%))",
        userGradientAccentStart: "hsl(120, 39%, 53%)",
        userGradientAccentEnd: "hsl(90, 50%, 75%)",
        userGradientRedStart: "hsl(0, 60%, 60%)",
        userGradientRedEnd: "hsl(350, 60%, 65%)",
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
        appBackgroundGradient: "linear-gradient(to bottom right, hsl(120, 25%, 9%), hsl(110, 30%, 12%))",
        sidebarBackgroundGradient: "linear-gradient(to bottom, hsl(120, 25%, 7%), hsl(115, 28%, 9%))",
        cardBackgroundGradient: "hsl(120, 25%, 13%)",
        primaryTextGradient: "linear-gradient(to right, hsl(120, 39%, 60%), hsl(110, 42%, 65%))",
        accentTextGradient: "linear-gradient(to right, hsl(90, 50%, 60%), hsl(95, 55%, 58%))",
        secondaryTextGradient: "linear-gradient(to right, hsl(120, 60%, 80%), hsl(120, 50%, 70%))",
        foregroundTextGradient: "linear-gradient(to right, hsl(120, 60%, 85%), hsl(0, 0%, 100%))",
        userGradientAccentStart: "hsl(120, 39%, 63%)",
        userGradientAccentEnd: "hsl(90, 50%, 65%)",
        userGradientRedStart: "hsl(0, 50%, 55%)",
        userGradientRedEnd: "hsl(350, 50%, 60%)",
      },
    },
  },
];
    
