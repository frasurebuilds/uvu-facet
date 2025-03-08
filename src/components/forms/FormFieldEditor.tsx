
import { useState } from "react";
import { FormField } from "@/types/models";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X, Plus, Link } from "lucide-react";

// Alumni profile fields that can be mapped
const ALUMNI_PROFILE_FIELDS = [
  { id: "firstName", label: "First Name" },
  { id: "lastName", label: "Last Name" },
  { id: "email", label: "Email" },
  { id: "phone", label: "Phone" },
  { id: "graduationYear", label: "Graduation Year" },
  { id: "degree", label: "Degree" },
  { id: "major", label: "Major" },
  { id: "linkedIn", label: "LinkedIn Profile" }
];

interface FormFieldEditorProps {
  field: FormField;
  onChange: (field: FormField) => void;
}

const FormFieldEditor = ({ field, onChange }: FormFieldEditorProps) => {
  const [newOption, setNewOption] = useState("");

  const updateField = (updates: Partial<FormField>) => {
    onChange({ ...field, ...updates });
  };

  const addOption = () => {
    if (!newOption.trim()) return;
    
    const updatedOptions = field.options ? [...field.options, newOption.trim()] : [newOption.trim()];
    updateField({ options: updatedOptions });
    setNewOption("");
  };

  const removeOption = (index: number) => {
    if (!field.options) return;
    
    const updatedOptions = field.options.filter((_, i) => i !== index);
    updateField({ options: updatedOptions });
  };

  return (
    <div className="border-t pt-4 mt-2 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor={`field-label-${field.id}`}>Field Label</Label>
          <Input
            id={`field-label-${field.id}`}
            value={field.label}
            onChange={(e) => updateField({ label: e.target.value })}
            placeholder="Enter field label"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`field-type-${field.id}`}>Field Type</Label>
          <Select 
            value={field.type}
            onValueChange={(value: any) => updateField({ type: value })}
          >
            <SelectTrigger id={`field-type-${field.id}`}>
              <SelectValue placeholder="Select field type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="text">Text</SelectItem>
              <SelectItem value="textarea">Text Area</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="number">Number</SelectItem>
              <SelectItem value="date">Date</SelectItem>
              <SelectItem value="select">Dropdown</SelectItem>
              <SelectItem value="checkbox">Checkboxes</SelectItem>
              <SelectItem value="radio">Radio Buttons</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor={`field-placeholder-${field.id}`}>Placeholder</Label>
          <Input
            id={`field-placeholder-${field.id}`}
            value={field.placeholder || ''}
            onChange={(e) => updateField({ placeholder: e.target.value })}
            placeholder="Enter placeholder text"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`field-default-${field.id}`}>Default Value</Label>
          <Input
            id={`field-default-${field.id}`}
            value={field.defaultValue || ''}
            onChange={(e) => updateField({ defaultValue: e.target.value })}
            placeholder="Enter default value"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor={`field-mapping-${field.id}`} className="flex items-center gap-2">
          <Link size={16} className="text-gray-500" />
          Map to Alumni Profile Field
        </Label>
        <Select 
          value={field.mappedField || ''}
          onValueChange={(value) => updateField({ mappedField: value || undefined })}
        >
          <SelectTrigger id={`field-mapping-${field.id}`}>
            <SelectValue placeholder="Select a profile field to map" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Not mapped</SelectItem>
            {ALUMNI_PROFILE_FIELDS.map((profileField) => (
              <SelectItem key={profileField.id} value={profileField.id}>
                {profileField.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Mapping a field allows form submissions to update alumni profiles
        </p>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id={`field-required-${field.id}`}
          checked={field.required}
          onCheckedChange={(checked) => updateField({ required: checked })}
        />
        <Label htmlFor={`field-required-${field.id}`}>Required field</Label>
      </div>

      {/* Options for select, checkbox, radio */}
      {['select', 'checkbox', 'radio'].includes(field.type) && (
        <div className="space-y-4">
          <Label>Options</Label>
          
          <div className="flex space-x-2">
            <Input
              value={newOption}
              onChange={(e) => setNewOption(e.target.value)}
              placeholder="Add new option"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addOption();
                }
              }}
            />
            <Button 
              type="button" 
              onClick={addOption}
              className="bg-uvu-green hover:bg-uvu-green-medium"
            >
              <Plus size={16} />
            </Button>
          </div>
          
          <div className="space-y-2">
            {field.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div className="flex-grow border px-3 py-2 rounded-md">
                  {option}
                </div>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm"
                  onClick={() => removeOption(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X size={16} />
                </Button>
              </div>
            ))}
            
            {(!field.options || field.options.length === 0) && (
              <p className="text-gray-500 text-sm">No options added yet</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FormFieldEditor;
