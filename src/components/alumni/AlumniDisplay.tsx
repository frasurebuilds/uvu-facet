
import { Alumni, JobHistory } from "@/types/models";
import AlumniTable from "./AlumniTable";
import AlumniCard from "./AlumniCard";

interface AlumniDisplayProps {
  viewMode: "table" | "cards";
  alumni: Alumni[];
  loading: boolean;
  copiedValues: Record<string, boolean>;
  onAlumniClick: (id: string) => void;
  onCopy: (text: string, label: string) => void;
  onOpenLinkedIn: (url: string) => void;
  alumniJobs?: Record<string, JobHistory | null>;
}

const AlumniDisplay = ({
  viewMode,
  alumni,
  loading,
  copiedValues,
  onAlumniClick,
  onCopy,
  onOpenLinkedIn,
  alumniJobs = {}
}: AlumniDisplayProps) => {
  if (loading) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">Loading alumni data...</p>
      </div>
    );
  }

  if (alumni.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">No alumni found matching your search criteria.</p>
      </div>
    );
  }

  if (viewMode === "table") {
    return (
      <AlumniTable
        alumni={alumni}
        copiedValues={copiedValues}
        onAlumniClick={onAlumniClick}
        onCopy={onCopy}
        onOpenLinkedIn={onOpenLinkedIn}
        alumniJobs={alumniJobs}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {alumni.map((alumni) => (
        <AlumniCard
          key={alumni.id}
          alumni={alumni}
          onClick={() => onAlumniClick(alumni.id)}
          onCopy={onCopy}
          onOpenLinkedIn={onOpenLinkedIn}
          copiedValues={copiedValues}
          currentJob={alumniJobs[alumni.id]}
        />
      ))}
    </div>
  );
};

export default AlumniDisplay;
