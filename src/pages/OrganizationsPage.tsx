import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import PageLayout from "@/components/layout/PageLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Organization } from "@/types/models";
import { Search, Building, Globe, MapPin, Users, Phone, Mail, PlusCircle, Copy, CheckCircle, Edit, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { fetchOrganizations } from "@/lib/api";
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription, DialogFooter, DialogHeader } from "@/components/ui/dialog";
import OrganizationFormDialog from "@/components/organizations/OrganizationFormDialog";
import OrganizationLogo from "@/components/organizations/OrganizationLogo";

const OrganizationsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [copiedValues, setCopiedValues] = useState<Record<string, boolean>>({});

  const { data: organizations = [], isLoading } = useQuery({
    queryKey: ['organizations'],
    queryFn: fetchOrganizations
  });

  const filteredOrganizations = organizations.filter((org) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      org.name.toLowerCase().includes(searchLower) ||
      org.industry.toLowerCase().includes(searchLower) ||
      (org.location && org.location.toLowerCase().includes(searchLower))
    );
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

  const handleOpenLink = (url: string) => {
    if (!url) return;
    
    const fullUrl = url.startsWith('http') ? url : `https://${url}`;
    window.open(fullUrl, '_blank', 'noopener,noreferrer');
  };

  const handleAddOrganization = () => {
    setShowCreateDialog(true);
  };

  const handleEditOrganization = (id: string) => {
    navigate(`/organizations/${id}`);
  };

  const handleOrganizationClick = (id: string) => {
    navigate(`/organizations/${id}`);
  };

  const renderTable = () => (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Organization</TableHead>
            <TableHead>Industry</TableHead>
            <TableHead className="hidden md:table-cell">Location</TableHead>
            <TableHead className="hidden lg:table-cell">Alumni Employees</TableHead>
            <TableHead className="hidden lg:table-cell">Contact Person</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-4">
                Loading organizations...
              </TableCell>
            </TableRow>
          ) : filteredOrganizations.length > 0 ? (
            filteredOrganizations.map((org) => (
              <TableRow 
                key={org.id} 
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => handleOrganizationClick(org.id)}
              >
                <TableCell className="font-medium">
                  <div className="flex items-center gap-3">
                    <OrganizationLogo name={org.name} website={org.website} size="sm" />
                    <span>{org.name}</span>
                  </div>
                </TableCell>
                <TableCell>{org.industry}</TableCell>
                <TableCell className="hidden md:table-cell">{org.location || "-"}</TableCell>
                <TableCell className="hidden lg:table-cell">{org.employeeCount !== undefined ? org.employeeCount : "-"}</TableCell>
                <TableCell className="hidden lg:table-cell">{org.contactPerson || "-"}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-gray-500 hover:text-uvu-green"
                          onClick={() => handleEditOrganization(org.id)}
                        >
                          <Edit size={16} />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Edit</p>
                      </TooltipContent>
                    </Tooltip>

                    {org.website && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-gray-500 hover:text-uvu-green"
                            onClick={() => handleOpenLink(org.website || "")}
                          >
                            <ExternalLink size={16} />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Visit Website</p>
                        </TooltipContent>
                      </Tooltip>
                    )}

                    {org.website && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-gray-500 hover:text-uvu-green"
                            onClick={() => handleCopy(org.website || "", "Website")}
                          >
                            {copiedValues[org.website || ""] ? <CheckCircle size={16} /> : <Copy size={16} />}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Copy Website URL</p>
                        </TooltipContent>
                      </Tooltip>
                    )}

                    {org.contactEmail && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-gray-500 hover:text-uvu-green"
                            onClick={() => handleCopy(org.contactEmail || "", "Email")}
                          >
                            {copiedValues[org.contactEmail || ""] ? <CheckCircle size={16} /> : <Mail size={16} />}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Copy Email</p>
                        </TooltipContent>
                      </Tooltip>
                    )}

                    {org.contactPhone && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-gray-500 hover:text-uvu-green"
                            onClick={() => handleCopy(org.contactPhone || "", "Phone number")}
                          >
                            {copiedValues[org.contactPhone || ""] ? <CheckCircle size={16} /> : <Phone size={16} />}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Copy Phone Number</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-4">
                No organizations found matching your search criteria.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );

  const renderCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {isLoading ? (
        <div className="col-span-full text-center py-10">
          <p className="text-gray-500">Loading organizations...</p>
        </div>
      ) : filteredOrganizations.length > 0 ? (
        filteredOrganizations.map((org) => (
          <OrganizationCard 
            key={org.id} 
            organization={org}
            onEdit={handleEditOrganization}
            onCopy={handleCopy}
            onOpenLink={handleOpenLink}
            copiedValues={copiedValues}
          />
        ))
      ) : (
        <div className="col-span-full text-center py-10">
          <p className="text-gray-500">No organizations found matching your search criteria.</p>
        </div>
      )}
    </div>
  );

  return (
    <PageLayout
      title="Organizations"
      subtitle="Companies and organizations affiliated with UVU"
      actionButton={
        <Button 
          className="bg-uvu-green hover:bg-uvu-green-medium"
          onClick={handleAddOrganization}
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Organization
        </Button>
      }
    >
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            placeholder="Search organizations by name, industry, location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={viewMode === "table" ? "default" : "outline"}
            className={viewMode === "table" ? "bg-uvu-green hover:bg-uvu-green-medium" : ""}
            onClick={() => setViewMode("table")}
          >
            Table View
          </Button>
          <Button
            variant={viewMode === "cards" ? "default" : "outline"}
            className={viewMode === "cards" ? "bg-uvu-green hover:bg-uvu-green-medium" : ""}
            onClick={() => setViewMode("cards")}
          >
            Card View
          </Button>
        </div>
      </div>

      {viewMode === "table" ? renderTable() : renderCards()}

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New Organization</DialogTitle>
            <DialogDescription>
              Enter the details for the new organization.
            </DialogDescription>
          </DialogHeader>
          
          <OrganizationFormDialog
            onSuccess={() => {
              setShowCreateDialog(false);
              toast({
                title: "Success",
                description: "Organization created successfully",
              });
            }}
            onCancel={() => setShowCreateDialog(false)}
          />
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
};

