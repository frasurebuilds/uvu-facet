
import React from "react";
import { FormSubmission } from "@/types/models";
import { Clock, AlertCircle, CheckCircle, Archive } from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
    
    return null;
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

export default FormSubmissionCard;
