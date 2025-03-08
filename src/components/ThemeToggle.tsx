
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleTheme}
          className="w-10 h-10 rounded-full"
        >
          {theme === 'light' ? (
            <Moon size={18} className="text-gray-700" />
          ) : (
            <Sun size={18} className="text-yellow-300" />
          )}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent side="right">
        {theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
      </TooltipContent>
    </Tooltip>
  );
};

export default ThemeToggle;
