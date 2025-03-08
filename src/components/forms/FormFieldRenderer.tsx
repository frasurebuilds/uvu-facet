
import { FormField } from "@/types/models";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface FormFieldRendererProps {
  field: FormField;
  value: any;
  onChange: (fieldId: string, value: any) => void;
}

const FormFieldRenderer = ({ field, value, onChange }: FormFieldRendererProps) => {
  const fieldId = `field-${field.id}`;
  
  switch (field.type) {
    case 'text':
    case 'email':
    case 'number':
      return (
        <Input
          id={fieldId}
          type={field.type}
          placeholder={field.placeholder}
          value={value || ''}
          onChange={(e) => onChange(field.id, e.target.value)}
          required={field.required}
        />
      );
      
    case 'textarea':
      return (
        <Textarea
          id={fieldId}
          placeholder={field.placeholder}
          value={value || ''}
          onChange={(e) => onChange(field.id, e.target.value)}
          required={field.required}
          rows={4}
        />
      );
      
    case 'date':
      return (
        <Input
          id={fieldId}
          type="date"
          value={value || ''}
          onChange={(e) => onChange(field.id, e.target.value)}
          required={field.required}
        />
      );
      
    case 'select':
      return (
        <Select 
          value={value || ''} 
          onValueChange={(value) => onChange(field.id, value)}
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
          {field.options?.map((option, index) => {
            const checkboxValues = value || [];
            return (
              <div key={index} className="flex items-center space-x-2">
                <Checkbox 
                  id={`${fieldId}-${index}`} 
                  checked={checkboxValues.includes(option)}
                  onCheckedChange={(checked) => {
                    const currentValues = [...(value || [])];
                    if (checked) {
                      currentValues.push(option);
                    } else {
                      const optionIndex = currentValues.indexOf(option);
                      if (optionIndex !== -1) {
                        currentValues.splice(optionIndex, 1);
                      }
                    }
                    onChange(field.id, currentValues);
                  }}
                />
                <Label htmlFor={`${fieldId}-${index}`}>{option}</Label>
              </div>
            );
          })}
        </div>
      );
      
    case 'radio':
      return (
        <RadioGroup 
          value={value || ''}
          onValueChange={(value) => onChange(field.id, value)}
        >
          {field.options?.map((option, index) => (
            <div key={index} className="flex items-center space-x-2">
              <RadioGroupItem value={option} id={`${fieldId}-${index}`} />
              <Label htmlFor={`${fieldId}-${index}`}>{option}</Label>
            </div>
          ))}
        </RadioGroup>
      );
      
    default:
      return <Input id={fieldId} placeholder="Unsupported field type" />;
  }
};

export default FormFieldRenderer;
