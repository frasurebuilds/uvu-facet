
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageLayout from "@/components/layout/PageLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alumni } from "@/types/models";
import { Search, UserPlus, Phone, Mail, Linkedin } from "lucide-react";
import { fetchAlumni } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const AlumniPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [alumni, setAlumni] = useState<Alumni[]>([]);
  const [loading, setLoading] = useState(true);
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

  const renderTable = () => (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Graduation</TableHead>
            <TableHead className="hidden md:table-cell">Major</TableHead>
            <TableHead className="hidden lg:table-cell">Current Position</TableHead>
            <TableHead className="hidden lg:table-cell">Organization</TableHead>
            <TableHead className="text-right">Contact</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredAlumni.map((alum) => (
            <TableRow 
              key={alum.id} 
              className="hover:bg-gray-50 cursor-pointer"
              onClick={() => handleAlumniClick(alum.id)}
            >
              <TableCell className="font-medium">
                {alum.firstName} {alum.lastName}
              </TableCell>
              <TableCell>{alum.graduationYear}</TableCell>
              <TableCell className="hidden md:table-cell">{alum.major}</TableCell>
              <TableCell className="hidden lg:table-cell">
                {/* This will be populated when we have job history integration */}
                {"-"}
              </TableCell>
              <TableCell className="hidden lg:table-cell">
                {/* This will be populated when we have job history integration */}
                {"-"}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                  {alum.phone && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-gray-500 hover:text-uvu-green"
                    >
                      <Phone size={16} />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-gray-500 hover:text-uvu-green"
                  >
                    <Mail size={16} />
                  </Button>
                  {alum.linkedIn && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-gray-500 hover:text-uvu-green"
                    >
                      <Linkedin size={16} />
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
      {filteredAlumni.map((alum) => (
        <AlumniCard 
          key={alum.id} 
          alumni={alum} 
          onClick={() => handleAlumniClick(alum.id)}
        />
      ))}
    </div>
  );

  return (
    <PageLayout
      title="Alumni Directory"
      subtitle="Manage and view UVU alumni records"
      actionButton={
        <Button className="bg-uvu-green hover:bg-uvu-green-medium">
          <UserPlus className="mr-2 h-4 w-4" />
          Add Alumni
        </Button>
      }
    >
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            placeholder="Search alumni by name, email, major..."
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

      {loading ? (
        <div className="text-center py-10">
          <p className="text-gray-500">Loading alumni data...</p>
        </div>
      ) : filteredAlumni.length > 0 ? (
        viewMode === "table" ? renderTable() : renderCards()
      ) : (
        <div className="text-center py-10">
          <p className="text-gray-500">No alumni found matching your search criteria.</p>
        </div>
      )}
    </PageLayout>
  );
};

const AlumniCard = ({ alumni, onClick }: { alumni: Alumni; onClick: () => void }) => {
  const initials = `${alumni.firstName[0]}${alumni.lastName[0]}`;

  return (
    <Card className="uvu-card card-hover-effect overflow-hidden cursor-pointer" onClick={onClick}>
      <CardContent className="p-0">
        <div className="h-3 bg-uvu-green w-full" />
        <div className="p-5">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-uvu-green h-12 w-12 rounded-full flex items-center justify-center text-white font-bold">
              {initials}
            </div>
            <div>
              <h3 className="font-bold">
                {alumni.firstName} {alumni.lastName}
              </h3>
              <p className="text-gray-500 text-sm">Alumni</p>
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Graduation:</span>
              <span>{alumni.graduationYear}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Degree:</span>
              <span>{alumni.degree}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Major:</span>
              <span>{alumni.major}</span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
            {alumni.phone && (
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
              >
                <Phone size={14} />
              </Button>
            )}
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
            >
              <Mail size={14} />
            </Button>
            {alumni.linkedIn && (
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
              >
                <Linkedin size={14} />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AlumniPage;
