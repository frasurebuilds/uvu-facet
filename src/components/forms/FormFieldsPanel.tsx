
import { FormField } from "@/types/models";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MoveUp, MoveDown, Copy, Trash } from "lucide-react";
import FormFieldEditor from "./FormFieldEditor";

interface FormFieldsPanelProps {
  fields: FormField[];
  activeFieldIndex: number | null;
  setActiveFieldIndex: (index: number | null) => void;
  updateField: (index: number, field: FormField) => void;
  removeField: (index: number) => void;
  duplicateField: (index: number) => void;
  moveField: (index: number, direction: 'up' | 'down') => void;
  addField: () => void;
}

const FormFieldsPanel = ({
  fields,
  activeFieldIndex,
  setActiveFieldIndex,
  updateField,
  removeField,
  duplicateField,
  moveField,
  addField
}: FormFieldsPanelProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Form Builder</CardTitle>
      </CardHeader>
      <CardContent>
        {fields.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed rounded-md">
            <p className="text-gray-500">No fields added yet</p>
            <Button 
              variant="link" 
              onClick={addField}
              className="mt-2"
            >
              Click here to add your first field
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {fields.map((field, index) => (
              <div 
                key={field.id} 
                className={`p-4 border rounded-md transition-all ${activeFieldIndex === index ? 'border-uvu-green shadow-md' : 'border-gray-200'}`}
              >
                <div className="flex justify-between items-center mb-2">
                  <div 
                    className="font-medium cursor-pointer flex-grow"
                    onClick={() => setActiveFieldIndex(index === activeFieldIndex ? null : index)}
                  >
                    {field.label} {field.required && <span className="text-red-500">*</span>}
                  </div>
                  <div className="flex gap-1">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => moveField(index, 'up')}
                      disabled={index === 0}
                      className="h-8 w-8 p-0"
                    >
                      <MoveUp size={16} />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => moveField(index, 'down')}
                      disabled={index === fields.length - 1}
                      className="h-8 w-8 p-0"
                    >
                      <MoveDown size={16} />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => duplicateField(index)}
                      className="h-8 w-8 p-0"
                    >
                      <Copy size={16} />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => removeField(index)}
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                    >
                      <Trash size={16} />
                    </Button>
                  </div>
                </div>
                
                {activeFieldIndex === index && (
                  <FormFieldEditor 
                    field={field} 
                    onChange={(updatedField) => updateField(index, updatedField)} 
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FormFieldsPanel;
