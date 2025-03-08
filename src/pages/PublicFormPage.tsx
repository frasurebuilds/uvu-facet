
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { fetchFormById, fetchForms } from "@/lib/api/formApi";
import { submitFormResponse } from "@/lib/api/formSubmissionApi";
import FormLoadingState from "@/components/forms/FormLoadingState";
import FormNotAvailableCard from "@/components/forms/FormNotAvailableCard";
import PublicFormHeader from "@/components/forms/PublicFormHeader";
import PublicFormFields from "@/components/forms/PublicFormFields";
import UvidField from "@/components/forms/UvidField";
import FormSubmitButton from "@/components/forms/FormSubmitButton";

const PublicFormPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [uvid, setUvid] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  console.log("PublicFormPage rendered with form ID:", id);
  
  // Check if forms exist at all by getting list of forms
  const { data: formsList } = useQuery({
    queryKey: ['forms-list-check'],
    queryFn: fetchForms,
    retry: 1,
    staleTime: 60000, // 1 minute
  });
  
  console.log("Available forms in database:", formsList);
  
  // Fetch form data with improved error handling
  const { 
    data: form, 
    isLoading, 
    error,
    isError,
    refetch
  } = useQuery({
    queryKey: ['public-form', id],
    queryFn: async () => {
      console.log("Executing query function for form ID:", id);
      if (!id) throw new Error("No form ID provided");
      try {
        const result = await fetchFormById(id);
        console.log("Form fetched successfully:", result);
        return result;
      } catch (err) {
        console.error("Error in fetchFormById:", err);
        setErrorMessage(err instanceof Error ? err.message : "Unknown error");
        throw err;
      }
    },
    enabled: !!id,
    retry: 1,
    meta: {
      onError: (err: Error) => {
        console.error("Error loading public form:", err);
        setErrorMessage(err.message);
      }
    }
  });

  // Log query results for debugging
  console.log("Public form query result:", { form, isLoading, error, isError, id });

  // Effect to check if the form ID is valid
  useEffect(() => {
    if (id && formsList && formsList.length > 0) {
      const formExists = formsList.some(f => f.id === id);
      if (!formExists) {
        console.log(`Form with ID ${id} not found in available forms list:`, formsList.map(f => f.id));
        setErrorMessage("Form not found in the database");
      } else {
        console.log(`Form with ID ${id} found in available forms list`);
      }
    }
  }, [id, formsList]);

  // Manual retry function
  const retryFetchForm = () => {
    console.log("Manually retrying form fetch");
    setErrorMessage(null);
    refetch();
  };

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

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <FormLoadingState message={`Loading form with ID: ${id}`} />
      </div>
    );
  }

  if (isError || !form || form.status !== 'active') {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <FormNotAvailableCard 
          isError={isError} 
          errorMessage={errorMessage || undefined} 
          showReturnButton={false}
        />
        <div className="text-center mt-4">
          <button 
            onClick={retryFetchForm}
            className="text-blue-500 hover:text-blue-700 text-sm underline"
          >
            Retry loading the form
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <form onSubmit={handleSubmit}>
        <Card>
          <PublicFormHeader title={form.title} description={form.description} />
          
          <CardContent className="space-y-6">
            {/* Submitter Information - Only for standard forms */}
            {form.formType === 'standard' && (
              <UvidField uvid={uvid} setUvid={setUvid} />
            )}

            {/* Form Fields */}
            <PublicFormFields 
              fields={form.fields} 
              formValues={formValues} 
              onInputChange={handleInputChange} 
            />
          </CardContent>
          
          <CardFooter>
            <FormSubmitButton 
              isSubmitting={isSubmitting}
              disabled={form.fields.length === 0} 
            />
          </CardFooter>
        </Card>
      </form>
    </div>
  );
};

export default PublicFormPage;
