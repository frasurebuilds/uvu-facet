
import { FormField } from "@/types/models";
import { Label } from "@/components/ui/label";
import FormFieldRenderer from "./FormFieldRenderer";

interface PublicFormFieldsProps {
  fields: FormField[];
  formValues: Record<string, any>;
  onInputChange: (fieldId: string, value: any) => void;
}

const PublicFormFields = ({ fields, formValues, onInputChange }: PublicFormFieldsProps) => {
  if (fields.length === 0) {
    return (
      <div className="text-center py-8 border-2 border-dashed rounded-md">
        <p className="text-gray-500">This form doesn't have any fields yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {fields.map((field) => (
        <div key={field.id} className="space-y-2">
          <Label htmlFor={`field-${field.id}`}>
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          <FormFieldRenderer 
            field={field} 
            value={formValues[field.id]} 
            onChange={onInputChange} 
          />
        </div>
      ))}
    </div>
  );
};

export default PublicFormFields;
