import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createOrganization } from "@/lib/api";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Building2, Globe, MapPin, Users, Phone, Mail } from "lucide-react";
import { DialogFooter } from "@/components/ui/dialog";

interface OrganizationFormDialogProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const OrganizationFormDialog = ({ onSuccess, onCancel }: OrganizationFormDialogProps) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: "",
    industry: "",
    website: "",
    location: "",
    contactPerson: "",
    contactEmail: "",
    contactPhone: "",
    notes: ""
  });

  const createOrganizationMutation = useMutation({
    mutationFn: createOrganization,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      onSuccess();
    }
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    createOrganizationMutation.mutate({
      name: formData.name,
      industry: formData.industry,
      website: formData.website || undefined,
      location: formData.location || undefined,
      contactPerson: formData.contactPerson || undefined,
      contactEmail: formData.contactEmail || undefined,
      contactPhone: formData.contactPhone || undefined,
      notes: formData.notes || undefined
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Organization Name *</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="industry">Industry *</Label>
            <Input
              id="industry"
              name="industry"
              value={formData.industry}
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
                value={formData.website}
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
                value={formData.location}
                onChange={handleChange}
                placeholder="City, State"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="contactPerson">Contact Person</Label>
            <Input
              id="contactPerson"
              name="contactPerson"
              value={formData.contactPerson}
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
                value={formData.contactEmail}
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
                value={formData.contactPhone}
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
            value={formData.notes}
            onChange={handleChange}
            placeholder="Additional information about this organization..."
            className="resize-none"
          />
        </div>
      </div>
      
      <DialogFooter>
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          disabled={createOrganizationMutation.isPending}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          className="bg-uvu-green hover:bg-uvu-green-medium"
          disabled={createOrganizationMutation.isPending}
        >
          {createOrganizationMutation.isPending ? "Creating..." : "Create Organization"}
        </Button>
      </DialogFooter>
    </form>
  );
};

export default OrganizationFormDialog;
