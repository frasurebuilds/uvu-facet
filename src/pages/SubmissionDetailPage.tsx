
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import PageLayout from "@/components/layout/PageLayout";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  ArrowLeft, 
  CheckCircle,
  Clock, 
  AlertCircle,
  Archive,
  User,
  Mail,
  CalendarDays,
  ClipboardList
} from "lucide-react";
import { fetchFormSubmissions, updateSubmissionStatus } from "@/lib/api/formSubmissionApi";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const SubmissionDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [notes, setNotes] = useState("");

  const { data: submissions, isLoading, refetch } = useQuery({
    queryKey: ['form-submissions'],
    queryFn: fetchFormSubmissions,
  });

  const submission = submissions?.find(sub => sub.id === id);

  useEffect(() => {
    if (submission) {
      setNotes(submission.notes || "");
    }
  }, [submission]);

  const handleStatusUpdate = async (status: 'pending' | 'reviewed' | 'processed' | 'archived') => {
    if (!id) return;
    
    try {
      await updateSubmissionStatus(id, status, notes);
      toast({
        title: "Status updated",
        description: `Submission status changed to ${status}`
      });
      refetch();
    } catch (error) {
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive"
      });
    }
  };

  const handleSaveNotes = async () => {
    if (!id) return;
    
    try {
      await updateSubmissionStatus(id, submission?.status || 'pending', notes);
      toast({
        title: "Notes saved",
        description: "Submission notes have been updated"
      });
      refetch();
    } catch (error) {
      toast({
        title: "Save failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive"
      });
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMMM d, yyyy 'at' h:mm a");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 border-yellow-200 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Pending
          </Badge>
        );
      case "reviewed":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 border-blue-200 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            Reviewed
          </Badge>
        );
      case "processed":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-green-200 flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Processed
          </Badge>
        );
      case "archived":
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 border-gray-300 flex items-center gap-1">
            <Archive className="h-3 w-3" />
            Archived
          </Badge>
        );
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  if (isLoading) {
    return (
      <PageLayout title="Loading..." subtitle="Please wait">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <p>Loading submission details...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (!submission) {
    return (
      <PageLayout title="Submission Not Found" subtitle="The requested submission could not be found">
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <p>We couldn't find the submission you're looking for.</p>
          <Button onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="Submission Details"
      subtitle={`Viewing form submission from ${submission.submittedByName || 'Unknown'}`}
      backButton={{
        label: "Back to List",
        onClick: () => navigate(-1)
      }}
    >
      <div className="space-y-6">
        <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle className="text-2xl font-bold">
                  {submission.type.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                </CardTitle>
                <p className="text-muted-foreground mt-1">
                  Submitted on {formatDate(submission.createdAt)}
                </p>
              </div>
              {getStatusBadge(submission.status)}
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="border border-gray-200 dark:border-gray-800">
                <CardHeader>
                  <CardTitle className="text-lg">Submitter Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">{submission.submittedByName || 'Unknown'}</p>
                      <p className="text-sm text-muted-foreground">Name</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">{submission.submittedByEmail || 'Unknown'}</p>
                      <p className="text-sm text-muted-foreground">Email</p>
                    </div>
                  </div>
                  
                  {submission.submittedByUvid && (
                    <div className="flex items-start gap-3">
                      <ClipboardList className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-medium">{submission.submittedByUvid}</p>
                        <p className="text-sm text-muted-foreground">UVID</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-3">
                    <CalendarDays className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">{formatDate(submission.createdAt)}</p>
                      <p className="text-sm text-muted-foreground">Submission Date</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <div className="space-y-6">
                <Card className="border border-gray-200 dark:border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-lg">Form Responses</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {submission.content && Object.entries(submission.content).length > 0 ? (
                      Object.entries(submission.content).map(([key, value]) => (
                        <div key={key} className="border-b pb-2 last:border-0 last:pb-0">
                          <p className="text-sm font-medium text-muted-foreground">{key}</p>
                          <p className="mt-1">{typeof value === 'string' ? value : JSON.stringify(value)}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted-foreground">No form responses available</p>
                    )}
                  </CardContent>
                </Card>
                
                {submission.mappedFields && Object.keys(submission.mappedFields).length > 0 && (
                  <Card className="border border-gray-200 dark:border-gray-800 bg-blue-50 dark:bg-blue-900/20">
                    <CardHeader>
                      <CardTitle className="text-lg">Mapped Alumni Fields</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {Object.entries(submission.mappedFields).map(([field, value]) => (
                        <div key={field} className="border-b border-blue-200 dark:border-blue-800 pb-2 last:border-0 last:pb-0">
                          <p className="text-sm font-medium text-blue-800 dark:text-blue-300">{field}</p>
                          <p className="mt-1">{typeof value === 'string' ? value : JSON.stringify(value)}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
            
            <Card className="border border-gray-200 dark:border-gray-800">
              <CardHeader>
                <CardTitle className="text-lg">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea 
                  value={notes} 
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add notes about this submission..."
                  className="min-h-[100px]"
                />
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button onClick={handleSaveNotes}>Save Notes</Button>
              </CardFooter>
            </Card>
          </CardContent>
          
          <CardFooter className="flex flex-wrap gap-2 justify-end border-t pt-6">
            {submission.status !== 'pending' && (
              <Button 
                variant="outline" 
                onClick={() => handleStatusUpdate('pending')}
              >
                <Clock className="h-4 w-4 mr-2" />
                Mark as Pending
              </Button>
            )}
            
            {submission.status !== 'reviewed' && (
              <Button 
                variant="outline" 
                className="border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-900/30"
                onClick={() => handleStatusUpdate('reviewed')}
              >
                <AlertCircle className="h-4 w-4 mr-2" />
                Mark as Reviewed
              </Button>
            )}
            
            {submission.status !== 'processed' && (
              <Button 
                className="bg-uvu-green hover:bg-uvu-green-medium"
                onClick={() => handleStatusUpdate('processed')}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Process Submission
              </Button>
            )}
            
            {submission.status !== 'archived' && (
              <Button 
                variant="outline" 
                className="border-gray-200 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
                onClick={() => handleStatusUpdate('archived')}
              >
                <Archive className="h-4 w-4 mr-2" />
                Archive
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </PageLayout>
  );
};

export default SubmissionDetailPage;
