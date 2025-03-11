import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import PageLayout from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  Edit, 
  Eye, 
  Trash2, 
  FileText, 
  AlertCircle,
  CheckCircle2,
  ArchiveIcon,
  Clock,
  ExternalLink,
  Copy
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { fetchForms, deleteForm, updateForm } from "@/lib/api/formApi";
import { useAuth } from "@/contexts/AuthContext";
import { Form } from "@/types/models";

const FormsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("active");
  const [formToDelete, setFormToDelete] = useState<Form | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { 
    data: forms = [], 
    isLoading, 
    isError, 
    error 
  } = useQuery({
    queryKey: ['forms'],
    queryFn: fetchForms,
    enabled: !!user,
  });

  useEffect(() => {
    if (isError) {
      console.error('Error fetching forms:', error);
      toast({
        title: "Error loading forms",
        description: "There was a problem loading your forms. Please try again.",
        variant: "destructive"
      });
    }
  }, [isError, error, toast]);

  const handleCreateForm = () => {
    navigate('/forms/create');
  };

  const handleEditForm = (formId: string) => {
    navigate(`/forms/edit/${formId}`);
  };

  const handleViewForm = (formId: string) => {
    navigate(`/forms/view/${formId}`);
  };

  const confirmDeleteForm = (form: Form) => {
    setFormToDelete(form);
    setDialogOpen(true);
  };

  const handleDeleteForm = async () => {
    if (!formToDelete) return;
    
    try {
      setIsDeleting(true);
      await deleteForm(formToDelete.id);
      
      queryClient.invalidateQueries({ queryKey: ['forms'] });
      
      toast({
        title: "Form deleted",
        description: "The form has been successfully deleted",
      });
    } catch (error) {
      console.error('Error deleting form:', error);
      toast({
        title: "Error deleting form",
        description: "There was a problem deleting the form",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
      setDialogOpen(false);
      setFormToDelete(null);
    }
  };

  const handleUpdateStatus = async (form: Form, newStatus: 'active' | 'draft' | 'archived') => {
    try {
      await updateForm({
        id: form.id,
        status: newStatus
      });
      
      queryClient.invalidateQueries({ queryKey: ['forms'] });
      
      toast({
        title: "Status updated",
        description: `The form has been moved to ${newStatus}`,
      });
    } catch (error) {
      console.error('Error updating form status:', error);
      toast({
        title: "Error updating status",
        description: "There was a problem updating the form status",
        variant: "destructive"
      });
    }
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  return (
    <PageLayout
      title="Forms"
      subtitle="Create and manage forms for alumni and organizations"
      actionButton={
        <Button 
          className="bg-uvu-green hover:bg-uvu-green-medium"
          onClick={handleCreateForm}
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Form
        </Button>
      }
    >
      <Tabs defaultValue="active" onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="active">Active Forms</TabsTrigger>
          <TabsTrigger value="drafts">Drafts</TabsTrigger>
          <TabsTrigger value="archived">Archived</TabsTrigger>
        </TabsList>
        
        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Loading forms...</p>
          </div>
        ) : (
          <>
            <TabsContent value="active" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {forms
                  .filter(form => form.status === 'active')
                  .map(form => (
                    <FormCard 
                      key={form.id} 
                      form={form} 
                      onEdit={() => handleEditForm(form.id)}
                      onView={() => handleViewForm(form.id)}
                      onDelete={() => confirmDeleteForm(form)}
                      onStatusChange={(status) => handleUpdateStatus(form, status)}
                    />
                  ))
                }
              </div>

              {forms.filter(form => form.status === 'active').length === 0 && (
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-4">
                    <FileText className="h-6 w-6 text-gray-500" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">No active forms</h3>
                  <p className="text-gray-500 mb-4">You don't have any active forms yet.</p>
                  <Button 
                    onClick={handleCreateForm} 
                    className="bg-uvu-green hover:bg-uvu-green-medium"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create Form
                  </Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="drafts" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {forms
                  .filter(form => form.status === 'draft')
                  .map(form => (
                    <FormCard 
                      key={form.id} 
                      form={form} 
                      onEdit={() => handleEditForm(form.id)}
                      onView={() => handleViewForm(form.id)}
                      onDelete={() => confirmDeleteForm(form)}
                      onStatusChange={(status) => handleUpdateStatus(form, status)}
                    />
                  ))
                }
              </div>

              {forms.filter(form => form.status === 'draft').length === 0 && (
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-4">
                    <AlertCircle className="h-6 w-6 text-gray-500" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">No draft forms</h3>
                  <p className="text-gray-500 mb-4">You don't have any forms in draft yet.</p>
                  <Button 
                    onClick={handleCreateForm} 
                    className="bg-uvu-green hover:bg-uvu-green-medium"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create Form
                  </Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="archived" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {forms
                  .filter(form => form.status === 'archived')
                  .map(form => (
                    <FormCard 
                      key={form.id} 
                      form={form} 
                      onEdit={() => handleEditForm(form.id)}
                      onView={() => handleViewForm(form.id)}
                      onDelete={() => confirmDeleteForm(form)}
                      onStatusChange={(status) => handleUpdateStatus(form, status)}
                    />
                  ))
                }
              </div>

              {forms.filter(form => form.status === 'archived').length === 0 && (
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-4">
                    <ArchiveIcon className="h-6 w-6 text-gray-500" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">No archived forms</h3>
                  <p className="text-gray-500">You don't have any archived forms.</p>
                </div>
              )}
            </TabsContent>
          </>
        )}
      </Tabs>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Form</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the form "{formToDelete?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteForm}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
};

interface FormCardProps {
  form: Form;
  onEdit: () => void;
  onView: () => void;
  onDelete: () => void;
  onStatusChange: (status: 'active' | 'draft' | 'archived') => void;
}

const FormCard = ({ 
  form, 
  onEdit, 
  onView, 
  onDelete, 
  onStatusChange 
}: FormCardProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const fieldCount = form.fields.length;
  
  const handleOpenPublicForm = () => {
    window.open(`/public-form/${form.id}`, '_blank');
  };
  
  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    const link = `${window.location.origin}/public-form/${form.id}`;
    navigator.clipboard.writeText(link);
    toast({
      title: "Link copied!",
      description: "Form link has been copied to clipboard",
    });
  };
  
  return (
    <Card className="uvu-card card-hover-effect flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="truncate">{form.title}</CardTitle>
          <div>{getStatusBadge(form.status)}</div>
        </div>
        <CardDescription className="line-clamp-2 h-10">
          {form.description || "No description provided"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between text-sm">
          <div>
            <p className="text-gray-500">Last updated</p>
            <p>{formatDate(form.updatedAt)}</p>
          </div>
          <div>
            <p className="text-gray-500">Fields</p>
            <p>{fieldCount}</p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-2 mt-auto">
        <div className="flex flex-wrap gap-2 w-full">
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button variant="secondary" size="sm" onClick={onView}>
            <Eye className="h-4 w-4 mr-2" />
            View
          </Button>
          {form.status === 'active' && (
            <>
              <Button 
                variant="default" 
                size="sm" 
                className="bg-uvu-green hover:bg-uvu-green-medium"
                onClick={handleOpenPublicForm}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleCopyLink}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy Link
              </Button>
            </>
          )}
        </div>
        
        <div className="flex justify-end w-full gap-1">
          {form.status !== 'active' && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onStatusChange('active')}
              className="text-green-600 hover:text-green-700 hover:bg-green-50"
            >
              <CheckCircle2 className="h-4 w-4" />
            </Button>
          )}
          
          {form.status !== 'draft' && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onStatusChange('draft')}
              className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
            >
              <Clock className="h-4 w-4" />
            </Button>
          )}
          
          {form.status !== 'archived' && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onStatusChange('archived')}
              className="text-gray-600 hover:text-gray-700 hover:bg-gray-50"
            >
              <ArchiveIcon className="h-4 w-4" />
            </Button>
          )}
          
          <Button 
            variant="ghost" 
            size="sm"
            onClick={onDelete}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date);
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

export default FormsPage;

