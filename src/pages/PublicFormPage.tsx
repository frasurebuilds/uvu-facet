
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { fetchFormById } from "@/lib/api/formApi";
import { submitFormResponse } from "@/lib/api/formSubmissionApi";
import { FormField } from "@/types/models";
import PublicFormHeader from "@/components/forms/PublicFormHeader";
import PublicFormFields from "@/components/forms/PublicFormFields";
import FormLoadingState from "@/components/forms/FormLoadingState";
import FormNotAvailableCard from "@/components/forms/FormNotAvailableCard";
import FormSubmitButton from "@/components/forms/FormSubmitButton";
import UvidField from "@/components/forms/UvidField";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const PublicFormPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [form, setForm] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uvid, setUvid] = useState<string>("");
  
  const formMethods = useForm();
  
  useEffect(() => {
    const loadForm = async () => {
      if (!id) return;
      
      try {
        const formData = await fetchFormById(id);
        setForm(formData);
        
        // Reset form with default values
        if (formData && formData.fields) {
          const defaultValues = formData.fields.reduce((acc: any, field: FormField) => {
            acc[field.id] = field.defaultValue || "";
            return acc;
          }, {});
          
          formMethods.reset(defaultValues);
        }
      } catch (error) {
        console.error("Error loading form:", error);
        setError("The requested form could not be loaded. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    
    loadForm();
  }, [id, formMethods]);
  
  const handleSubmit = async (formData: any) => {
    if (!id) return;
    
    setSubmitting(true);
    
    try {
      // Collect client metadata
      const metadata = {
        ipAddress: "Client IP not available", // This will be populated server-side
        userAgent: navigator.userAgent,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      };
      
      // Build submission data
      const submissionData = {
        formId: id,
        content: formData,
        metadata
      };
      
      // Add UVID if provided
      if (uvid) {
        submissionData.submittedByUvid = uvid;
      }
      
      await submitFormResponse(submissionData);
      
      // Redirect to success page
      navigate(`/forms/${id}/submitted`);
      
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        title: "Submission Failed",
        description: "There was a problem submitting your form. Please try again.",
        variant: "destructive"
      });
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return <FormLoadingState />;
  }
  
  if (error || !form) {
    return <FormNotAvailableCard error={error} />;
  }
  
  return (
    <div className="container max-w-3xl py-10 px-4">
      <PublicFormHeader 
        title={form.title} 
        description={form.description}
      />
      
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={formMethods.handleSubmit(handleSubmit)}>
            {/* Form fields */}
            <PublicFormFields 
              fields={form.fields || []} 
              form={formMethods} 
            />
            
            {/* UVID field for standard forms */}
            {form.form_type === 'standard' && (
              <UvidField
                value={uvid}
                onChange={setUvid}
                required={true}
              />
            )}
            
            {/* Submit button */}
            <div className="mt-8">
              <FormSubmitButton 
                isSubmitting={submitting} 
                isDisabled={form.form_type === 'standard' && !uvid}
              />
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PublicFormPage;
