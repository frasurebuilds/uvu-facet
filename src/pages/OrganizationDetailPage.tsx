import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import PageLayout from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ExternalLink, Pencil, Save, Copy, Check, ArrowLeft } from "lucide-react";
import { fetchOrganizationById, updateOrganization, fetchAlumniByOrganizationId } from "@/lib/api";
import OrganizationFormDialog from "@/components/organizations/OrganizationFormDialog";
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

  const [organization, setOrganization] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [isCurrentEmployees, setIsCurrentEmployees] = useState(true);
  const [alumni, setAlumni] = useState<Alumni[]>([]);
  const [saving, setSaving] = useState(false);

  const websiteRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!id) return;

    const loadOrganization = async () => {
      const orgData = await fetchOrganizationById(id);
      setOrganization(orgData);
      setFormData(orgData);
    };

    loadOrganization();
  }, [id]);

  useEffect(() => {
    if (!organization) return;

    const loadAlumni = async () => {
      const alumniData = await fetchAlumniByOrganizationId(organization.id, isCurrentEmployees);
      setAlumni(alumniData);
    };

    loadAlumni();
  }, [organization, isCurrentEmployees]);

  const handleCopyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: `${label} copied!`,
    });
  };

  const handleEditToggle = () => {
    setEditMode(!editMode);
    if (!editMode && organization) {
      setFormData(organization);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organization) return;

    try {
      setSaving(true);
      const updatedOrganization = await updateOrganization({
        id: organization.id,
        ...formData,
      });
      setOrganization(updatedOrganization);
      setEditMode(false);
      // Invalidate and refetch organization data
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      toast({
        title: "Success",
        description: "Organization updated successfully.",
      });
    } catch (error) {
      console.error("Failed to update organization:", error);
      toast({
        title: "Error",
        description: "Failed to update organization.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
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
      title={<OrganizationTitle />}
      subtitle={organization?.industry}
      actionButton={
        <div className="flex gap-3">
          {isCurrentEmployees && (
            <Button 
              variant="outline" 
              onClick={() => setIsCurrentEmployees(false)}
            >
              Show All Alumni
            </Button>
          )}
          {!isCurrentEmployees && organization && (
            <Button 
              variant="outline" 
              onClick={() => setIsCurrentEmployees(true)}
            >
              Show Current Employees
            </Button>
          )}
          {organization && (
            <Button 
              className="bg-uvu-green hover:bg-uvu-green-medium"
              onClick={handleEditToggle}
            >
              {editMode ? (
                <>
                  <Save className="mr-2 h-4 w-4" /> Save
                </>
              ) : (
                <>
                  <Pencil className="mr-2 h-4 w-4" /> Edit
                </>
              )}
            </Button>
          )}
        </div>
      }
    >
      <Button 
        variant="ghost" 
        className="w-fit" 
        onClick={() => navigate("/organizations")}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Organization List
      </Button>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <OrganizationInfoCard 
          organization={organization}
          formData={formData}
          editMode={editMode}
          handleChange={handleChange}
          handleSave={handleSave}
          saving={saving}
        />
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <p className="text-sm font-medium">Website</p>
                <div className="flex items-center gap-2">
                  <a
                    href={organization?.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline truncate"
                  >
                    {organization?.website || "N/A"}
                  </a>
                  {organization?.website && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleCopyToClipboard(organization.website, "Website")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  )}
                  {organization?.website && (
                    <a
                      href={organization?.website}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button variant="ghost" size="icon">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </a>
                  )}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium">Contact Person</p>
                <div className="flex items-center gap-2">
                  <span>{organization?.contactPerson || "N/A"}</span>
                  {organization?.contactPerson && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleCopyToClipboard(organization.contactPerson, "Contact Person")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <p className="text-sm font-medium">Contact Email</p>
                <div className="flex items-center gap-2">
                  <a
                    href={`mailto:${organization?.contactEmail}`}
                    className="text-blue-500 hover:underline"
                  >
                    {organization?.contactEmail || "N/A"}
                  </a>
                  {organization?.contactEmail && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleCopyToClipboard(organization.contactEmail, "Contact Email")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium">Contact Phone</p>
                <div className="flex items-center gap-2">
                  <span>{organization?.contactPhone || "N/A"}</span>
                  {organization?.contactPhone && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleCopyToClipboard(organization.contactPhone, "Contact Phone")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium">Location</p>
              <div className="flex items-center gap-2">
                <span>{organization?.location || "N/A"}</span>
                {organization?.location && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleCopyToClipboard(organization.location, "Location")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Alumni at {organization?.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <AlumniDisplay alumni={alumni} />
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default OrganizationDetailPage;
