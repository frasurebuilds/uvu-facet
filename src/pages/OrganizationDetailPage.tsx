import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  fetchOrganizationById, 
  updateOrganization, 
  fetchAlumniByOrganizationId 
} from "@/lib/api";
import PageLayout from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save } from "lucide-react";
import OrganizationInfoCard from "@/components/organizations/OrganizationInfoCard";
import AlumniDisplay from "@/components/alumni/AlumniDisplay";
import { Alumni } from "@/types/models";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import OrganizationLogo from "@/components/organizations/OrganizationLogo";

const OrganizationDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [copiedValues, setCopiedValues] = useState<Record<string, boolean>>({});
  const formRef = useRef<HTMLFormElement>(null);

  // Fetch organization data
  const { 
    data: organization, 
    isLoading: organizationLoading 
  } = useQuery({
    queryKey: ['organization', id],
    queryFn: () => fetchOrganizationById(id as string),
    enabled: !!id,
  });

  // Fetch current alumni
  const { 
    data: currentAlumni = [], 
    isLoading: currentAlumniLoading 
  } = useQuery({
    queryKey: ['organization-alumni-current', id],
    queryFn: () => fetchAlumniByOrganizationId(id as string, true),
    enabled: !!id,
  });

  // Fetch past alumni
  const { 
    data: pastAlumni = [], 
    isLoading: pastAlumniLoading 
  } = useQuery({
    queryKey: ['organization-alumni-past', id],
    queryFn: () => fetchAlumniByOrganizationId(id as string, false),
    enabled: !!id,
  });

  // Update organization mutation
  const updateOrganizationMutation = useMutation({
    mutationFn: updateOrganization,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization', id] });
      toast({
        title: "Success",
        description: "Organization information updated successfully",
      });
    },
    onError: (error) => {
      console.error("Error updating organization:", error);
      toast({
        title: "Error",
        description: "Failed to update organization information",
        variant: "destructive",
      });
    },
  });

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

  const handleOpenLinkedIn = (url: string) => {
    if (!url) return;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleAlumniClick = (alumniId: string) => {
    navigate(`/alumni/${alumniId}`);
  };

  const handleSaveChanges = (updatedData: any) => {
    if (!id) return;
    
    updateOrganizationMutation.mutate({
      id,
      ...updatedData
    });
  };

  const handleBack = () => {
    navigate('/organizations');
  };

  const triggerFormSubmit = () => {
    if (formRef.current) {
      formRef.current.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    }
  };

  const OrganizationTitle = () => (
    <div className="flex items-center gap-2">
      <OrganizationLogo 
        name={organization?.name || ''} 
        website={organization?.website} 
        size="md"
      />
      <span>{organization?.name || "Organization Details"}</span>
    </div>
  );

  return (
    <PageLayout
      title={organization ? <OrganizationTitle /> : "Organization Details"}
      subtitle={organization?.industry}
      actionButton={
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleBack}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Organizations
          </Button>
          <Button 
            className="bg-uvu-green hover:bg-uvu-green-medium"
            onClick={triggerFormSubmit}
            disabled={updateOrganizationMutation.isPending}
          >
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        </div>
      }
    >
      {organizationLoading ? (
        <div className="text-center py-10">
          <p className="text-gray-500">Loading organization data...</p>
        </div>
      ) : organization ? (
        <div className="space-y-8">
          <OrganizationInfoCard
            organization={organization}
            onSave={handleSaveChanges}
            isLoading={updateOrganizationMutation.isPending}
            formRef={formRef}
          />
          
          <div className="mt-6">
            <h2 className="text-2xl font-bold mb-4">Alumni Employees</h2>
            
            <Tabs defaultValue="current">
              <TabsList>
                <TabsTrigger value="current">
                  Current Employees ({currentAlumni?.length || 0})
                </TabsTrigger>
                <TabsTrigger value="past">
                  Past Employees ({pastAlumni?.length || 0})
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="current" className="pt-4">
                <AlumniDisplay
                  viewMode="table"
                  alumni={currentAlumni as Alumni[]}
                  loading={currentAlumniLoading}
                  copiedValues={copiedValues}
                  onAlumniClick={handleAlumniClick}
                  onCopy={handleCopy}
                  onOpenLinkedIn={handleOpenLinkedIn}
                />
              </TabsContent>
              
              <TabsContent value="past" className="pt-4">
                <AlumniDisplay
                  viewMode="table"
                  alumni={pastAlumni as Alumni[]}
                  loading={pastAlumniLoading}
                  copiedValues={copiedValues}
                  onAlumniClick={handleAlumniClick}
                  onCopy={handleCopy}
                  onOpenLinkedIn={handleOpenLinkedIn}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-gray-500">Organization not found</p>
        </div>
      )}
    </PageLayout>
  );
};

export default OrganizationDetailPage;
