
import { useState } from "react";
import PageLayout from "@/components/layout/PageLayout";
import FormBuilder from "@/components/forms/FormBuilder";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { createForm } from "@/lib/api/formApi";
import { useToast } from "@/hooks/use-toast";
import { Form } from "@/types/models";

const FormCreatePage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  // Create form mutation
  const createFormMutation = useMutation({
    mutationFn: createForm,
    onSuccess: () => {
      toast({
        title: "Form created",
        description: "Your new form has been successfully created"
      });
      navigate("/forms");
    },
    onError: (error) => {
      console.error('Error creating form:', error);
      toast({
        title: "Error saving form",
        description: "There was an error creating your form. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleFormSave = async (form: Form) => {
    setIsSaving(true);
    try {
      await createFormMutation.mutateAsync(form);
    } catch (error) {
      console.error('Error saving form:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <PageLayout
      title="Create Form"
      subtitle="Build a new form for alumni and organizations"
    >
      <FormBuilder onSave={handleFormSave} isSubmitting={isSaving} />
    </PageLayout>
  );
};

export default FormCreatePage;
