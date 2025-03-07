
import { Form } from "@/types/models";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import FormFieldPreview from "./FormFieldPreview";

interface FormPreviewProps {
  formData: Omit<Form, 'id' | 'createdAt' | 'updatedAt'>;
}

const FormPreview = ({ formData }: FormPreviewProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Form Preview: {formData.title}</CardTitle>
        {formData.description && <p className="text-gray-500 mt-1">{formData.description}</p>}
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {formData.formType === 'standard' && (
            <div className="space-y-4 border-b pb-6">
              <h3 className="font-medium text-lg">Your Information</h3>
              <div className="space-y-2">
                <Label htmlFor="uvid">
                  UVID <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="uvid"
                  placeholder="Enter your UVID"
                  disabled={true}
                />
              </div>
            </div>
          )}

          {formData.fields.map((field) => (
            <FormFieldPreview key={field.id} field={field} />
          ))}
          
          {formData.fields.length > 0 && (
            <div className="pt-4">
              <Button className="bg-uvu-green hover:bg-uvu-green-medium">
                Submit Form
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default FormPreview;
