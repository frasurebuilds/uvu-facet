
import { Alumni } from "@/types/models";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Phone, Mail, Linkedin, CheckCircle, UserX } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface AlumniCardProps {
  alumni: Alumni;
  onClick: () => void;
  onCopy: (text: string, label: string) => void;
  onOpenLinkedIn: (url: string) => void;
  copiedValues: Record<string, boolean>;
}

const AlumniCard = ({ 
  alumni, 
  onClick, 
  onCopy,
  onOpenLinkedIn,
  copiedValues
}: AlumniCardProps) => {
  const initials = `${alumni.firstName[0]}${alumni.lastName[0]}`;

  return (
    <Card className="uvu-card card-hover-effect overflow-hidden cursor-pointer" onClick={onClick}>
      <CardContent className="p-0">
        <div className="h-3 bg-uvu-green w-full" />
        <div className="p-5">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-uvu-green h-12 w-12 rounded-full flex items-center justify-center text-white font-bold">
              {initials}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-bold">
                  {alumni.firstName} {alumni.lastName}
                </h3>
                {alumni.doNotContact && (
                  <Badge variant="destructive" className="flex items-center gap-1">
                    <UserX className="h-3 w-3" />
                    Do Not Contact
                  </Badge>
                )}
              </div>
              <p className="text-gray-500 text-sm">Alumni</p>
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Graduation:</span>
              <span>{alumni.graduationYear}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Degree:</span>
              <span>{alumni.degree}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Major:</span>
              <span>{alumni.major}</span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
            {alumni.phone && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className={`h-8 w-8 ${alumni.doNotContact ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={() => !alumni.doNotContact && onCopy(alumni.phone || "", "Phone number")}
                    disabled={alumni.doNotContact}
                  >
                    {copiedValues[alumni.phone || ""] ? <CheckCircle size={14} /> : <Phone size={14} />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{alumni.doNotContact ? 'Copying restricted' : 'Copy Phone Number'}</p>
                </TooltipContent>
              </Tooltip>
            )}
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className={`h-8 w-8 ${alumni.doNotContact ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={() => !alumni.doNotContact && onCopy(alumni.email, "Email")}
                  disabled={alumni.doNotContact}
                >
                  {copiedValues[alumni.email] ? <CheckCircle size={14} /> : <Mail size={14} />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{alumni.doNotContact ? 'Copying restricted' : 'Copy Email'}</p>
              </TooltipContent>
            </Tooltip>
            
            {alumni.linkedIn && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className={`h-8 w-8 ${alumni.doNotContact ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={() => !alumni.doNotContact && onOpenLinkedIn(alumni.linkedIn || "")}
                    disabled={alumni.doNotContact}
                  >
                    <Linkedin size={14} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{alumni.doNotContact ? 'Link restricted' : 'Open LinkedIn Profile'}</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AlumniCard;
