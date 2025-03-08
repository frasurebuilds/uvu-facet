import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { fetchFormById } from "@/lib/api/formApi";
import { submitFormResponse } from "@/lib/api/formSubmissionApi";
import { Form, FormField } from "@/types/models";
import { Loader2 } from "lucide-react";

const PublicFormPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [uvid, setUvid] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Fetch form data
  const { 
    data: form, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['public-form', id],
    queryFn: () => fetchFormById(id as string),
    enabled: !!id
  });

  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <h2 className="text-xl font-semibold mb-2">Form Not Found</h2>
              <p className="text-gray-500 mb-4">The form you're looking for doesn't exist or is no longer active.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleInputChange = (fieldId: string, value: any) => {
    setFormValues(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // For standard forms, validate UVID
    if (form?.formType === 'standard' && !uvid) {
      toast({
        title: "Missing information",
        description: "Please provide your UVID",
        variant: "destructive"
      });
      return;
    }

    // Check if all required fields are filled
    const missingRequiredFields = form?.fields
      .filter(field => field.required)
      .filter(field => !formValues[field.id] || formValues[field.id] === "");

    if (missingRequiredFields && missingRequiredFields.length > 0) {
      toast({
        title: "Required fields missing",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSubmitting(true);

      if (form?.formType === 'standard') {
        await submitFormResponse({
          formId: form?.id as string,
          content: formValues,
          submittedByUvid: uvid
        });
      } else {
        // Anonymous submission
        await submitFormResponse({
          formId: form?.id as string,
          content: formValues,
          isAnonymous: true
        });
      }

      toast({
        title: "Form submitted successfully",
        description: "Thank you for your submission!"
      });

      // Clear form values
      setFormValues({});
      setUvid("");
      
      // Navigate to a thank you screen
      navigate(`/form-submitted/${id}`);

    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        title: "Submission failed",
        description: "There was a problem submitting your form. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderField = (field: FormField) => {
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
            value={formValues[field.id] || ''}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            required={field.required}
          />
        );
        
      case 'textarea':
        return (
          <Textarea
            id={fieldId}
            placeholder={field.placeholder}
            value={formValues[field.id] || ''}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            required={field.required}
            rows={4}
          />
        );
        
      case 'date':
        return (
          <Input
            id={fieldId}
            type="date"
            value={formValues[field.id] || ''}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            required={field.required}
          />
        );
        
      case 'select':
        return (
          <Select 
            value={formValues[field.id] || ''} 
            onValueChange={(value) => handleInputChange(field.id, value)}
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
              const checkboxValues = formValues[field.id] || [];
              return (
                <div key={index} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`${fieldId}-${index}`} 
                    checked={checkboxValues.includes(option)}
                    onCheckedChange={(checked) => {
                      const currentValues = [...(formValues[field.id] || [])];
                      if (checked) {
                        currentValues.push(option);
                      } else {
                        const optionIndex = currentValues.indexOf(option);
                        if (optionIndex !== -1) {
                          currentValues.splice(optionIndex, 1);
                        }
                      }
                      handleInputChange(field.id, currentValues);
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
            value={formValues[field.id] || ''}
            onValueChange={(value) => handleInputChange(field.id, value)}
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

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {isLoading ? (
        <div className="flex justify-center items-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
        </div>
      ) : form?.status !== 'active' ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <h2 className="text-xl font-semibold mb-2">Form Not Available</h2>
              <p className="text-gray-500">This form is currently not active.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{form.title}</CardTitle>
              {form.description && (
                <p className="text-gray-500 mt-2">{form.description}</p>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Submitter Information - Only for standard forms */}
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
                      onChange={(e) => setUvid(e.target.value)}
                      placeholder="Enter your UVID"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Form Fields */}
              {form.fields.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed rounded-md">
                  <p className="text-gray-500">This form doesn't have any fields yet.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {form.fields.map((field) => (
                    <div key={field.id} className="space-y-2">
                      <Label htmlFor={`field-${field.id}`}>
                        {field.label}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                      </Label>
                      {renderField(field)}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button 
                type="submit" 
                className="bg-uvu-green hover:bg-uvu-green-medium w-full sm:w-auto"
                disabled={isSubmitting || form?.fields.length === 0}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit"
                )}
              </Button>
            </CardFooter>
          </Card>
        </form>
      )}
    </div>
  );
};

export default PublicFormPage;
