
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { FormSubmission } from "@/types/models";
import { 
  fetchFormSubmissions, 
  updateFormSubmissionStatus, 
  addFormSubmissionNote 
} from "@/lib/api/formSubmissionApi";
import { 
  updateAlumniFromFormSubmission, 
  createAlumniFromFormSubmission,
  FormFieldValue
} from "@/lib/api/alumniApi";

export const useFormSubmissions = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [selectedSubmission, setSelectedSubmission] = useState<FormSubmission | null>(null);
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const { 
    data: submissions, 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['formSubmissions'],
    queryFn: fetchFormSubmissions
  });

  const filteredSubmissions = submissions ? submissions.filter((submission) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      (submission.submittedBy.name && submission.submittedBy.name.toLowerCase().includes(searchLower)) ||
      (submission.submittedBy.email && submission.submittedBy.email.toLowerCase().includes(searchLower)) ||
      (submission.submittedByUvid && submission.submittedByUvid.toLowerCase().includes(searchLower)) ||
      (typeof submission.content === "object" &&
        Object.values(submission.content).some(
          (value) =>
            typeof value === "string" && value.toLowerCase().includes(searchLower)
        ));

    const matchesStatus =
      statusFilter === "all" || submission.status === statusFilter;

    const matchesType = typeFilter === "all" || submission.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  }) : [];

  const handleAddNote = async () => {
    if (!selectedSubmission || !noteText.trim()) return;
    
    try {
      await addFormSubmissionNote(selectedSubmission.id, noteText);
      toast({
        title: "Note added",
        description: "Your note has been added to the submission"
      });
      setNoteDialogOpen(false);
      setNoteText("");
      refetch();
    } catch (error) {
      toast({
        title: "Error adding note",
        description: "There was a problem adding your note",
        variant: "destructive"
      });
    }
  };

  const handleStatusChange = async (submissionId: string, newStatus: string) => {
    try {
      await updateFormSubmissionStatus(submissionId, newStatus);
      toast({
        title: "Status updated",
        description: `Submission status changed to ${newStatus}`
      });
      refetch();
    } catch (error) {
      toast({
        title: "Error updating status",
        description: "There was a problem updating the submission status",
        variant: "destructive"
      });
    }
  };

  const handleProcessSubmission = async (submission: FormSubmission) => {
    setIsProcessing(true);
    
    try {
      if (submission.mappedFields && Object.keys(submission.mappedFields).length > 0) {
        if (submission.submittedBy.alumniId) {
          // Convert mappedFields to the right type
          const typedMappedFields: Record<string, FormFieldValue> = {};
          Object.entries(submission.mappedFields).forEach(([key, value]) => {
            if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean' || value === null) {
              typedMappedFields[key] = value;
            } else {
              typedMappedFields[key] = String(value);
            }
          });
          
          await updateAlumniFromFormSubmission(
            submission.submittedBy.alumniId, 
            typedMappedFields
          );
          toast({
            title: "Alumni profile updated",
            description: "The alumni profile has been updated with the submitted information"
          });
        } 
        else if (submission.submittedByUvid) {
          // Pass submission with correctly typed properties
          await createAlumniFromFormSubmission({
            mappedFields: Object.entries(submission.mappedFields).reduce((acc, [key, value]) => {
              acc[key] = typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean' || value === null
                ? value
                : String(value);
              return acc;
            }, {} as Record<string, FormFieldValue>),
            submittedByUvid: submission.submittedByUvid
          });
          toast({
            title: "New alumni profile created",
            description: "A new alumni profile has been created from the submitted information"
          });
        }
      }
      
      await updateFormSubmissionStatus(submission.id, "processed");
      
      refetch();
    } catch (error) {
      console.error('Error processing submission:', error);
      toast({
        title: "Error processing submission",
        description: "There was a problem processing the form submission",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    submissions: filteredSubmissions,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    typeFilter,
    setTypeFilter,
    selectedSubmission,
    setSelectedSubmission,
    noteDialogOpen,
    setNoteDialogOpen,
    noteText,
    setNoteText,
    isProcessing,
    handleAddNote,
    handleStatusChange,
    handleProcessSubmission,
  };
};
