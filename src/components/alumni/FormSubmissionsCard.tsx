
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FormSubmission } from "@/types/models";
import { fetchFormSubmissions, deleteFormSubmission } from "@/lib/api";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Eye, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface FormSubmissionsCardProps {
  alumniId?: string;
  alumniEmail?: string;
  uvid?: string;
}

const FormSubmissionsCard = ({ alumniId, alumniEmail, uvid }: FormSubmissionsCardProps) => {
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [submissionToDelete, setSubmissionToDelete] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const loadFormSubmissions = async () => {
    try {
      setLoading(true);
      const allSubmissions = await fetchFormSubmissions();
      
      // Filter submissions by alumniId, email or UVID
      const filteredSubmissions = allSubmissions.filter(sub => {
        if (alumniId && sub.submittedByAlumniId === alumniId) return true;
        if (alumniEmail && sub.submittedByEmail === alumniEmail) return true;
        if (uvid && sub.submittedByUvid === uvid) return true;
        return false;
      });
      
      // Convert the JSON data to the proper FormSubmission type
      const typedSubmissions: FormSubmission[] = filteredSubmissions.map(sub => ({
        ...sub,
        content: typeof sub.content === 'string' ? JSON.parse(sub.content) : sub.content,
        mappedFields: typeof sub.mappedFields === 'string' ? JSON.parse(sub.mappedFields || '{}') : (sub.mappedFields || {}),
        // Ensure status is one of the allowed values
        status: (sub.status as "pending" | "reviewed" | "processed" | "archived") || "pending"
      }));
      
      setSubmissions(typedSubmissions);
    } catch (error) {
      console.error("Failed to load form submissions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFormSubmissions();
  }, [alumniId, alumniEmail, uvid]);

  const handleDeleteSubmission = async () => {
    if (!submissionToDelete) return;
    
    try {
      await deleteFormSubmission(submissionToDelete);
      
      // Remove the deleted submission from the state
      setSubmissions(submissions.filter(sub => sub.id !== submissionToDelete));
      
      toast({
        title: "Submission deleted",
        description: "The form submission has been successfully deleted.",
      });
      
      setSubmissionToDelete(null);
    } catch (error) {
      console.error("Failed to delete submission:", error);
      toast({
        title: "Error",
        description: "Failed to delete the submission. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Form Submissions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Loading submissions...</p>
        </CardContent>
      </Card>
    );
  }

  if (submissions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Form Submissions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No form submissions found for this alumni.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Form Submissions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Form Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {submissions.map((submission) => (
                <TableRow key={submission.id}>
                  <TableCell>
                    {format(new Date(submission.createdAt), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell>
                    {submission.type}
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      submission.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      submission.status === 'processed' ? 'bg-green-100 text-green-800' :
                      submission.status === 'reviewed' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate(`/submissions/${submission.id}`)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => setSubmissionToDelete(submission.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AlertDialog open={!!submissionToDelete} onOpenChange={(open) => !open && setSubmissionToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the form submission and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteSubmission}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default FormSubmissionsCard;
