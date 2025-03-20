import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { FormField, Form } from "@/types/models";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { createForm, updateForm } from "@/lib/api/formApi";
import FormFieldEditor from "./FormFieldEditor";
import FormFieldPreview from "./FormFieldPreview";
import { 
  AlertTriangle, 
  Trash, 
  Plus, 
  MoveUp, 
  MoveDown, 
  Copy, 
  Eye, 
  Save,
  ArrowLeft,
  GripVertical,
  LayoutGrid,
  Type,
  Heading,
  SplitSquareVertical,
  ExternalLink,
  Link2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface FormBuilderProps {
  initialForm?: Form;
  onSave?: (form: Form) => void;
  isSubmitting?: boolean;
  onOpenForm?: () => void;
  onCopyLink?: () => void;
}

const SortableFieldItem = ({ 
  field, 
  index, 
  activeIndex, 
  onEdit, 
  onMove, 
  onDuplicate, 
  onRemove, 
  updateField,
  children
}: { 
  field: FormField; 
  index: number; 
  activeIndex: number | null; 
  onEdit: (index: number) => void; 
  onMove: (index: number, direction: 'up' | 'down') => void; 
  onDuplicate: (index: number) => void; 
  onRemove: (index: number) => void; 
  updateField: (index: number, field: FormField) => void;
  children?: React.ReactNode;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1 : 0,
  };

  const isDisplayElement = ['header', 'description', 'divider'].includes(field.type);
  let fieldIcon;
  
  switch (field.type) {
    case 'header':
      fieldIcon = <Heading size={16} className="mr-2 text-blue-500" />;
      break;
    case 'description':
      fieldIcon = <Type size={16} className="mr-2 text-green-500" />;
      break;
    case 'divider':
      fieldIcon = <SplitSquareVertical size={16} className="mr-2 text-gray-500" />;
      break;
    default:
      fieldIcon = <LayoutGrid size={16} className="mr-2 text-uvu-green" />;
      break;
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`p-4 border rounded-md transition-all ${
        activeIndex === index ? 'border-uvu-green shadow-md' : 'border-gray-200'
      } ${isDragging ? 'shadow-lg' : ''}`}
    >
      <div className="flex justify-between items-center mb-2">
        <div 
          className="font-medium cursor-pointer flex-grow flex items-center"
          onClick={() => onEdit(index === activeIndex ? null : index)}
        >
          {fieldIcon}
          {field.label} {!isDisplayElement && field.required && <span className="text-red-500">*</span>}
        </div>
        <div className="flex gap-1 items-center">
          <Button 
            variant="ghost" 
            size="sm"
            className="h-8 w-8 p-0 cursor-grab touch-none"
            {...attributes}
            {...listeners}
            type="button"
          >
            <GripVertical size={16} />
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => onMove(index, 'up')}
            disabled={index === 0}
            className="h-8 w-8 p-0"
            type="button"
          >
            <MoveUp size={16} />
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => onMove(index, 'down')}
            disabled={index === 0}
            className="h-8 w-8 p-0"
            type="button"
          >
            <MoveDown size={16} />
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => onDuplicate(index)}
            className="h-8 w-8 p-0"
            type="button"
          >
            <Copy size={16} />
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => onRemove(index)}
            className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
            type="button"
          >
            <Trash size={16} />
          </Button>
        </div>
      </div>
      
      {children}
    </div>
  );
};

