
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FormSubmission } from "@/types/models";
import { fetchFormSubmissions } from "@/lib/api";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Eye } from "lucide-react";

interface FormSubmissionsCardProps {
  alumniId?: string;
  alumniEmail?: string;
  uvid?: string;
}

const FormSubmissionsCard = ({ alumniId, alumniEmail, uvid }: FormSubmissionsCardProps) => {
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
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

    loadFormSubmissions();
  }, [alumniId, alumniEmail, uvid]);

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
              <TableHead className="text-right">Action</TableHead>
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
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate(`/submissions/${submission.id}`)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default FormSubmissionsCard;
