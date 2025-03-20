
import { FormField } from "@/types/models";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link, BriefcaseBusiness } from "lucide-react";

interface FormFieldPreviewProps {
  field: FormField;
}

const FormFieldPreview = ({ field }: FormFieldPreviewProps) => {
  const renderField = () => {
    const fieldId = `preview-${field.id}`;
    
    switch (field.type) {
      case 'text':
      case 'email':
      case 'number':
        return (
          <Input
            id={fieldId}
            type={field.type}
            placeholder={field.placeholder}
            defaultValue={field.defaultValue}
            required={field.required}
          />
        );
        
      case 'textarea':
        return (
          <Textarea
            id={fieldId}
            placeholder={field.placeholder}
            defaultValue={field.defaultValue}
            required={field.required}
            rows={4}
          />
        );
        
      case 'date':
        return (
          <Input
            id={fieldId}
            type="date"
            defaultValue={field.defaultValue}
            required={field.required}
          />
        );
        
      case 'month-year':
        return (
          <div className="grid grid-cols-2 gap-2">
            <Select disabled>
              <SelectTrigger>
                <SelectValue placeholder="Month" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="01">January</SelectItem>
              </SelectContent>
            </Select>
            <Select disabled>
              <SelectTrigger>
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2023">2023</SelectItem>
              </SelectContent>
            </Select>
          </div>
        );
        
      case 'select':
        return (
          <Select defaultValue={field.defaultValue}>
            <SelectTrigger id={fieldId}>
              <SelectValue placeholder={field.placeholder || "Select an option"} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option, index) => (
                <SelectItem key={index} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
        
      case 'checkbox':
        return (
          <div className="space-y-2">
            {field.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Checkbox id={`${fieldId}-${index}`} />
                <Label htmlFor={`${fieldId}-${index}`}>{option}</Label>
              </div>
            ))}
          </div>
        );
        
      case 'radio':
        return (
          <RadioGroup defaultValue={field.defaultValue}>
            {field.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem 
                  value={option} 
                  id={`${fieldId}-${index}`} 
                />
                <Label htmlFor={`${fieldId}-${index}`}>{option}</Label>
              </div>
            ))}
          </RadioGroup>
        );
        
      default:
        return <Input id={fieldId} placeholder="Unsupported field type" />;
    }
  };

  // Helper to show the right mapping icon and text
  const renderMappingInfo = () => {
    if (!field.mappedField) return null;
    
    if (field.mappedField.startsWith('employment.')) {
      return (
        <div className="text-xs flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
          <BriefcaseBusiness size={12} />
          <span>Employment: {field.mappedField.replace('employment.', '')}</span>
        </div>
      );
    }
    
    return (
      <div className="text-xs flex items-center gap-1 text-blue-600 dark:text-blue-400">
        <Link size={12} />
        <span>Alumni Profile: {field.mappedField}</span>
      </div>
    );
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor={`preview-${field.id}`}>
          {field.label}
          {field.required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        
        {renderMappingInfo()}
      </div>
      {renderField()}
    </div>
  );
};

export default FormFieldPreview;
