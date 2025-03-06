
import { useState } from "react";
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
import { mockOrganizations } from "@/data/mockData";
import { Organization } from "@/types/models";
import { Search, Building, Globe, MapPin, Users, Phone, Mail, PlusCircle } from "lucide-react";

const OrganizationsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");

  const filteredOrganizations = mockOrganizations.filter((org) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      org.name.toLowerCase().includes(searchLower) ||
      org.industry.toLowerCase().includes(searchLower) ||
      (org.location && org.location.toLowerCase().includes(searchLower))
    );
  });

  const renderTable = () => (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Organization</TableHead>
            <TableHead>Industry</TableHead>
            <TableHead className="hidden md:table-cell">Location</TableHead>
            <TableHead className="hidden lg:table-cell">Employees</TableHead>
            <TableHead className="hidden lg:table-cell">Contact Person</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredOrganizations.map((org) => (
            <TableRow key={org.id} className="hover:bg-gray-50 cursor-pointer">
              <TableCell className="font-medium">{org.name}</TableCell>
              <TableCell>{org.industry}</TableCell>
              <TableCell className="hidden md:table-cell">{org.location || "-"}</TableCell>
              <TableCell className="hidden lg:table-cell">{org.employeeCount || "-"}</TableCell>
              <TableCell className="hidden lg:table-cell">{org.contactPerson || "-"}</TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  {org.website && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-gray-500 hover:text-uvu-green"
                    >
                      <Globe size={16} />
                    </Button>
                  )}
                  {org.contactEmail && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-gray-500 hover:text-uvu-green"
                    >
                      <Mail size={16} />
                    </Button>
                  )}
                  {org.contactPhone && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-gray-500 hover:text-uvu-green"
                    >
                      <Phone size={16} />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  const renderCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredOrganizations.map((org) => (
        <OrganizationCard key={org.id} organization={org} />
      ))}
    </div>
  );

  return (
    <PageLayout
      title="Organizations"
      subtitle="Companies and organizations affiliated with UVU"
      actionButton={
        <Button className="bg-uvu-green hover:bg-uvu-green-medium">
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

      {filteredOrganizations.length > 0 ? (
        viewMode === "table" ? renderTable() : renderCards()
      ) : (
        <div className="text-center py-10">
          <p className="text-gray-500">No organizations found matching your search criteria.</p>
        </div>
      )}
    </PageLayout>
  );
};

const OrganizationCard = ({ organization }: { organization: Organization }) => {
  const firstLetter = organization.name[0];

  return (
    <Card className="uvu-card card-hover-effect overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-3">
          <div className="bg-uvu-green h-10 w-10 rounded-full flex items-center justify-center text-white font-bold">
            {firstLetter}
          </div>
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
          {organization.employeeCount && (
            <div className="flex items-center text-sm">
              <Users size={16} className="mr-2 text-gray-500" />
              <span>{organization.employeeCount} employees</span>
            </div>
          )}
          {organization.contactPerson && (
            <div className="flex items-center text-sm">
              <Mail size={16} className="mr-2 text-gray-500" />
              <span>{organization.contactPerson}</span>
            </div>
          )}
          {organization.partnerships && organization.partnerships.length > 0 && (
            <div className="mt-3">
              <p className="text-xs text-gray-500 mb-1">Partnerships:</p>
              <div className="flex flex-wrap gap-1">
                {organization.partnerships.map((partnership, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-uvu-green/10 text-uvu-green"
                  >
                    {partnership}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-3 border-t flex justify-end gap-2">
        {organization.website && (
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            title="Visit Website"
          >
            <Globe size={14} />
          </Button>
        )}
        {organization.contactEmail && (
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            title="Email Contact"
          >
            <Mail size={14} />
          </Button>
        )}
        {organization.contactPhone && (
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            title="Call Contact"
          >
            <Phone size={14} />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default OrganizationsPage;
