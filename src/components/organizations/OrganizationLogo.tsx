
import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Building, Building2, CircleUser, Globe, Image, Shield } from "lucide-react";

interface OrganizationLogoProps {
  name: string;
  website?: string | null;
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
  
  const firstLetter = name ? name[0].toUpperCase() : "?";
  
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
        
        // Set the logo URL - we'll handle errors in the image onError handler
        setLogoUrl(faviconUrl);
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
    <Avatar className={`${sizeClasses[size]} ${className} bg-muted`}>
      {logoUrl && !error ? (
        <AvatarImage 
          src={logoUrl} 
          alt={`${name} logo`} 
          onError={() => setError(true)}
        />
      ) : null}
      <AvatarFallback className={`bg-uvu-green text-white font-bold ${loading ? "animate-pulse" : ""}`}>
        {loading ? (
          <Globe className="h-4 w-4 animate-spin" />
        ) : error ? (
          firstLetter
        ) : (
          <Building2 className="h-4 w-4" />
        )}
      </AvatarFallback>
    </Avatar>
  );
};

export default OrganizationLogo;
