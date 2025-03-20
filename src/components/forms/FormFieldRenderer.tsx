
import { FormField } from "@/types/models";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";

interface FormFieldRendererProps {
  field: FormField;
  value: any;
  onChange: (fieldId: string, value: any) => void;
}

const FormFieldRenderer = ({ field, value, onChange }: FormFieldRendererProps) => {
  const fieldId = `field-${field.id}`;
  
  // For month-year pickers
  const [month, setMonth] = useState<string>("");
  const [year, setYear] = useState<string>("");
  
  // Parse month-year value on mount
  useEffect(() => {
    if (field.type === 'month-year' && value) {
      try {
        const [yearValue, monthValue] = value.split('-');
        if (yearValue && monthValue) {
          setYear(yearValue);
          setMonth(monthValue);
        }
      } catch (error) {
        console.error('Error parsing month-year value:', error);
      }
    }
  }, [field.type, value]);
  
  // Handle month-year changes
  const handleMonthYearChange = (monthVal: string, yearVal: string) => {
    if (monthVal && yearVal) {
      onChange(field.id, `${yearVal}-${monthVal}`);
    } else {
      onChange(field.id, '');
    }
  };
  
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
      
    case 'month-year':
      return (
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Select 
              value={month} 
              onValueChange={(val) => {
                setMonth(val);
                handleMonthYearChange(val, year);
              }}
            >
              <SelectTrigger id={`${fieldId}-month`}>
                <SelectValue placeholder="Month" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="01">January</SelectItem>
                <SelectItem value="02">February</SelectItem>
                <SelectItem value="03">March</SelectItem>
                <SelectItem value="04">April</SelectItem>
                <SelectItem value="05">May</SelectItem>
                <SelectItem value="06">June</SelectItem>
                <SelectItem value="07">July</SelectItem>
                <SelectItem value="08">August</SelectItem>
                <SelectItem value="09">September</SelectItem>
                <SelectItem value="10">October</SelectItem>
                <SelectItem value="11">November</SelectItem>
                <SelectItem value="12">December</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Select 
              value={year} 
              onValueChange={(val) => {
                setYear(val);
                handleMonthYearChange(month, val);
              }}
            >
              <SelectTrigger id={`${fieldId}-year`}>
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent className="max-h-[200px] overflow-y-auto">
                {Array.from({ length: 100 }, (_, i) => {
                  const yearValue = (new Date().getFullYear() - 70 + i).toString();
                  return (
                    <SelectItem key={yearValue} value={yearValue}>
                      {yearValue}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        </div>
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
