
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageLayout from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { UserPlus, FileText, EyeOff, Eye } from "lucide-react";
import { Alumni, JobHistory } from "@/types/models";
import { fetchAlumni, fetchCurrentJobByAlumniId } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { TooltipProvider } from "@/components/ui/tooltip";
import AlumniControls from "@/components/alumni/AlumniControls";
import AlumniDisplay from "@/components/alumni/AlumniDisplay";
import AlumniImportExportDialog from "@/components/alumni/AlumniImportExportDialog";

const AlumniPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [alumni, setAlumni] = useState<Alumni[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedValues, setCopiedValues] = useState<Record<string, boolean>>({});
  const [showImportExport, setShowImportExport] = useState(false);
  const [showDoNotContact, setShowDoNotContact] = useState(false);
  const [alumniJobs, setAlumniJobs] = useState<Record<string, JobHistory | null>>({});
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const loadAlumni = async () => {
      try {
        setLoading(true);
        const data = await fetchAlumni();
        setAlumni(data);

        // Fetch current jobs for all alumni
        const jobsPromises = data.map(async (alum) => {
          try {
            const currentJob = await fetchCurrentJobByAlumniId(alum.id);
            return { alumniId: alum.id, job: currentJob };
          } catch (error) {
            console.error(`Error fetching job for alumni ${alum.id}:`, error);
            return { alumniId: alum.id, job: null };
          }
        });

        const jobsResults = await Promise.all(jobsPromises);
        const jobsMap: Record<string, JobHistory | null> = {};
        
        jobsResults.forEach(({ alumniId, job }) => {
          jobsMap[alumniId] = job;
        });

        setAlumniJobs(jobsMap);
      } catch (error) {
        console.error("Failed to load alumni:", error);
        toast({
          title: "Error",
          description: "Failed to load alumni data.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadAlumni();
  }, [toast]);

  const filteredAlumni = alumni.filter((alum) => {
    // First filter by search term
    const searchMatch = 
      alum.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alum.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alum.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alum.major.toLowerCase().includes(searchTerm.toLowerCase());

    // Then filter by do not contact status
    const doNotContactMatch = showDoNotContact ? true : !alum.doNotContact;

    return searchMatch && doNotContactMatch;
  });

  const handleAlumniClick = (id: string) => {
    navigate(`/alumni/${id}`);
  };

  const handleCopy = (text: string, label: string) => {
    if (!text) return;
    
    navigator.clipboard.writeText(text)
      .then(() => {
        setCopiedValues({ ...copiedValues, [text]: true });
        toast({
          title: "Copied!",
          description: `${label} copied to clipboard`,
        });
        setTimeout(() => {
          setCopiedValues({ ...copiedValues, [text]: false });
        }, 2000);
      })
      .catch(err => {
        console.error('Failed to copy text: ', err);
        toast({
          title: "Error",
          description: "Failed to copy to clipboard",
          variant: "destructive",
        });
      });
  };

  const handleOpenLinkedIn = (linkedInUrl: string) => {
    if (!linkedInUrl) return;
    
    const fullUrl = linkedInUrl.startsWith('http') ? linkedInUrl : `https://${linkedInUrl}`;
    window.open(fullUrl, '_blank', 'noopener,noreferrer');
  };

  const handleAddAlumni = () => {
    toast({
      title: "Coming Soon",
      description: "Alumni creation functionality will be available soon",
    });
  };

  const handleImportExport = () => {
    setShowImportExport(true);
  };

  const toggleDoNotContactView = () => {
    setShowDoNotContact(prev => !prev);
  };

  return (
    <PageLayout
      title="Alumni Directory"
      subtitle="Manage and view UVU alumni records"
      actionButton={
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={toggleDoNotContactView}
            className="border-uvu-green text-uvu-green hover:bg-uvu-green hover:text-white"
          >
            {showDoNotContact ? (
              <>
                <EyeOff className="mr-2 h-4 w-4" />
                Hide Restricted Contacts
              </>
            ) : (
              <>
                <Eye className="mr-2 h-4 w-4" />
                Show Restricted Contacts
              </>
            )}
          </Button>
          <Button 
            variant="outline"
            onClick={handleImportExport}
            className="border-uvu-green text-uvu-green hover:bg-uvu-green hover:text-white"
          >
            <FileText className="mr-2 h-4 w-4" />
            Import/Export
          </Button>
          <Button 
            className="bg-uvu-green hover:bg-uvu-green-medium"
            onClick={handleAddAlumni}
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Add Alumni
          </Button>
        </div>
      }
    >
      <AlumniControls
        searchTerm={searchTerm}
        viewMode={viewMode}
        onSearchChange={setSearchTerm}
        onViewModeChange={setViewMode}
        onAddAlumni={handleAddAlumni}
      />

      <TooltipProvider>
        <AlumniDisplay
          viewMode={viewMode}
          alumni={filteredAlumni}
          loading={loading}
          copiedValues={copiedValues}
          onAlumniClick={handleAlumniClick}
          onCopy={handleCopy}
          onOpenLinkedIn={handleOpenLinkedIn}
          alumniJobs={alumniJobs}
        />
      </TooltipProvider>

      <AlumniImportExportDialog 
        open={showImportExport}
        onOpenChange={setShowImportExport}
        alumni={filteredAlumni}
      />
    </PageLayout>
  );
};

export default AlumniPage;
