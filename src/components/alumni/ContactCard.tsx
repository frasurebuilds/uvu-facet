
import React, { useState } from "react";
import { Alumni } from "@/types/models";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Mail, Phone, Linkedin, Calendar, GraduationCap, Copy, CheckCircle, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipTrigger 
} from "@/components/ui/tooltip";

interface ContactCardProps {
  alumni: Alumni;
}

const ContactCard: React.FC<ContactCardProps> = ({ alumni }) => {
  const { toast } = useToast();
  const [copiedValues, setCopiedValues] = useState<Record<string, boolean>>({});

  const handleCopy = (text: string, label: string) => {
    if (!text) return;
    
    navigator.clipboard.writeText(text)
      .then(() => {
        // Set copied state for this specific value
        setCopiedValues({ ...copiedValues, [text]: true });
        
        // Show toast notification
        toast({
          title: "Copied!",
          description: `${label} copied to clipboard`,
        });
        
        // Reset icon after 2 seconds
        setTimeout(() => {
          setCopiedValues({ ...copiedValues, [text]: false });
        }, 2000);
      })
      .catch(err => {
        console.error('Failed to copy text: ', err);
        toast({
          title: "Error",
          description: "Failed to copy to clipboard",
          variant: "destructive",
        });
      });
  };

  const handleOpenLinkedIn = (linkedInUrl: string) => {
    if (!linkedInUrl) return;
    
    // Add http:// prefix if not present
    const fullUrl = linkedInUrl.startsWith('http') ? linkedInUrl : `https://${linkedInUrl}`;
    window.open(fullUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5 text-uvu-green" />
          Contact
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Mail className="h-5 w-5 text-gray-400" />
            <a 
              href={`mailto:${alumni.email}`} 
              className="text-uvu-green hover:text-uvu-green-medium"
            >
              {alumni.email}
            </a>
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  className="text-gray-400 hover:text-uvu-green"
                  onClick={() => handleCopy(alumni.email, "Email")}
                >
                  {copiedValues[alumni.email] ? 
                    <CheckCircle className="h-4 w-4" /> : 
                    <Copy className="h-4 w-4" />
                  }
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Copy Email</p>
              </TooltipContent>
            </Tooltip>
          </div>
          
          {alumni.phone && (
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-gray-400" />
              <a 
                href={`tel:${alumni.phone}`} 
                className="text-uvu-green hover:text-uvu-green-medium"
              >
                {alumni.phone}
              </a>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button 
                    className="text-gray-400 hover:text-uvu-green"
                    onClick={() => handleCopy(alumni.phone, "Phone number")}
                  >
                    {copiedValues[alumni.phone] ? 
                      <CheckCircle className="h-4 w-4" /> : 
                      <Copy className="h-4 w-4" />
                    }
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Copy Phone Number</p>
                </TooltipContent>
              </Tooltip>
            </div>
          )}
          
          {alumni.linkedIn && (
            <div className="flex items-center gap-3">
              <Linkedin className="h-5 w-5 text-gray-400" />
              <a 
                href={alumni.linkedIn.startsWith('http') ? alumni.linkedIn : `https://${alumni.linkedIn}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-uvu-green hover:text-uvu-green-medium"
              >
                LinkedIn Profile
              </a>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button 
                    className="text-gray-400 hover:text-uvu-green"
                    onClick={() => handleOpenLinkedIn(alumni.linkedIn)}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Open in New Tab</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button 
                    className="text-gray-400 hover:text-uvu-green"
                    onClick={() => handleCopy(alumni.linkedIn, "LinkedIn URL")}
                  >
                    {copiedValues[alumni.linkedIn] ? 
                      <CheckCircle className="h-4 w-4" /> : 
                      <Copy className="h-4 w-4" />
                    }
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Copy LinkedIn URL</p>
                </TooltipContent>
              </Tooltip>
            </div>
          )}
        </div>
        
        <div className="mt-6 pt-6 border-t">
          <h4 className="font-medium">Education</h4>
          <div className="mt-2 space-y-2">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-gray-400" />
              <span>{alumni.graduationYear}</span>
            </div>
            <div className="flex items-center gap-3">
              <GraduationCap className="h-5 w-5 text-gray-400" />
              <span>{alumni.degree} in {alumni.major}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ContactCard;
