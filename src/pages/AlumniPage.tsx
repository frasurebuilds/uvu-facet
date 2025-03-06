
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageLayout from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { Alumni } from "@/types/models";
import { fetchAlumni } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { TooltipProvider } from "@/components/ui/tooltip";
import AlumniControls from "@/components/alumni/AlumniControls";
import AlumniDisplay from "@/components/alumni/AlumniDisplay";

const AlumniPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [alumni, setAlumni] = useState<Alumni[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedValues, setCopiedValues] = useState<Record<string, boolean>>({});
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const loadAlumni = async () => {
      try {
        setLoading(true);
        const data = await fetchAlumni();
        setAlumni(data);
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
    const searchLower = searchTerm.toLowerCase();
    return (
      alum.firstName.toLowerCase().includes(searchLower) ||
      alum.lastName.toLowerCase().includes(searchLower) ||
      alum.email.toLowerCase().includes(searchLower) ||
      alum.major.toLowerCase().includes(searchLower)
    );
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

  return (
    <PageLayout
      title="Alumni Directory"
      subtitle="Manage and view UVU alumni records"
      actionButton={
        <Button 
          className="bg-uvu-green hover:bg-uvu-green-medium"
          onClick={handleAddAlumni}
        >
          <UserPlus className="mr-2 h-4 w-4" />
          Add Alumni
        </Button>
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
        />
      </TooltipProvider>
    </PageLayout>
  );
};

export default AlumniPage;
