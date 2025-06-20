
export interface ColorTheme {
  name: string; // User-friendly name
  id: string;   // Unique ID for localStorage
  colors: {
    light: {
      background: string; // HSL string e.g., "210 40% 98%"
      primary: string;
      accent: string;
    };
    dark: {
      background: string;
      primary: string;
      accent: string;
    };
  };
}

export const predefinedThemes: ColorTheme[] = [
  {
    name: "أزرق افتراضي (نظام)",
    id: "default-system-blue",
    colors: {
      light: {
        background: "208 100% 97%", // Original Light Background from globals.css
        primary: "207 82% 68%",    // Original Light Primary from globals.css
        accent: "45 100% 85%",     // Original Light Accent from globals.css
      },
      dark: {
        background: "208 20% 10%",  // Original Dark Background from globals.css
        primary: "207 82% 68%",     // Original Dark Primary from globals.css
        accent: "45 100% 85%",      // Original Dark Accent from globals.css
      },
    },
  },
  {
    name: "أخضر غابي",
    id: "forest-green",
    colors: {
      light: {
        background: "120 60% 97%", // Very light green
        primary: "120 39% 53%",   // Forest green
        accent: "90 50% 75%",    // Light lime green
      },
      dark: {
        background: "120 25% 10%", // Dark forest green
        primary: "120 39% 63%",   // Brighter forest green for dark mode
        accent: "90 50% 65%",     // Lime green for dark mode
      },
    },
  },
  {
    name: "برتقالي الغروب",
    id: "sunset-orange",
    colors: {
      light: {
        background: "30 100% 97%", // Very light orange/peach
        primary: "25 85% 60%",    // Sunset orange
        accent: "45 100% 70%",   // Yellow accent
      },
      dark: {
        background: "25 40% 10%",  // Dark warm brown
        primary: "25 85% 70%",    // Brighter orange for dark
        accent: "45 100% 60%",    // Brighter yellow for dark
      },
    },
  },
  {
    name: "بنفسجي ملكي",
    id: "royal-purple",
    colors: {
      light: {
        background: "270 100% 97%", // Very light lavender
        primary: "270 50% 60%",    // Royal purple
        accent: "300 70% 80%",    // Pinkish accent
      },
      dark: {
        background: "270 30% 10%",  // Deep dark purple
        primary: "270 50% 70%",    // Brighter purple for dark
        accent: "300 70% 70%",    // Brighter pinkish accent for dark
      },
    },
  },
];
