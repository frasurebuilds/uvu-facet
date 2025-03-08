import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useAuth } from "./AuthContext";
import { getUserThemePreference, updateUserThemePreference } from "@/lib/services";

type Theme = "light" | "dark";

type ThemeContextType = {
  theme: Theme;
  toggleTheme: () => void;
  isLoading: boolean;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<Theme>("light");
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  // Function to toggle theme
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    
    // If user is logged in, save preference to database
    if (user?.id) {
      updateUserThemePreference(user.id, newTheme);
    } else {
      // Otherwise just save to localStorage
      localStorage.setItem("theme", newTheme);
    }
    
    // Apply theme to document
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  // Load theme preferences on initial render and when user changes
  useEffect(() => {
    const loadTheme = async () => {
      setIsLoading(true);
      try {
        let savedTheme: Theme = "light";
        
        // If user is logged in, get theme from database
        if (user?.id) {
          savedTheme = (await getUserThemePreference(user.id)) as Theme;
        } 
        // Otherwise check localStorage
        else {
          const localTheme = localStorage.getItem("theme");
          if (localTheme === "dark" || localTheme === "light") {
            savedTheme = localTheme;
          }
        }
        
        setTheme(savedTheme);
        document.documentElement.classList.toggle("dark", savedTheme === "dark");
      } catch (error) {
        console.error("Error loading theme:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTheme();
  }, [user?.id]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isLoading }}>
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
