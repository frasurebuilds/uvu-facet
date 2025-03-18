
import { useState, useEffect, useRef } from "react";
import { MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

// Sample US city and state combinations for suggestions
const LOCATION_SUGGESTIONS = [
  "New York, NY",
  "Los Angeles, CA",
  "Chicago, IL",
  "Houston, TX",
  "Phoenix, AZ",
  "Philadelphia, PA",
  "San Antonio, TX",
  "San Diego, CA",
  "Dallas, TX",
  "San Jose, CA",
  "Austin, TX",
  "Jacksonville, FL",
  "San Francisco, CA",
  "Columbus, OH",
  "Indianapolis, IN",
  "Seattle, WA",
  "Denver, CO",
  "Washington, DC",
  "Boston, MA",
  "Nashville, TN",
  "Las Vegas, NV",
  "Portland, OR",
  "Oklahoma City, OK",
  "Miami, FL",
  "Salt Lake City, UT",
  "Provo, UT",
  "Orem, UT"
];

interface LocationAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  id: string;
  name: string;
}

const LocationAutocomplete = ({
  value,
  onChange,
  id,
  name
}: LocationAutocompleteProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value || "");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Update the input value when the value prop changes
    setInputValue(value || "");
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    // Generate suggestions based on input
    if (newValue.trim() === "") {
      setSuggestions([]);
      setIsOpen(false);
    } else {
      const filteredSuggestions = LOCATION_SUGGESTIONS.filter(location =>
        location.toLowerCase().includes(newValue.toLowerCase())
      ).slice(0, 5); // Limit to 5 suggestions
      
      setSuggestions(filteredSuggestions);
      setIsOpen(filteredSuggestions.length > 0);
    }
    
    // Call the onChange prop to update the parent component's state
    onChange(newValue);
  };

  const handleSelectSuggestion = (suggestion: string) => {
    setInputValue(suggestion);
    onChange(suggestion);
    setIsOpen(false);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>Location</Label>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <div className="flex items-center relative">
            <MapPin className="absolute left-3 h-4 w-4 text-gray-500" />
            <Input
              id={id}
              name={name}
              value={inputValue}
              onChange={handleInputChange}
              placeholder="City, State"
              className="pl-9"
              ref={inputRef}
            />
          </div>
        </PopoverTrigger>
        {suggestions.length > 0 && (
          <PopoverContent className="p-0 w-[300px]" align="start">
            <div className="rounded-md border bg-popover text-popover-foreground shadow-md overflow-hidden">
              {suggestions.map((suggestion, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  className="w-full justify-start px-4 py-2 text-left hover:bg-accent hover:text-accent-foreground"
                  onClick={() => handleSelectSuggestion(suggestion)}
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </PopoverContent>
        )}
      </Popover>
    </div>
  );
};

export default LocationAutocomplete;
