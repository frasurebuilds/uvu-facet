
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import PageLayout from "@/components/layout/PageLayout";
import FormBuilder from "@/components/forms/FormBuilder";
import { fetchFormById, updateForm } from "@/lib/api/formApi";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Form } from "@/types/models";
import { AlertCircle, ExternalLink, Link2 } from "lucide-react";
import FormNotAvailableCard from "@/components/forms/FormNotAvailableCard";

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
    meta: {
      onError: (err: any) => {
        console.error('Error fetching form:', err);
      }
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
      console.log('Saving form with data:', updatedForm);
      await updateFormMutation.mutateAsync(updatedForm);
    } catch (error) {
      console.error('Form save error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenForm = () => {
    if (form && id) {
      // Open the form in a new tab
      window.open(`/form/${id}`, '_blank');
    }
  };

  const handleCopyLink = () => {
    if (form && id) {
      // Create the full URL for the form
      const baseUrl = window.location.origin;
      const formUrl = `${baseUrl}/form/${id}`;
      
      // Copy to clipboard
      navigator.clipboard.writeText(formUrl)
        .then(() => {
          toast({
            title: "Link copied",
            description: "Form link has been copied to clipboard"
          });
        })
        .catch(err => {
          console.error('Failed to copy link:', err);
          toast({
            title: "Copy failed",
            description: "Could not copy the form link to clipboard",
            variant: "destructive"
          });
        });
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
        <FormNotAvailableCard 
          isError={true} 
          errorMessage={error instanceof Error ? error.message : 'Unknown error'} 
          showReturnButton={true}
        />
      ) : form ? (
        <FormBuilder 
          initialForm={form} 
          onSave={handleFormSave} 
          isSubmitting={isSaving}
          onOpenForm={handleOpenForm}
          onCopyLink={handleCopyLink}
        />
      ) : null}
    </PageLayout>
  );
};

export default FormEditPage;
