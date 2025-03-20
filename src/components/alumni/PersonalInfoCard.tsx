
import React from "react";
import { Alumni } from "@/types/models";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { GraduationCap } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface PersonalInfoCardProps {
  alumni: Alumni;
  formData: Partial<Alumni>;
  editMode: boolean;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleCheckboxChange?: (field: string, checked: boolean) => void;
}

const PersonalInfoCard: React.FC<PersonalInfoCardProps> = ({
  alumni,
  formData,
  editMode,
  handleInputChange,
  handleCheckboxChange
}) => {
  // Extract UVID from email if it's a UVU email
  const uvid = alumni.email.endsWith('@uvu.edu') 
    ? alumni.email.split('@')[0] 
    : undefined;
  
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
            
            {uvid && (
              <div>
                <label className="text-sm font-medium text-gray-500">UVID</label>
                <p>{uvid}</p>
              </div>
            )}
            
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
                  placeholder="linkedin.com/in/username"
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

        <Separator className="my-6" />
        
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-500 mb-2">Contact Preferences</h4>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="doNotContact"
              checked={editMode ? (formData.doNotContact || false) : alumni.doNotContact}
              onCheckedChange={(checked) => 
                editMode && handleCheckboxChange && handleCheckboxChange('doNotContact', checked === true)
              }
              disabled={!editMode}
            />
            <label 
              htmlFor="doNotContact" 
              className={`text-sm ${alumni.doNotContact ? 'font-semibold text-red-600' : ''}`}
            >
              Do Not Contact
            </label>
          </div>
          {alumni.doNotContact && !editMode && (
            <p className="text-xs text-red-600 mt-1">
              This alumni has requested not to be contacted. Please respect their privacy.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PersonalInfoCard;
