
import { Form } from "@/types/models";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, Plus } from "lucide-react";

interface FormSettingsPanelProps {
  formData: Omit<Form, 'id' | 'createdAt' | 'updatedAt'>;
  handleTitleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleDescriptionChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleStatusChange: (value: 'active' | 'draft' | 'archived') => void;
  handleFormTypeChange: (value: 'standard' | 'anonymous') => void;
  addField: () => void;
}

const FormSettingsPanel = ({
  formData,
  handleTitleChange,
  handleDescriptionChange,
  handleStatusChange,
  handleFormTypeChange,
  addField
}: FormSettingsPanelProps) => {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Form Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="form-title">Form Title *</Label>
            <Input
              id="form-title"
              value={formData.title}
              onChange={handleTitleChange}
              placeholder="Enter form title"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="form-description">Description</Label>
            <Textarea
              id="form-description"
              value={formData.description || ''}
              onChange={handleDescriptionChange}
              placeholder="Enter form description"
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="form-status">Status</Label>
            <Select 
              value={formData.status}
              onValueChange={(value: any) => handleStatusChange(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="form-type">Form Type</Label>
            <Select 
              value={formData.formType}
              onValueChange={(value: any) => handleFormTypeChange(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select form type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">Standard (Requires UVID)</SelectItem>
                <SelectItem value="anonymous">Anonymous</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500 mt-1">
              {formData.formType === 'standard' 
                ? "Standard forms require the submitter's UVID" 
                : "Anonymous forms don't collect any identifying information"}
            </p>
          </div>
          
          <Button 
            onClick={addField}
            className="w-full mt-4 bg-uvu-green hover:bg-uvu-green-medium"
          >
            <Plus size={16} className="mr-2" />
            Add Field
          </Button>
        </CardContent>
      </Card>
      
      {formData.fields.length === 0 && (
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-amber-700">
              <AlertTriangle size={18} />
              <p>You need to add at least one field to your form.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FormSettingsPanel;
