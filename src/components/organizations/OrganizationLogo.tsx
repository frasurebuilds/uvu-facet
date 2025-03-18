
import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Building, Globe, Image } from "lucide-react";

interface OrganizationLogoProps {
  name: string;
  website?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const OrganizationLogo = ({ name, website, size = "md", className = "" }: OrganizationLogoProps) => {
  const [logoUrl, setLogoUrl] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  
  // Size mappings
  const sizeClasses = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-12 w-12 text-base",
    xl: "h-16 w-16 text-lg"
  };
  
  const firstLetter = name ? name[0] : "?";
  
  // Function to try to extract a logo from the website
  useEffect(() => {
    if (!website) {
      setError(true);
      return;
    }
    
    const fetchLogo = async () => {
      try {
        setLoading(true);
        setError(false);
        
        // Add http:// prefix if not present
        const fullUrl = website.startsWith('http') ? website : `https://${website}`;
        
        // Create favicon URL from the domain
        const domain = new URL(fullUrl).hostname;
        const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
        
        // Check if favicon exists
        const response = await fetch(faviconUrl, { method: 'HEAD' });
        if (response.ok) {
          setLogoUrl(faviconUrl);
        } else {
          setError(true);
        }
      } catch (error) {
        console.error("Error fetching logo:", error);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    
    fetchLogo();
  }, [website]);
  
  return (
    <Avatar className={`${sizeClasses[size]} ${className}`}>
      {logoUrl && !error ? (
        <AvatarImage src={logoUrl} alt={`${name} logo`} />
      ) : null}
      <AvatarFallback className={`bg-uvu-green text-white font-bold ${error ? "" : "animate-pulse"}`}>
        {loading ? (
          <Globe className="h-4 w-4 animate-spin" />
        ) : error ? (
          firstLetter
        ) : (
          <Building className="h-4 w-4" />
        )}
      </AvatarFallback>
    </Avatar>
  );
};

export default OrganizationLogo;
