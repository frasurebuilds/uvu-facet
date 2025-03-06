
import { FormField } from "@/types/models";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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

  return (
    <div className="space-y-2">
      <Label htmlFor={`preview-${field.id}`}>
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      {renderField()}
    </div>
  );
};

export default FormFieldPreview;
