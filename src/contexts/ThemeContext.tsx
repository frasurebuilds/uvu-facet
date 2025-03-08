import { createContext, useContext, useEffect, useState } from "react";
import { getUserThemePreference, updateUserThemePreference } from "@/lib/services";
import { useAuth } from "./AuthContext";

type Theme = 'light' | 'dark';

type ThemeContextType = {
  theme: Theme;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<Theme>('light');
  const { user } = useAuth();
  
  // Initialize theme based on user preference or system preference
  useEffect(() => {
    const initTheme = async () => {
      // Try to get user preference from database if logged in
      if (user) {
        const userPreference = await getUserThemePreference();
        if (userPreference) {
          setTheme(userPreference);
          document.documentElement.classList.toggle('dark', userPreference === 'dark');
          return;
        }
      }
      
      // Otherwise use system preference
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setTheme('dark');
        document.documentElement.classList.add('dark');
      }
    };
    
    initTheme();
  }, [user]);
  
  // Toggle theme function
  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
    
    // Save preference to database if logged in
    if (user) {
      try {
        await updateUserThemePreference(newTheme);
      } catch (error) {
        console.error("Failed to save theme preference:", error);
      }
    }
  };
  
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
