
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import PageLayout from "@/components/layout/PageLayout";
import FormBuilder from "@/components/forms/FormBuilder";
import { fetchFormById, updateForm } from "@/lib/api/formApi";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Form } from "@/types/models";
import { AlertCircle } from "lucide-react";

const FormEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  
  // Fetch form data
  const { data: form, isLoading, error, isError } = useQuery({
    queryKey: ['form', id],
    queryFn: () => fetchFormById(id as string, false), // Admin access, so isPublicAccess = false
    enabled: !!id,
    retry: 1,
    onError: (err) => {
      console.error('Error fetching form:', err);
    }
  });

  // Update form mutation
  const updateFormMutation = useMutation({
    mutationFn: updateForm,
    onSuccess: () => {
      toast({
        title: "Form updated",
        description: "Your form has been successfully updated"
      });
      navigate("/forms");
    },
    onError: (error) => {
      console.error('Error updating form:', error);
      toast({
        title: "Error saving form",
        description: "There was an error saving your form. Please try again.",
        variant: "destructive"
      });
    }
  });

  useEffect(() => {
    if (!authLoading && !user) {
      // For this page, we'll allow non-authenticated users too
      console.log("Non-authenticated user accessing form edit page");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (isError && error) {
      console.error('Error in FormEditPage:', error);
      toast({
        title: "Error loading form",
        description: "The form could not be loaded. It may have been deleted or doesn't exist.",
        variant: "destructive"
      });
      
      // Redirect after a short delay to allow the user to see the error
      setTimeout(() => {
        navigate("/forms");
      }, 3000);
    }
  }, [error, isError, toast, navigate]);

  const handleFormSave = async (updatedForm: Form) => {
    setIsSaving(true);
    try {
      await updateFormMutation.mutateAsync(updatedForm);
    } catch (error) {
      console.error('Form save error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <PageLayout
      title={isLoading ? "Loading Form..." : `Edit Form: ${form?.title || 'Not Found'}`}
      subtitle="Update your form details and fields"
    >
      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <p>Loading form details...</p>
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Form Not Found</h2>
          <p className="text-gray-600 mb-4">
            The form you're trying to edit doesn't exist or has been deleted.
          </p>
          <button 
            onClick={() => navigate('/forms')} 
            className="bg-uvu-green hover:bg-uvu-green-medium text-white px-4 py-2 rounded"
          >
            Return to Forms
          </button>
        </div>
      ) : form ? (
        <FormBuilder 
          initialForm={form} 
          onSave={handleFormSave} 
          isSubmitting={isSaving}
        />
      ) : null}
    </PageLayout>
  );
};

export default FormEditPage;
