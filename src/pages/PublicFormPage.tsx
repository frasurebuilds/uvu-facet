
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fetchFormById } from "@/lib/api/formApi";
import { submitFormResponse } from "@/lib/api/formSubmissionApi";
import FormFieldPreview from "@/components/forms/FormFieldPreview";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Form, FormField } from "@/types/models";

const PublicFormPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [uvid, setUvid] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Fetch the form
  const { data: form, isLoading, error } = useQuery({
    queryKey: ['public-form', id],
    queryFn: () => fetchFormById(id as string),
  });

  // Check if the form is active
  useEffect(() => {
    if (form && form.status !== 'active') {
      setValidationError("This form is not currently active.");
    } else {
      setValidationError(null);
    }
  }, [form]);

  const handleInputChange = (fieldId: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }));
    console.log("Field updated:", fieldId, value);
  };

  const handleUvidChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUvid(e.target.value);
  };

  const validateForm = (form: Form) => {
    // Check if UVID is provided for standard forms
    if (form.formType === 'standard' && !uvid.trim()) {
      setValidationError("UVID is required.");
      return false;
    }

    // Check required fields
    for (const field of form.fields) {
      if (field.required && (!formData[field.id] || formData[field.id] === '')) {
        setValidationError(`The field "${field.label}" is required.`);
        return false;
      }
    }

    setValidationError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;

    if (!validateForm(form)) {
      return;
    }

    try {
      setIsSubmitting(true);
      console.log("Starting form submission with data:", { 
        formId: id, 
        formType: form.formType,
        uvid: uvid,
        formData 
      });

      // Prepare submission data based on form type
      const submissionData: any = {
        formId: id,
        content: formData,
      };

      if (form.formType === 'anonymous') {
        submissionData.isAnonymous = true;
      } else {
        submissionData.submittedByUvid = uvid;
      }

      console.log("Submitting form with data:", submissionData);
      await submitFormResponse(submissionData);
      console.log("Form submitted successfully");
      navigate(`/form-submitted/${id}`);
    } catch (error) {
      console.error('Error submitting form:', error);
      setValidationError("There was an error submitting the form. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Card>
          <CardContent className="p-6">
            <p className="text-center">Loading form...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !form) {
    console.error("Form loading error:", error);
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Card>
          <CardContent className="p-6">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                There was an error loading the form. Please try again later.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl md:text-2xl">{form.title}</CardTitle>
          {form.description && <CardDescription>{form.description}</CardDescription>}
        </CardHeader>
        <CardContent>
          {validationError && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{validationError}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {form.formType === 'standard' && (
              <div className="space-y-4 border-b pb-6">
                <h3 className="font-medium text-lg">Your Information</h3>
                <div className="space-y-2">
                  <Label htmlFor="uvid">
                    UVID <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="uvid"
                    value={uvid}
                    onChange={handleUvidChange}
                    placeholder="Enter your UVID"
                    required
                  />
                </div>
              </div>
            )}

            {form.fields.map((field) => (
              <FormFieldPreview 
                key={field.id} 
                field={field} 
                value={formData[field.id] || field.defaultValue || ''} 
                onChange={(value) => handleInputChange(field.id, value)}
              />
            ))}

            <div className="pt-4">
              <Button 
                type="submit" 
                className="bg-uvu-green hover:bg-uvu-green-medium"
                disabled={isSubmitting || form.status !== 'active'}
              >
                {isSubmitting ? "Submitting..." : "Submit Form"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PublicFormPage;
