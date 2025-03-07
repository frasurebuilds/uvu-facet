
import React from "react";
import { Alumni } from "@/types/models";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { GraduationCap } from "lucide-react";

interface PersonalInfoCardProps {
  alumni: Alumni;
  formData: Partial<Alumni>;
  editMode: boolean;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

const PersonalInfoCard: React.FC<PersonalInfoCardProps> = ({
  alumni,
  formData,
  editMode,
  handleInputChange
}) => {
  return (
    <Card className="md:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-uvu-green" />
          Personal Information
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">First Name</label>
              {editMode ? (
                <Input 
                  name="firstName"
                  value={formData.firstName || ''}
                  onChange={handleInputChange}
                  className="mt-1"
                />
              ) : (
                <p>{alumni.firstName}</p>
              )}
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-500">Last Name</label>
              {editMode ? (
                <Input 
                  name="lastName"
                  value={formData.lastName || ''}
                  onChange={handleInputChange}
                  className="mt-1"
                />
              ) : (
                <p>{alumni.lastName}</p>
              )}
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-500">Email</label>
              {editMode ? (
                <Input 
                  name="email"
                  type="email"
                  value={formData.email || ''}
                  onChange={handleInputChange}
                  className="mt-1"
                />
              ) : (
                <p>{alumni.email}</p>
              )}
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-500">Phone</label>
              {editMode ? (
                <Input 
                  name="phone"
                  value={formData.phone || ''}
                  onChange={handleInputChange}
                  className="mt-1"
                />
              ) : (
                <p>{alumni.phone || 'No phone number'}</p>
              )}
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Graduation Year</label>
              {editMode ? (
                <Input 
                  name="graduationYear"
                  type="number"
                  value={formData.graduationYear || ''}
                  onChange={handleInputChange}
                  className="mt-1"
                />
              ) : (
                <p>{alumni.graduationYear}</p>
              )}
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-500">Degree</label>
              {editMode ? (
                <Input 
                  name="degree"
                  value={formData.degree || ''}
                  onChange={handleInputChange}
                  className="mt-1"
                />
              ) : (
                <p>{alumni.degree}</p>
              )}
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-500">Major</label>
              {editMode ? (
                <Input 
                  name="major"
                  value={formData.major || ''}
                  onChange={handleInputChange}
                  className="mt-1"
                />
              ) : (
                <p>{alumni.major}</p>
              )}
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-500">LinkedIn</label>
              {editMode ? (
                <Input 
                  name="linkedIn"
                  value={formData.linkedIn || ''}
                  onChange={handleInputChange}
                  className="mt-1"
                />
              ) : (
                <p>{alumni.linkedIn || 'No LinkedIn profile'}</p>
              )}
            </div>
          </div>
        </div>
        
        <div className="mt-4">
          <label className="text-sm font-medium text-gray-500">Notes</label>
          {editMode ? (
            <Textarea 
              name="notes"
              value={formData.notes || ''}
              onChange={handleInputChange}
              className="mt-1"
              rows={4}
            />
          ) : (
            <p className="whitespace-pre-line">{alumni.notes || 'No notes'}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PersonalInfoCard;
