
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import PageLayout from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit, CheckCircle2, Clock, ArchiveIcon, Loader2 } from "lucide-react";
import { fetchFormById, fetchForms } from "@/lib/api/formApi";
import { useToast } from "@/hooks/use-toast";
import FormFieldPreview from "@/components/forms/FormFieldPreview";
import FormNotAvailableCard from "@/components/forms/FormNotAvailableCard";

const FormViewPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  console.log("FormViewPage rendered with form ID:", id);
  
  // Check if forms exist at all
  const { data: formsList } = useQuery({
    queryKey: ['forms-list-check-admin'],
    queryFn: fetchForms,
    retry: 1,
    staleTime: 60000, // 1 minute
  });
  
  console.log("Available forms in database (admin view):", formsList);
  
  // Fetch form data with improved error handling
  const { 
    data: form, 
    isLoading, 
    error,
    isError,
    refetch
  } = useQuery({
    queryKey: ['form', id],
    queryFn: async () => {
      console.log("Executing admin query function for form ID:", id);
      if (!id) throw new Error("No form ID provided");
      try {
        // Pass false for isPublicAccess parameter since this is admin access
        const result = await fetchFormById(id, false);
        console.log("Form fetched successfully (admin view):", result);
        return result;
      } catch (err) {
        console.error("Error in fetchFormById (admin view):", err);
        setErrorMessage(err instanceof Error ? err.message : "Unknown error");
        throw err;
      }
    },
    enabled: !!id,
    retry: 1,
    meta: {
      onError: (err: Error) => {
        console.error("Error loading form (admin view):", err);
        setErrorMessage(err.message);
        toast({
          title: "Error loading form",
          description: "The form could not be loaded",
          variant: "destructive"
        });
      }
    }
  });

  // Log query results for debugging
  console.log("Form query result (admin view):", { form, isLoading, error, isError });

  // Manual retry function
  const retryFetchForm = () => {
    console.log("Manually retrying form fetch (admin view)");
    setErrorMessage(null);
    refetch();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Active
          </Badge>
        );
      case 'draft':
        return (
          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
            <Clock className="mr-1 h-3 w-3" />
            Draft
          </Badge>
        );
      case 'archived':
        return (
          <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">
            <ArchiveIcon className="mr-1 h-3 w-3" />
            Archived
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <PageLayout
      title={isLoading ? "Loading Form..." : form?.title || "View Form"}
      subtitle="Preview the form exactly as users will see it"
      actionButton={
        form && (
          <Button 
            onClick={() => navigate(`/forms/edit/${form.id}`)}
            className="bg-uvu-green hover:bg-uvu-green-medium flex items-center gap-2"
          >
            <Edit size={16} />
            Edit Form
          </Button>
        )
      }
    >
      <div className="mb-6">
        <Button 
          variant="outline" 
          onClick={() => navigate('/forms')}
          className="flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          Back to Forms
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-uvu-green" />
        </div>
      ) : isError ? (
        <div>
          <FormNotAvailableCard 
            isError={true} 
            errorMessage={errorMessage || (error instanceof Error ? error.message : 'Unknown error')} 
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
      ) : form ? (
        <Card>
          <CardHeader className="pb-4">
            <div className="flex justify-between items-center">
              <CardTitle>{form.title}</CardTitle>
              {getStatusBadge(form.status)}
            </div>
            {form.description && (
              <p className="text-gray-500 mt-2">{form.description}</p>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            {form.fields.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed rounded-md">
                <p className="text-gray-500">This form doesn't have any fields yet.</p>
                <Button 
                  variant="link" 
                  onClick={() => navigate(`/forms/edit/${form.id}`)}
                  className="mt-2"
                >
                  Click here to add fields
                </Button>
              </div>
            ) : (
              <>
                {form.fields.map((field) => (
                  <FormFieldPreview key={field.id} field={field} />
                ))}
                
                <div className="pt-4">
                  <Button className="bg-uvu-green hover:bg-uvu-green-medium">
                    Submit Form
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      ) : null}
    </PageLayout>
  );
};

export default FormViewPage;
