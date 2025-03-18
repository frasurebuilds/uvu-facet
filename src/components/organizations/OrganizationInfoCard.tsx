
import { useState } from "react";
import { Organization } from "@/types/models";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Building2, Globe, MapPin, Users, Phone, Mail, Save } from "lucide-react";

interface OrganizationInfoCardProps {
  organization: Organization;
  onSave: (updatedData: Partial<Organization>) => void;
  isLoading: boolean;
  formRef?: React.RefObject<HTMLFormElement>;
}

const OrganizationInfoCard = ({ 
  organization, 
  onSave,
  isLoading,
  formRef
}: OrganizationInfoCardProps) => {
  const [formData, setFormData] = useState<Partial<Organization>>({
    name: organization.name,
    industry: organization.industry,
    website: organization.website,
    location: organization.location,
    contactPerson: organization.contactPerson,
    contactEmail: organization.contactEmail,
    contactPhone: organization.contactPhone,
    employeeCount: organization.employeeCount,
    notes: organization.notes
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === "employeeCount") {
      // Convert to number for employeeCount
      setFormData({
        ...formData,
        [name]: value ? parseInt(value, 10) : undefined
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Card>
      <CardHeader className="bg-gray-50 border-b">
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-uvu-green" />
          Organization Information
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} ref={formRef} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Organization Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name || ""}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Input
                id="industry"
                name="industry"
                value={formData.industry || ""}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <div className="flex items-center">
                <Globe className="mr-2 h-4 w-4 text-gray-500" />
                <Input
                  id="website"
                  name="website"
                  value={formData.website || ""}
                  onChange={handleChange}
                  placeholder="https://example.com"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <div className="flex items-center">
                <MapPin className="mr-2 h-4 w-4 text-gray-500" />
                <Input
                  id="location"
                  name="location"
                  value={formData.location || ""}
                  onChange={handleChange}
                  placeholder="City, State"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="employeeCount">Employee Count</Label>
              <div className="flex items-center">
                <Users className="mr-2 h-4 w-4 text-gray-500" />
                <Input
                  id="employeeCount"
                  name="employeeCount"
                  type="number"
                  min="0"
                  value={formData.employeeCount || ""}
                  onChange={handleChange}
                  placeholder="Number of employees"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="contactPerson">Contact Person</Label>
              <Input
                id="contactPerson"
                name="contactPerson"
                value={formData.contactPerson || ""}
                onChange={handleChange}
                placeholder="Full name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="contactEmail">Contact Email</Label>
              <div className="flex items-center">
                <Mail className="mr-2 h-4 w-4 text-gray-500" />
                <Input
                  id="contactEmail"
                  name="contactEmail"
                  type="email"
                  value={formData.contactEmail || ""}
                  onChange={handleChange}
                  placeholder="contact@example.com"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="contactPhone">Contact Phone</Label>
              <div className="flex items-center">
                <Phone className="mr-2 h-4 w-4 text-gray-500" />
                <Input
                  id="contactPhone"
                  name="contactPhone"
                  value={formData.contactPhone || ""}
                  onChange={handleChange}
                  placeholder="(123) 456-7890"
                />
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              rows={3}
              value={formData.notes || ""}
              onChange={handleChange}
              placeholder="Additional information about this organization..."
              className="resize-none"
            />
          </div>
          
          <div className="hidden lg:hidden">
            <Button 
              type="submit" 
              className="bg-uvu-green hover:bg-uvu-green-medium"
              disabled={isLoading}
            >
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default OrganizationInfoCard;
