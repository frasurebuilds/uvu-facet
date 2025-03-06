
import { FormField } from "@/types/models";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface FormFieldPreviewProps {
  field: FormField;
  value?: any;
  onChange?: (value: any) => void;
}

const FormFieldPreview = ({ field, value, onChange }: FormFieldPreviewProps) => {
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
            value={value !== undefined ? value : field.defaultValue || ''}
            required={field.required}
            onChange={e => onChange?.(e.target.value)}
          />
        );
        
      case 'textarea':
        return (
          <Textarea
            id={fieldId}
            placeholder={field.placeholder}
            value={value !== undefined ? value : field.defaultValue || ''}
            required={field.required}
            rows={4}
            onChange={e => onChange?.(e.target.value)}
          />
        );
        
      case 'date':
        return (
          <Input
            id={fieldId}
            type="date"
            value={value !== undefined ? value : field.defaultValue || ''}
            required={field.required}
            onChange={e => onChange?.(e.target.value)}
          />
        );
        
      case 'select':
        return (
          <Select 
            value={value !== undefined ? value : field.defaultValue || ''} 
            onValueChange={onChange}
          >
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
                <Checkbox 
                  id={`${fieldId}-${index}`} 
                  checked={Array.isArray(value) ? value.includes(option) : false}
                  onCheckedChange={(checked) => {
                    if (!onChange) return;
                    
                    if (Array.isArray(value)) {
                      const newValue = checked 
                        ? [...value, option] 
                        : value.filter(v => v !== option);
                      onChange(newValue);
                    } else {
                      onChange(checked ? [option] : []);
                    }
                  }}
                />
                <Label htmlFor={`${fieldId}-${index}`}>{option}</Label>
              </div>
            ))}
          </div>
        );
        
      case 'radio':
        return (
          <RadioGroup 
            value={value !== undefined ? value : field.defaultValue || ''} 
            onValueChange={onChange}
          >
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
