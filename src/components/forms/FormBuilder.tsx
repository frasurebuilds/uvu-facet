
import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { Form, FormField } from "@/types/models";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { createForm, updateForm } from "@/lib/api/formApi";
import FormSettingsPanel from "./FormSettingsPanel";
import FormFieldsPanel from "./FormFieldsPanel";
import FormPreview from "./FormPreview";
import FormBuilderHeader from "./FormBuilderHeader";

interface FormBuilderProps {
  initialForm?: Form;
  onSave?: (form: Form) => void;
}

const FormBuilder = ({ initialForm, onSave }: FormBuilderProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<Omit<Form, 'id' | 'createdAt' | 'updatedAt'>>({
    title: initialForm?.title || '',
    description: initialForm?.description || '',
    status: initialForm?.status || 'draft',
    formType: initialForm?.formType || 'standard',
    fields: initialForm?.fields || [],
    createdBy: initialForm?.createdBy || (user?.id as string)
  });

  const [activeFieldIndex, setActiveFieldIndex] = useState<number | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to use the form builder",
        variant: "destructive"
      });
      navigate("/auth");
    }
  }, [user, navigate, toast]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, title: e.target.value }));
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, description: e.target.value }));
  };

  const handleStatusChange = (value: 'active' | 'draft' | 'archived') => {
    setFormData(prev => ({ ...prev, status: value }));
  };

  const handleFormTypeChange = (value: 'standard' | 'anonymous') => {
    setFormData(prev => ({ ...prev, formType: value }));
  };

  const addField = () => {
    const newField: FormField = {
      id: uuidv4(),
      type: 'text',
      label: 'New Field',
      placeholder: '',
      required: false
    };
    
    setFormData(prev => ({
      ...prev,
      fields: [...prev.fields, newField]
    }));
    
    setActiveFieldIndex(formData.fields.length);
  };

  const updateField = (index: number, field: FormField) => {
    const newFields = [...formData.fields];
    newFields[index] = field;
    setFormData(prev => ({ ...prev, fields: newFields }));
  };

  const removeField = (index: number) => {
    setFormData(prev => ({
      ...prev,
      fields: prev.fields.filter((_, i) => i !== index)
    }));
    setActiveFieldIndex(null);
  };

  const duplicateField = (index: number) => {
    const fieldToDuplicate = { ...formData.fields[index], id: uuidv4() };
    const newFields = [...formData.fields];
    newFields.splice(index + 1, 0, fieldToDuplicate);
    setFormData(prev => ({ ...prev, fields: newFields }));
  };

  const moveField = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || 
        (direction === 'down' && index === formData.fields.length - 1)) {
      return;
    }

    const newFields = [...formData.fields];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    [newFields[index], newFields[newIndex]] = [newFields[newIndex], newFields[index]];
    
    setFormData(prev => ({ ...prev, fields: newFields }));
    setActiveFieldIndex(newIndex);
  };

  const togglePreviewMode = () => {
    setPreviewMode(!previewMode);
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      toast({
        title: "Form title required",
        description: "Please provide a title for your form",
        variant: "destructive"
      });
      return;
    }

    if (formData.fields.length === 0) {
      toast({
        title: "Form fields required",
        description: "Please add at least one field to your form",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSubmitting(true);
      let savedForm;

      if (initialForm?.id) {
        savedForm = await updateForm({
          id: initialForm.id,
          ...formData
        });
        toast({
          title: "Form updated",
          description: "Your form has been successfully updated",
        });
      } else {
        savedForm = await createForm(formData);
        toast({
          title: "Form created",
          description: "Your new form has been successfully created",
        });
      }

      if (onSave) {
        onSave(savedForm);
      }
      
      navigate('/forms');
    } catch (error) {
      console.error('Error saving form:', error);
      toast({
        title: "Error saving form",
        description: typeof error === 'string' ? error : "There was an error saving your form",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <FormBuilderHeader 
        previewMode={previewMode} 
        isSubmitting={isSubmitting}
        togglePreviewMode={togglePreviewMode}
        handleSave={handleSave}
      />

      {!previewMode ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <FormSettingsPanel 
              formData={formData}
              handleTitleChange={handleTitleChange}
              handleDescriptionChange={handleDescriptionChange}
              handleStatusChange={handleStatusChange}
              handleFormTypeChange={handleFormTypeChange}
              addField={addField}
            />
          </div>
          
          <div className="md:col-span-2">
            <FormFieldsPanel 
              fields={formData.fields}
              activeFieldIndex={activeFieldIndex}
              setActiveFieldIndex={setActiveFieldIndex}
              updateField={updateField}
              removeField={removeField}
              duplicateField={duplicateField}
              moveField={moveField}
              addField={addField}
            />
          </div>
        </div>
      ) : (
        <FormPreview formData={formData} />
      )}
    </div>
  );
};

export default FormBuilder;
