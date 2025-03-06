
import { useState } from "react";
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
import { mockFormSubmissions } from "@/data/mockData";
import { FormSubmission } from "@/types/models";
import { Search, FileText, AlertCircle, CheckCircle, Clock, Archive } from "lucide-react";

const FormSubmissionsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const filteredSubmissions = mockFormSubmissions.filter((submission) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      submission.submittedBy.name.toLowerCase().includes(searchLower) ||
      submission.submittedBy.email.toLowerCase().includes(searchLower) ||
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
            <SelectItem value="update">Updates</SelectItem>
            <SelectItem value="new-info">New Information</SelectItem>
            <SelectItem value="event-rsvp">Event RSVPs</SelectItem>
            <SelectItem value="volunteer">Volunteer</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredSubmissions.length > 0 ? (
        <div className="space-y-4">
          {filteredSubmissions.map((submission) => (
            <FormSubmissionCard
              key={submission.id}
              submission={submission}
              statusIcon={getStatusIcon(submission.status)}
              formatDate={formatDate}
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
}

const FormSubmissionCard = ({
  submission,
  statusIcon,
  formatDate,
}: FormSubmissionCardProps) => {
  return (
    <Card className="uvu-card card-hover-effect">
      <CardHeader className="pb-2 pt-4 px-5">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <CardTitle className="text-lg">{submission.submittedBy.name}</CardTitle>
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
              {submission.submittedBy.email} • 
              Submitted {formatDate(submission.createdAt)}
            </div>
          </div>

          <span
            className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-uvu-green/10 text-uvu-green"
          >
            {submission.type.replace("-", " ")}
          </span>
        </div>
      </CardHeader>
      <CardContent className="pb-3 px-5">
        <div className="border rounded-md p-3 bg-gray-50">
          {submission.type === 'update' && (
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="font-medium">New Job Title:</span>
                <span>{submission.content.newJobTitle}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="font-medium">New Company:</span>
                <span>{submission.content.newCompany}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="font-medium">Start Date:</span>
                <span>{submission.content.startDate}</span>
              </div>
            </div>
          )}
          
          {submission.type === 'event-rsvp' && (
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
          )}
          
          {submission.type === 'volunteer' && (
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
          )}
          
          {submission.type === 'new-info' && (
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
          )}
          
          {submission.type === 'other' && (
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
          )}
        </div>
        
        {submission.notes && (
          <div className="mt-3 text-sm">
            <span className="font-medium text-gray-700">Notes:</span>
            <p className="text-gray-600 italic">{submission.notes}</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-3 px-5 border-t flex justify-end gap-2">
        <Button variant="outline" size="sm">
          Add Note
        </Button>
        {submission.status === "pending" && (
          <Button variant="outline" size="sm" className="text-blue-600 border-blue-200">
            Mark as Reviewed
          </Button>
        )}
        {(submission.status === "pending" || submission.status === "reviewed") && (
          <Button size="sm" className="bg-uvu-green hover:bg-uvu-green-medium">
            Process
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default FormSubmissionsPage;
