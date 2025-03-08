import { useState } from "react";
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
import { fetchFormSubmissions, updateSubmissionStatus, processFormSubmission } from "@/lib/api/formSubmissionApi";
import { useToast } from "@/hooks/use-toast";

const FormSubmissionsPage = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  
  const { data: submissions = [], isLoading, refetch } = useQuery({
    queryKey: ['form-submissions'],
    queryFn: fetchFormSubmissions
  });

  const handleProcessSubmission = async (submissionId: string) => {
    try {
      await processFormSubmission(submissionId);
      toast({
        title: "Submission processed",
        description: "The form submission has been processed successfully."
      });
      refetch();
    } catch (error) {
      toast({
        title: "Processing failed",
        description: error instanceof Error ? error.message : "An error occurred while processing the submission",
        variant: "destructive"
      });
    }
  };
  
  const handleMarkAsReviewed = async (submissionId: string) => {
    try {
      await updateSubmissionStatus(submissionId, 'reviewed');
      toast({
        title: "Status updated",
        description: "The submission has been marked as reviewed."
      });
      refetch();
    } catch (error) {
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "An error occurred while updating the status",
        variant: "destructive"
      });
    }
  };

  const filteredSubmissions = submissions.filter((submission) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      submission.submittedByName.toLowerCase().includes(searchLower) ||
      submission.submittedByEmail.toLowerCase().includes(searchLower) ||
      (typeof submission.content === "object" &&
        Object.values(submission.content).some(
          (value) =>
            typeof value === "string" && value.toLowerCase().includes(searchLower)
        ));

    const matchesStatus =
      statusFilter === "all" || submission.status === statusFilter;

    const matchesType = typeFilter === "all" || submission.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

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
            <SelectItem value="form_response">Form Responses</SelectItem>
            <SelectItem value="update">Updates</SelectItem>
            <SelectItem value="new-info">New Information</SelectItem>
            <SelectItem value="event-rsvp">Event RSVPs</SelectItem>
            <SelectItem value="volunteer">Volunteer</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="text-center py-10">
          <p className="text-gray-500">Loading submissions...</p>
        </div>
      ) : filteredSubmissions.length > 0 ? (
        <div className="space-y-4">
          {filteredSubmissions.map((submission) => (
            <FormSubmissionCard
              key={submission.id}
              submission={submission}
              statusIcon={getStatusIcon(submission.status)}
              formatDate={formatDate}
              onMarkAsReviewed={() => handleMarkAsReviewed(submission.id)}
              onProcess={() => handleProcessSubmission(submission.id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-gray-500">No form submissions found matching your criteria.</p>
        </div>
      )}
    </PageLayout>
  );
};

interface FormSubmissionCardProps {
  submission: FormSubmission;
  statusIcon: React.ReactNode;
  formatDate: (date: string) => string;
  onMarkAsReviewed: () => void;
  onProcess: () => void;
}

const FormSubmissionCard = ({
  submission,
  statusIcon,
  formatDate,
  onMarkAsReviewed,
  onProcess,
}: FormSubmissionCardProps) => {
  return (
    <Card className="uvu-card card-hover-effect">
      <CardHeader className="pb-2 pt-4 px-5">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <CardTitle className="text-lg">{submission.submittedByName}</CardTitle>
              <span
                className={`text-xs px-2 py-0.5 rounded-full flex items-center gap-1 ${
                  submission.status === "pending"
                    ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                    : submission.status === "reviewed"
                    ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                    : submission.status === "processed"
                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                    : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                }`}
              >
                {statusIcon}
                {submission.status}
              </span>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {submission.submittedByEmail} • 
              Submitted {formatDate(submission.createdAt)}
            </div>
          </div>

          <span
            className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-uvu-green/10 text-uvu-green dark:bg-uvu-green/20 dark:text-uvu-green-medium"
          >
            {submission.type.replace(/_/g, " ")}
          </span>
        </div>
      </CardHeader>
      <CardContent className="pb-3 px-5">
        <div className="border rounded-md p-3 bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
          <div className="space-y-3">
            {submission.content && Object.entries(submission.content).map(([key, value]) => (
              <div key={key} className="flex justify-between text-sm">
                <span className="font-medium">{key}:</span>
                <span className="max-w-[60%] text-right">{typeof value === 'string' ? value : JSON.stringify(value)}</span>
              </div>
            ))}
            
            {(!submission.content || Object.keys(submission.content).length === 0) && (
              <p className="text-sm text-gray-500 dark:text-gray-400">No content data available</p>
            )}
          </div>
        </div>
        
        {submission.mappedFields && Object.keys(submission.mappedFields).length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2">Mapped Alumni Fields:</h4>
            <div className="border rounded-md p-3 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800">
              {Object.entries(submission.mappedFields).map(([field, value]) => (
                <div key={field} className="flex justify-between text-sm">
                  <span className="font-medium">{field}:</span>
                  <span>{typeof value === 'string' ? value : JSON.stringify(value)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {submission.notes && (
          <div className="mt-3 text-sm">
            <span className="font-medium text-gray-700 dark:text-gray-300">Notes:</span>
            <p className="text-gray-600 dark:text-gray-400 italic">{submission.notes}</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-3 px-5 border-t flex justify-end gap-2">
        <Button variant="outline" size="sm">
          Add Note
        </Button>
        {submission.status === "pending" && (
          <Button 
            variant="outline" 
            size="sm" 
            className="text-blue-600 border-blue-200 dark:text-blue-400 dark:border-blue-800"
            onClick={onMarkAsReviewed}
          >
            Mark as Reviewed
          </Button>
        )}
        {(submission.status === "pending" || submission.status === "reviewed") && (
          <Button 
            size="sm" 
            className="bg-uvu-green hover:bg-uvu-green-medium"
            onClick={onProcess}
          >
            Process
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default FormSubmissionsPage;