interface OrganizationCardProps {
  organization: Organization;
  onEdit: (id: string) => void;
  onCopy: (text: string, label: string) => void;
  onOpenLink: (url: string) => void;
  copiedValues: Record<string, boolean>;
}

const OrganizationCard = ({
  organization,
  onEdit,
  onCopy,
  onOpenLink,
  copiedValues
}: OrganizationCardProps) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/organizations/${organization.id}`);
  };

  return (
    <Card className="uvu-card card-hover-effect overflow-hidden cursor-pointer" onClick={handleCardClick}>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-3">
          <OrganizationLogo 
            name={organization.name} 
            website={organization.website} 
            size="md"
          />
          <div>
            <CardTitle className="text-lg">{organization.name}</CardTitle>
            <CardDescription>{organization.industry}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="space-y-2">
          {organization.location && (
            <div className="flex items-center text-sm">
              <MapPin size={16} className="mr-2 text-gray-500" />
              <span>{organization.location}</span>
            </div>
          )}
          {organization.employeeCount !== undefined && (
            <div className="flex items-center text-sm">
              <Users size={16} className="mr-2 text-gray-500" />
              <span>{organization.employeeCount} alumni employees</span>
            </div>
          )}
          {organization.contactPerson && (
            <div className="flex items-center text-sm">
              <Mail size={16} className="mr-2 text-gray-500" />
              <span>{organization.contactPerson}</span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-3 border-t flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(organization.id);
              }}
            >
              <Edit size={14} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Edit</p>
          </TooltipContent>
        </Tooltip>

        {organization.website && (
          <>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenLink(organization.website || "");
                  }}
                >
                  <ExternalLink size={14} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Visit Website</p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCopy(organization.website || "", "Website");
                  }}
                >
                  {copiedValues[organization.website || ""] ? <CheckCircle size={14} /> : <Copy size={14} />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Copy Website URL</p>
              </TooltipContent>
            </Tooltip>
          </>
        )}

        {organization.contactEmail && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={(e) => {
                  e.stopPropagation();
                  onCopy(organization.contactEmail || "", "Email");
                }}
              >
                {copiedValues[organization.contactEmail || ""] ? <CheckCircle size={14} /> : <Mail size={14} />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Copy Email</p>
            </TooltipContent>
          </Tooltip>
        )}

        {organization.contactPhone && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={(e) => {
                  e.stopPropagation();
                  onCopy(organization.contactPhone || "", "Phone number");
                }}
              >
                {copiedValues[organization.contactPhone || ""] ? <CheckCircle size={14} /> : <Phone size={14} />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Copy Phone Number</p>
            </TooltipContent>
          </Tooltip>
        )}
      </CardFooter>
    </Card>
  );
};

export default OrganizationsPage;
