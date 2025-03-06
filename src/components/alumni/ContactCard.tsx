
import React from "react";
import { Alumni } from "@/types/models";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Mail, Phone, Linkedin, Calendar, GraduationCap } from "lucide-react";

interface ContactCardProps {
  alumni: Alumni;
}

const ContactCard: React.FC<ContactCardProps> = ({ alumni }) => {
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
            <a href={`mailto:${alumni.email}`} className="text-uvu-green hover:text-uvu-green-medium">
              {alumni.email}
            </a>
          </div>
          
          {alumni.phone && (
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-gray-400" />
              <a href={`tel:${alumni.phone}`} className="text-uvu-green hover:text-uvu-green-medium">
                {alumni.phone}
              </a>
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
