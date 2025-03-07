
import { useEffect } from "react";
import PageLayout from "@/components/layout/PageLayout";
import { useFormSubmissions } from "@/hooks/use-form-submissions";
import SearchAndFilterBar from "@/components/form-submissions/SearchAndFilterBar";
import FormSubmissionCard from "@/components/form-submissions/FormSubmissionCard";
import NoteDialog from "@/components/form-submissions/NoteDialog";
import { getStatusIcon, formatDate } from "@/components/form-submissions/submission-utils";

const FormSubmissionsPage = () => {
  const {
    submissions,
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
  } = useFormSubmissions();

  useEffect(() => {
    if (error) {
      console.error("Error loading submissions:", error);
    }
  }, [error]);

  return (
    <PageLayout
      title="Form Submissions"
      subtitle="Review and process incoming form submissions"
    >
      <SearchAndFilterBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        typeFilter={typeFilter}
        setTypeFilter={setTypeFilter}
      />

      {isLoading ? (
        <div className="text-center py-10">
          <p className="text-gray-500">Loading form submissions...</p>
        </div>
      ) : submissions.length > 0 ? (
        <div className="space-y-4">
          {submissions.map((submission) => (
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

      <NoteDialog
        open={noteDialogOpen}
        onOpenChange={setNoteDialogOpen}
        noteText={noteText}
        setNoteText={setNoteText}
        onSave={handleAddNote}
      />
    </PageLayout>
  );
};

export default FormSubmissionsPage;
