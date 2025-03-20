import React, { useState, useEffect } from "react";
import { FormField } from "@/types/models";
import { v4 as uuidv4 } from "uuid";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectSeparator, SelectLabel, SelectGroup } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { X, Plus, Trash2 } from "lucide-react";

interface FormFieldEditorProps {
  field: FormField;
  onSave: (field: FormField) => void;
  onCancel: () => void;
  onDelete?: () => void;
  isNew?: boolean;
}

const FormFieldEditor: React.FC<FormFieldEditorProps> = ({
  field,
  onSave,
  onCancel,
  onDelete,
  isNew = false,
}) => {
  const [editField, setEditField] = useState<FormField>({...field});
  const [tempOption, setTempOption] = useState("");
  
  // Field type options excluding display elements
  const fieldTypes = [
    { value: 'text', label: 'Text Input' },
    { value: 'textarea', label: 'Text Area' },
    { value: 'email', label: 'Email Input' },
    { value: 'number', label: 'Number Input' },
    { value: 'select', label: 'Dropdown Select' },
    { value: 'checkbox', label: 'Checkbox Group' },
    { value: 'radio', label: 'Radio Button Group' },
    { value: 'date', label: 'Date Picker' },
  ];

  // Alumni profile mapping options
  const alumniProfileFields = [
    { value: '', label: 'None (No Mapping)' },
    { value: 'firstName', label: 'First Name' },
    { value: 'lastName', label: 'Last Name' },
    { value: 'email', label: 'Email' },
    { value: 'phone', label: 'Phone' },
    { value: 'graduationYear', label: 'Graduation Year' },
    { value: 'degree', label: 'Degree' },
    { value: 'major', label: 'Major' },
    { value: 'linkedIn', label: 'LinkedIn' },
    { value: 'notes', label: 'Notes' },
  ];

  // Employment mapping options
  const employmentFields = [
    { value: 'employment.jobTitle', label: 'Job Title' },
    { value: 'employment.organizationName', label: 'Organization Name' },
    { value: 'employment.startDate', label: 'Start Date' },
    { value: 'employment.endDate', label: 'End Date' },
    { value: 'employment.isCurrent', label: 'Current Position' },
    { value: 'employment.description', label: 'Job Description' },
    { value: 'employment.website', label: 'Company Website' },
  ];

  useEffect(() => {
    // If field type is changed, reset options if needed
    if (
      !['select', 'checkbox', 'radio'].includes(editField.type) && 
      editField.options && 
      editField.options.length > 0
    ) {
      setEditField({ ...editField, options: [] });
    }
  }, [editField.type]);

  // Handle field property changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setEditField({ ...editField, [name]: value });
  };

  // Handle field type changes
  const handleTypeChange = (value: string) => {
    const isDisplayElementType = ['header', 'description'].includes(value);
    
    // For display elements, set required to false and clear placeholder
    if (isDisplayElementType) {
      setEditField({ 
        ...editField, 
        type: value as FormField['type'],
        required: false,
        placeholder: '',
      });
    } else {
      setEditField({ 
        ...editField, 
        type: value as FormField['type'] 
      });
    }
  };

  // Handle required toggle
  const handleRequiredChange = (checked: boolean) => {
    setEditField({ ...editField, required: checked });
  };

  // Handle field mapping change
  const handleMappingChange = (value: string) => {
    setEditField({ ...editField, mappedField: value });
  };

  // Handle options for select, checkbox, and radio types
  const addOption = () => {
    if (tempOption.trim() === "") return;
    
    const updatedOptions = editField.options 
      ? [...editField.options, tempOption] 
      : [tempOption];
    
    setEditField({ ...editField, options: updatedOptions });
    setTempOption("");
  };

  const removeOption = (index: number) => {
    if (!editField.options) return;
    
    const updatedOptions = [...editField.options];
    updatedOptions.splice(index, 1);
    
    setEditField({ ...editField, options: updatedOptions });
  };

  // Apply changes when the Apply button is clicked
  const handleApplyChanges = () => {
    // Generate a new ID for new fields
    const fieldToSave = isNew 
      ? { ...editField, id: uuidv4() } 
      : editField;
    
    console.log("Applying changes to field:", fieldToSave);
    
    // Call the onSave prop with the updated field data
    onSave(fieldToSave);
  };

  // Determine if the field is a display element (non-input)
  const isDisplayElement = ['header', 'description', 'divider'].includes(editField.type);

  return (
    <Card className="mb-4">
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Field Type Selection - Only show for input fields, not for display elements */}
          {!isDisplayElement && (
            <div className="space-y-2">
              <Label htmlFor="type">Field Type</Label>
              <Select 
                value={editField.type} 
                onValueChange={handleTypeChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select field type" />
                </SelectTrigger>
                <SelectContent>
                  {fieldTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Label Field - For display elements, only show content field */}
          <div className="space-y-2">
            <Label htmlFor="label">
              {isDisplayElement ? 'Content' : 'Label'}
            </Label>
            <Textarea
              id="label"
              name="label"
              value={editField.label}
              onChange={handleChange}
              className="min-h-[80px]"
              placeholder={isDisplayElement ? "Enter content text" : "Enter field label"}
            />
          </div>

          {/* Placeholder - Only for input fields */}
          {!isDisplayElement && editField.type !== 'checkbox' && editField.type !== 'radio' && (
            <div className="space-y-2">
              <Label htmlFor="placeholder">Placeholder (Optional)</Label>
              <Input
                id="placeholder"
                name="placeholder"
                value={editField.placeholder || ""}
                onChange={handleChange}
                placeholder="Enter placeholder text"
              />
            </div>
          )}

          {/* Required Toggle - Only for input fields */}
          {!isDisplayElement && (
            <div className="flex items-center justify-between">
              <Label htmlFor="required" className="cursor-pointer">
                Required Field
              </Label>
              <Switch
                id="required"
                checked={editField.required}
                onCheckedChange={handleRequiredChange}
              />
            </div>
          )}

          {/* Field Mapping - Only for input fields (not display elements) */}
          {!isDisplayElement && (
            <div className="space-y-2">
              <Label htmlFor="mapping">Map to Alumni Profile Field</Label>
              <Select 
                value={editField.mappedField || ''} 
                onValueChange={handleMappingChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select field mapping" />
                </SelectTrigger>
                <SelectContent>
                  {/* None option */}
                  <SelectItem value="none-option">None (No Mapping)</SelectItem>
                  
                  {/* Alumni Profile Fields */}
                  <SelectGroup>
                    <SelectLabel>Alumni Profile Fields</SelectLabel>
                    {alumniProfileFields.filter(f => f.value !== '').map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                  
                  {/* Employment History Fields */}
                  <SelectGroup>
                    <SelectLabel>Employment History Fields</SelectLabel>
                    {employmentFields.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-1">
                Mapping a field allows form submissions to update alumni profiles automatically
              </p>
            </div>
          )}

          {/* Options Manager - For select, checkbox, and radio fields */}
          {['select', 'checkbox', 'radio'].includes(editField.type) && (
            <div className="space-y-4">
              <Label>Options</Label>
              
              <div className="space-y-2">
                {/* Existing options */}
                {editField.options?.map((option, index) => (
                  <div key={index} className="flex items-center">
                    <Input 
                      value={option} 
                      readOnly 
                      className="flex-1 mr-2" 
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeOption(index)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ))}
                
                {/* Add new option */}
                <div className="flex items-center">
                  <Input
                    value={tempOption}
                    onChange={(e) => setTempOption(e.target.value)}
                    placeholder="Add option"
                    className="flex-1 mr-2"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addOption}
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 pt-4">
            {onDelete && !isNew && (
              <Button
                type="button"
                variant="destructive"
                onClick={onDelete}
              >
                <Trash2 className="h-4 w-4 mr-1" /> Delete
              </Button>
            )}
            <div className="flex-grow"></div>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
            >
              <X className="h-4 w-4 mr-1" /> Cancel
            </Button>
            <Button
              type="button"
              onClick={handleApplyChanges}
            >
              Apply
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FormFieldEditor;
