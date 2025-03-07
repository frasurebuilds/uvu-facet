import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import PageLayout from "@/components/layout/PageLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FormSubmission } from "@/types/models";
import { Search, FileText, AlertCircle, CheckCircle, Clock, Archive } from "lucide-react";
import { 
  fetchFormSubmissions, 
  updateFormSubmissionStatus, 
  addFormSubmissionNote 
} from "@/lib/api/formSubmissionApi";
import { 
  updateAlumniFromFormSubmission, 
  createAlumniFromFormSubmission 
} from "@/lib/api/alumniApi";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

const FormSubmissionsPage = () => {
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

  useEffect(() => {
    if (error) {
      toast({
        title: "Error loading submissions",
        description: "There was a problem loading the form submissions",
        variant: "destructive"
      });
    }
  }, [error, toast]);

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
          await updateAlumniFromFormSubmission(
            submission.submittedBy.alumniId, 
            submission.mappedFields
          );
          toast({
            title: "Alumni profile updated",
            description: "The alumni profile has been updated with the submitted information"
          });
        } 
        else if (submission.submittedByUvid) {
          await createAlumniFromFormSubmission(submission);
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "reviewed":
        return <AlertCircle className="h-4 w-4 text-blue-500" />;
      case "processed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "archived":
        return <Archive className="h-4 w-4 text-gray-500" />;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <PageLayout
      title="Form Submissions"
      subtitle="Review and process incoming form submissions"
    >
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            placeholder="Search submissions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select
          value={statusFilter}
          onValueChange={setStatusFilter}
        >
          <SelectTrigger>
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="reviewed">Reviewed</SelectItem>
            <SelectItem value="processed">Processed</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
        
        <Select
          value={typeFilter}
          onValueChange={setTypeFilter}
        >
          <SelectTrigger>
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="update">Updates</SelectItem>
            <SelectItem value="new-info">New Information</SelectItem>
            <SelectItem value="event-rsvp">Event RSVPs</SelectItem>
            <SelectItem value="volunteer">Volunteer</SelectItem>
            <SelectItem value="form_response">Form Responses</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="text-center py-10">
          <p className="text-gray-500">Loading form submissions...</p>
        </div>
      ) : filteredSubmissions.length > 0 ? (
        <div className="space-y-4">
          {filteredSubmissions.map((submission) => (
            <FormSubmissionCard
              key={submission.id}
              submission={submission}
              statusIcon={getStatusIcon(submission.status)}
              formatDate={formatDate}
              onAddNote={() => {
                setSelectedSubmission(submission);
                setNoteText(submission.notes || "");
                setNoteDialogOpen(true);
              }}
              onStatusChange={handleStatusChange}
              onProcess={() => handleProcessSubmission(submission)}
              isProcessing={isProcessing}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-gray-500">No form submissions found matching your criteria.</p>
        </div>
      )}

      <Dialog open={noteDialogOpen} onOpenChange={setNoteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Note to Submission</DialogTitle>
            <DialogDescription>
              Add a note to this submission for reference or follow-up actions.
            </DialogDescription>
          </DialogHeader>
          <Textarea 
            value={noteText} 
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Enter your notes here..."
            rows={5}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setNoteDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddNote} className="bg-uvu-green hover:bg-uvu-green-medium">
              Save Note
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
};

interface FormSubmissionCardProps {
  submission: FormSubmission;
  statusIcon: React.ReactNode;
  formatDate: (date: string) => string;
  onAddNote: () => void;
  onStatusChange: (id: string, status: string) => void;
  onProcess: () => void;
  isProcessing: boolean;
}

const FormSubmissionCard = ({
  submission,
  statusIcon,
  formatDate,
  onAddNote,
  onStatusChange,
  onProcess,
  isProcessing
}: FormSubmissionCardProps) => {
  const hasMappedFields = submission.mappedFields && Object.keys(submission.mappedFields).length > 0;
  
  const renderContent = () => {
    if (submission.type === 'form_response') {
      return (
        <div className="space-y-2">
          {Object.entries(submission.content).map(([key, value]) => (
            <div key={key} className="flex justify-between text-sm">
              <span className="font-medium">{key}:</span>
              <span>{typeof value === 'string' ? value : JSON.stringify(value)}</span>
            </div>
          ))}
          
          {hasMappedFields && (
            <div className="mt-3 pt-3 border-t">
              <p className="font-medium text-uvu-green mb-2">Mapped Alumni Profile Fields:</p>
              {Object.entries(submission.mappedFields!).map(([key, value]) => (
                <div key={key} className="flex justify-between text-sm">
                  <span className="font-medium text-uvu-green-medium">{key}:</span>
                  <span>{typeof value === 'string' ? value : JSON.stringify(value)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }
    
    if (submission.type === 'event-rsvp') {
      return (
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="font-medium">Event:</span>
            <span>{submission.content.eventName}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="font-medium">Attending:</span>
            <span>{submission.content.attending ? 'Yes' : 'No'}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="font-medium">Guests:</span>
            <span>{submission.content.guests}</span>
          </div>
          {submission.content.dietaryRestrictions && (
            <div className="flex justify-between text-sm">
              <span className="font-medium">Dietary Restrictions:</span>
              <span>{submission.content.dietaryRestrictions}</span>
            </div>
          )}
        </div>
      );
    }
    
    if (submission.type === 'volunteer') {
      return (
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="font-medium">Interest:</span>
            <span>{submission.content.interest}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="font-medium">Availability:</span>
            <span>{submission.content.availability}</span>
          </div>
          {submission.content.preferredStudents && (
            <div className="flex justify-between text-sm">
              <span className="font-medium">Preferred Students:</span>
              <span>{submission.content.preferredStudents}</span>
            </div>
          )}
        </div>
      );
    }
    
    if (submission.type === 'new-info') {
      return (
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="font-medium">Graduation Year:</span>
            <span>{submission.content.graduationYear}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="font-medium">Degree:</span>
            <span>{submission.content.degree}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="font-medium">Major:</span>
            <span>{submission.content.major}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="font-medium">Current Role:</span>
            <span>{submission.content.currentRole}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="font-medium">Company:</span>
            <span>{submission.content.company}</span>
          </div>
        </div>
      );
    }
    
    if (submission.type === 'other') {
      return (
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="font-medium">Subject:</span>
            <span>{submission.content.subject}</span>
          </div>
          <div className="flex flex-col text-sm mt-2">
            <span className="font-medium mb-1">Message:</span>
            <p className="text-gray-700">{submission.content.message}</p>
          </div>
        </div>
      );
    }
  };

  return (
    <Card className="uvu-card card-hover-effect">
      <CardHeader className="pb-2 pt-4 px-5">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <CardTitle className="text-lg">
                {submission.isAnonymous 
                  ? 'Anonymous Submission' 
                  : submission.submittedBy.name || `UVID: ${submission.submittedByUvid}`}
              </CardTitle>
              <span
                className={`text-xs px-2 py-0.5 rounded-full flex items-center gap-1 ${
                  submission.status === "pending"
                    ? "bg-yellow-100 text-yellow-800"
                    : submission.status === "reviewed"
                    ? "bg-blue-100 text-blue-800"
                    : submission.status === "processed"
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {statusIcon}
                {submission.status}
              </span>
            </div>
            <div className="text-sm text-gray-500">
              {!submission.isAnonymous && submission.submittedBy.email && (
                <>{submission.submittedBy.email} • </>
              )}
              {submission.submittedByUvid && (
                <>UVID: {submission.submittedByUvid} • </>
              )}
              Submitted {formatDate(submission.createdAt)}
              {submission.form && (
                <> • Form: {submission.form.title}</>
              )}
            </div>
          </div>

          <span
            className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-uvu-green/10 text-uvu-green"
          >
            {submission.type.replace("_", " ").replace("-", " ")}
          </span>
        </div>
      </CardHeader>
      <CardContent className="pb-3 px-5">
        <div className="border rounded-md p-3 bg-gray-50">
          {renderContent()}
        </div>
        
        {submission.notes && (
          <div className="mt-3 text-sm">
            <span className="font-medium text-gray-700">Notes:</span>
            <p className="text-gray-600 italic">{submission.notes}</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-3 px-5 border-t flex justify-end gap-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={onAddNote}
        >
          Add Note
        </Button>
        {submission.status === "pending" && (
          <Button 
            variant="outline" 
            size="sm" 
            className="text-blue-600 border-blue-200"
            onClick={() => onStatusChange(submission.id, "reviewed")}
          >
            Mark as Reviewed
          </Button>
        )}
        {(submission.status === "pending" || submission.status === "reviewed") && (
          <Button 
            size="sm" 
            className="bg-uvu-green hover:bg-uvu-green-medium"
            onClick={onProcess}
            disabled={isProcessing}
          >
            {isProcessing ? "Processing..." : "Process"}
          </Button>
        )}
        {submission.status !== "archived" && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onStatusChange(submission.id, "archived")}
          >
            Archive
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default FormSubmissionsPage;