const FormBuilder = ({ 
  initialForm, 
  onSave, 
  isSubmitting = false,
  onOpenForm,
  onCopyLink
}: FormBuilderProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<Omit<Form, 'id' | 'createdAt' | 'updatedAt'>>({
    title: initialForm?.title || '',
    description: initialForm?.description || '',
    status: initialForm?.status || 'draft',
    formType: initialForm?.formType || 'standard',
    fields: initialForm?.fields || [],
    createdBy: initialForm?.createdBy || (user?.id || 'anonymous-user')
  });

  const [activeFieldIndex, setActiveFieldIndex] = useState<number | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [localIsSubmitting, setLocalIsSubmitting] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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

  const addField = (type: FormField['type'] = 'text') => {
    console.log(`Adding new field of type: ${type}`);
    try {
      let label = 'New Field';
      let required = false;
      
      switch (type) {
        case 'header':
          label = 'Section Header';
          break;
        case 'description':
          label = 'Add some descriptive text here';
          break;
        case 'divider':
          label = '';
          break;
        default:
          label = 'New Field';
          required = false;
      }
      
      const newField: FormField = {
        id: uuidv4(),
        type,
        label,
        placeholder: '',
        required
      };
      
      const updatedFields = [...formData.fields, newField];
      
      setFormData(prev => ({
        ...prev,
        fields: updatedFields
      }));
      
      setActiveFieldIndex(updatedFields.length - 1);
      
      console.log("New field added successfully", updatedFields);
    } catch (error) {
      console.error("Error adding field:", error);
      toast({
        title: "Error adding field",
        description: "There was a problem adding a new field",
        variant: "destructive"
      });
    }
  };

  const updateField = (index: number, field: FormField) => {
    try {
      console.log(`Updating field at index ${index}:`, field);
      const newFields = [...formData.fields];
      newFields[index] = field;
      setFormData(prev => ({ ...prev, fields: newFields }));
      
      console.log("Form fields after update:", newFields);
    } catch (error) {
      console.error("Error updating field:", error);
      toast({
        title: "Error updating field",
        description: "There was a problem updating the field",
        variant: "destructive"
      });
    }
  };

  const removeField = (index: number) => {
    try {
      setFormData(prev => ({
        ...prev,
        fields: prev.fields.filter((_, i) => i !== index)
      }));
      setActiveFieldIndex(null);
    } catch (error) {
      console.error("Error removing field:", error);
    }
  };

  const duplicateField = (index: number) => {
    try {
      const fieldToDuplicate = { ...formData.fields[index], id: uuidv4() };
      const newFields = [...formData.fields];
      newFields.splice(index + 1, 0, fieldToDuplicate);
      setFormData(prev => ({ ...prev, fields: newFields }));
    } catch (error) {
      console.error("Error duplicating field:", error);
    }
  };

  const moveField = (index: number, direction: 'up' | 'down') => {
    try {
      if ((direction === 'up' && index === 0) || 
          (direction === 'down' && index === formData.fields.length - 1)) {
        return;
      }

      const newFields = [...formData.fields];
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      
      [newFields[index], newFields[newIndex]] = [newFields[newIndex], newFields[index]];
      
      setFormData(prev => ({ ...prev, fields: newFields }));
      setActiveFieldIndex(newIndex);
    } catch (error) {
      console.error("Error moving field:", error);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      setFormData(prev => {
        const oldIndex = prev.fields.findIndex(field => field.id === active.id);
        const newIndex = prev.fields.findIndex(field => field.id === over.id);
        
        if (activeFieldIndex === oldIndex) {
          setActiveFieldIndex(newIndex);
        }
        
        return {
          ...prev,
          fields: arrayMove(prev.fields, oldIndex, newIndex)
        };
      });
    }
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
      console.log('Saving form with data:', formData);
      setLocalIsSubmitting(true);
      let savedForm;

      if (initialForm?.id) {
        if (onSave) {
          await onSave({
            id: initialForm.id,
            ...formData,
            createdAt: initialForm.createdAt,
            updatedAt: initialForm.updatedAt
          });
        } else {
          savedForm = await updateForm({
            id: initialForm.id,
            ...formData
          });
          toast({
            title: "Form updated",
            description: "Your form has been successfully updated",
          });
        }
      } else {
        console.log('Creating new form with data:', formData);
        savedForm = await createForm(formData);
        toast({
          title: "Form created",
          description: "Your new form has been successfully created",
        });
      }
      
      navigate('/forms');
    } catch (error) {
      console.error('Error saving form:', error);
      toast({
        title: "Error saving form",
        description: typeof error === 'string' ? error : "There was an error saving your form. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLocalIsSubmitting(false);
    }
  };

  const isSaving = isSubmitting || localIsSubmitting;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Button 
          variant="outline" 
          onClick={() => navigate('/forms')}
          className="flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          Back to Forms
        </Button>
        
        <div className="flex gap-2">
          {initialForm?.id && (
            <>
              <Button
                variant="outline"
                onClick={onOpenForm}
                className="flex items-center gap-2"
              >
                <ExternalLink size={16} />
                Open
              </Button>
              
              <Button
                variant="outline"
                onClick={onCopyLink}
                className="flex items-center gap-2"
              >
                <Link2 size={16} />
                Copy Link
              </Button>
            </>
          )}
          
          <Button
            variant="outline"
            onClick={() => setPreviewMode(!previewMode)}
            className="flex items-center gap-2"
          >
            <Eye size={16} />
            {previewMode ? "Edit Mode" : "Preview"}
          </Button>
          
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-uvu-green hover:bg-uvu-green-medium flex items-center gap-2"
          >
            <Save size={16} />
            {isSaving ? "Saving..." : "Save Form"}
          </Button>
        </div>
      </div>

      {!previewMode ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Form Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="form-title">Form Title *</Label>
                  <Input
                    id="form-title"
                    value={formData.title}
                    onChange={handleTitleChange}
                    placeholder="Enter form title"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="form-description">Description</Label>
                  <Textarea
                    id="form-description"
                    value={formData.description || ''}
                    onChange={handleDescriptionChange}
                    placeholder="Enter form description"
                    rows={3}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="form-status">Status</Label>
                  <Select 
                    value={formData.status}
                    onValueChange={(value: any) => handleStatusChange(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="form-type">Form Type</Label>
                  <Select 
                    value={formData.formType}
                    onValueChange={(value: any) => handleFormTypeChange(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select form type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard (Requires UVID)</SelectItem>
                      <SelectItem value="anonymous">Anonymous</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.formType === 'standard' 
                      ? "Standard forms require the submitter's UVID" 
                      : "Anonymous forms don't collect any identifying information"}
                  </p>
                </div>
                
                <div className="border-t pt-4 mt-4">
                  <Label className="mb-2 block">Add Field</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      onClick={() => addField('text')}
                      className="w-full bg-uvu-green hover:bg-uvu-green-medium"
                      type="button"
                      size="sm"
                    >
                      <Plus size={14} className="mr-1" />
                      Text Field
                    </Button>
                    <Button 
                      onClick={() => addField('select')}
                      className="w-full bg-uvu-green hover:bg-uvu-green-medium"
                      type="button"
                      size="sm"
                    >
                      <Plus size={14} className="mr-1" />
                      Dropdown
                    </Button>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <Label className="mb-2 block">Add Display Element</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <Button 
                      onClick={() => addField('header')}
                      className="w-full"
                      variant="outline"
                      type="button"
                      size="sm"
                    >
                      <Heading size={14} className="mr-1" />
                      Header
                    </Button>
                    <Button 
                      onClick={() => addField('description')}
                      className="w-full"
                      variant="outline"
                      type="button"
                      size="sm"
                    >
                      <Type size={14} className="mr-1" />
                      Text
                    </Button>
                    <Button 
                      onClick={() => addField('divider')}
                      className="w-full"
                      variant="outline"
                      type="button"
                      size="sm"
                    >
                      <SplitSquareVertical size={14} className="mr-1" />
                      Divider
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {formData.fields.length === 0 && (
              <Card className="bg-amber-50 border-amber-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-amber-700">
                    <AlertTriangle size={18} />
                    <p>You need to add at least one field to your form.</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
          
          <div className="md:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Form Builder</CardTitle>
              </CardHeader>
              <CardContent>
                {formData.fields.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed rounded-md">
                    <p className="text-gray-500">No fields added yet</p>
                    <Button 
                      variant="link" 
                      onClick={() => addField('text')}
                      className="mt-2"
                      type="button"
                    >
                      Click here to add your first field
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={handleDragEnd}
                    >
                      <SortableContext
                        items={formData.fields.map(field => field.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        {formData.fields.map((field, index) => (
                          <SortableFieldItem
                            key={field.id}
                            field={field}
                            index={index}
                            activeIndex={activeFieldIndex}
                            onEdit={setActiveFieldIndex}
                            onMove={moveField}
                            onDuplicate={duplicateField}
                            onRemove={removeField}
                            updateField={updateField}
                          >
                            {activeFieldIndex === index && (
                              <FormFieldEditor 
                                field={field} 
                                onSave={(updatedField) => {
                                  console.log("Field editor: saving field", updatedField);
                                  updateField(index, updatedField);
                                  setActiveFieldIndex(null); // Close the editor after saving
                                }}
                                onCancel={() => setActiveFieldIndex(null)}
                                onDelete={() => removeField(index)}
                                isNew={false} 
                              />
                            )}
                          </SortableFieldItem>
                        ))}
                      </SortableContext>
                    </DndContext>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Form Preview: {formData.title}</CardTitle>
            {formData.description && <p className="text-gray-500 mt-1">{formData.description}</p>}
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {formData.formType === 'standard' && (
                <div className="space-y-4 border-b pb-6">
                  <h3 className="font-medium text-lg">Your Information</h3>
                  <div className="space-y-2">
                    <Label htmlFor="uvid">
                      UVID <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="uvid"
                      placeholder="Enter your UVID"
                      disabled={previewMode}
                    />
                  </div>
                </div>
              )}

              {formData.fields.map((field) => (
                <FormFieldPreview key={field.id} field={field} />
              ))}
              
              {formData.fields.length > 0 && (
                <div className="pt-4">
                  <Button className="bg-uvu-green hover:bg-uvu-green-medium">
                    Submit Form
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FormBuilder;
