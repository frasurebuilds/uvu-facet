
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import PageLayout from "@/components/layout/PageLayout";
import FormBuilder from "@/components/forms/FormBuilder";
import { fetchFormById } from "@/lib/api/formApi";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Form } from "@/types/models";

const FormEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Fetch form data
  const { data: form, isLoading, error } = useQuery({
    queryKey: ['form', id],
    queryFn: () => fetchFormById(id as string, false), // Admin access, so isPublicAccess = false
    enabled: !!id && !!user
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (error) {
      toast({
        title: "Error loading form",
        description: "The form could not be loaded",
        variant: "destructive"
      });
      navigate("/forms");
    }
  }, [error, toast, navigate]);

  const handleFormSave = (updatedForm: Form) => {
    toast({
      title: "Form updated",
      description: "Your form has been successfully updated"
    });
    navigate("/forms");
  };

  return (
    <PageLayout
      title={isLoading ? "Loading Form..." : `Edit Form: ${form?.title}`}
      subtitle="Update your form details and fields"
    >
      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <p>Loading form details...</p>
        </div>
      ) : form ? (
        <FormBuilder initialForm={form} onSave={handleFormSave} />
      ) : null}
    </PageLayout>
  );
};

export default FormEditPage;
