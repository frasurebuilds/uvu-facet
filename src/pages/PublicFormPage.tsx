
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PublicFormHeader from "@/components/forms/PublicFormHeader";
import PublicFormFields from "@/components/forms/PublicFormFields";
import UvidField from "@/components/forms/UvidField";
import FormSubmitButton from "@/components/forms/FormSubmitButton";
import FormNotAvailableCard from "@/components/forms/FormNotAvailableCard";
import FormLoadingState from "@/components/forms/FormLoadingState";
import { fetchFormById } from "@/lib/api/formApi";
import { submitFormResponse } from "@/lib/api/formSubmissionApi";
import { Form } from "@/types/models";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const PublicFormPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [form, setForm] = useState<Form | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uvid, setUvid] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const formMethods = useForm();
  
  // Fetch the form data
  useEffect(() => {
    const getForm = async () => {
      try {
        if (!id) throw new Error("Form ID is missing");
        
        const formData = await fetchFormById(id);
        
        if (!formData) {
          setError("The requested form could not be found.");
          return;
        }
        
        if (formData.status !== 'active') {
          setError("This form is not currently active.");
          return;
        }
        
        setForm(formData);
      } catch (error) {
        console.error("Error fetching form:", error);
        setError("There was an error loading the form. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    
    getForm();
  }, [id]);
  
  const onSubmit = async (data: any) => {
    if (!form || !id) return;
    
    setIsSubmitting(true);
    
    try {
      // Get client IP address from edge function
      const { data: ipData, error: ipError } = await supabase.functions.invoke('get-client-ip');
      
      if (ipError) {
        console.error('Error getting client IP:', ipError);
      }
      
      // Prepare metadata
      const metadata = {
        ipAddress: ipData?.ip || 'Unknown',
        userAgent: navigator.userAgent,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      };
      
      // Prepare submission data
      const submission = {
        formId: id,
        content: data,
        metadata,
        ...(form.formType === 'standard' && uvid ? { submittedByUvid: uvid } : { isAnonymous: true })
      };
      
      await submitFormResponse(submission);
      
      toast({
        title: "Form submitted",
        description: "Your form has been submitted successfully."
      });
      
      navigate(`/form-submitted/${id}`);
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        title: "Submission failed",
        description: "There was an error submitting your form. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isLoading) {
    return <FormLoadingState />;
  }
  
  if (error || !form) {
    return <FormNotAvailableCard isError message={error || "Form not found"} />;
  }
  
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>{form.title}</CardTitle>
          {form.description && <PublicFormHeader description={form.description} />}
        </CardHeader>
        
        <CardContent>
          <form onSubmit={formMethods.handleSubmit(onSubmit)} className="space-y-6">
            <PublicFormFields fields={form.fields} formMethods={formMethods} />
            
            {form.formType === 'standard' && (
              <UvidField
                uvid={uvid}
                setUvid={setUvid}
                isRequired={true}
              />
            )}
            
            <div className="flex justify-end">
              <FormSubmitButton 
                isSubmitting={isSubmitting} 
                disabled={form.formType === 'standard' && !uvid} 
              />
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PublicFormPage;
