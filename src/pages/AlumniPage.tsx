import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageLayout from "@/components/layout/PageLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alumni } from "@/types/models";
import { Search, UserPlus, Phone, Mail, Linkedin, Copy, CheckCircle, ExternalLink, UserX } from "lucide-react";
import { fetchAlumni } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";

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
                <div className="flex items-center gap-2">
                  {alum.firstName} {alum.lastName}
                  {alum.doNotContact && (
                    <Tooltip>
                      <TooltipTrigger>
                        <UserX size={16} className="text-red-500" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Do Not Contact</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
              </TableCell>
              <TableCell>{alum.graduationYear}</TableCell>
              <TableCell className="hidden md:table-cell">{alum.major}</TableCell>
              <TableCell className="hidden lg:table-cell">
                {"-"}
              </TableCell>
              <TableCell className="hidden lg:table-cell">
                {"-"}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                  {alum.phone && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className={`${alum.doNotContact ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:text-uvu-green'}`}
                          onClick={() => !alum.doNotContact && handleCopy(alum.phone || "", "Phone number")}
                          disabled={alum.doNotContact}
                        >
                          {copiedValues[alum.phone || ""] ? <CheckCircle size={16} /> : <Phone size={16} />}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{alum.doNotContact ? 'Copying restricted' : 'Copy Phone Number'}</p>
                      </TooltipContent>
                    </Tooltip>
                  )}

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`${alum.doNotContact ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:text-uvu-green'}`}
                        onClick={() => !alum.doNotContact && handleCopy(alum.email, "Email")}
                        disabled={alum.doNotContact}
                      >
                        {copiedValues[alum.email] ? <CheckCircle size={16} /> : <Mail size={16} />}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{alum.doNotContact ? 'Copying restricted' : 'Copy Email'}</p>
                    </TooltipContent>
                  </Tooltip>

                  {alum.linkedIn && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className={`${alum.doNotContact ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:text-uvu-green'}`}
                          onClick={() => !alum.doNotContact && handleOpenLinkedIn(alum.linkedIn || "")}
                          disabled={alum.doNotContact}
                        >
                          <Linkedin size={16} />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{alum.doNotContact ? 'Link restricted' : 'Open LinkedIn Profile'}</p>
                      </TooltipContent>
                    </Tooltip>
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
          onCopy={handleCopy}
          onOpenLinkedIn={handleOpenLinkedIn}
          copiedValues={copiedValues}
        />
      ))}
    </div>
  );

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

interface AlumniCardProps {
  alumni: Alumni;
  onClick: () => void;
  onCopy: (text: string, label: string) => void;
  onOpenLinkedIn: (url: string) => void;
  copiedValues: Record<string, boolean>;
}

const AlumniCard = ({ 
  alumni, 
  onClick, 
  onCopy,
  onOpenLinkedIn,
  copiedValues
}: AlumniCardProps) => {
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
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-bold">
                  {alumni.firstName} {alumni.lastName}
                </h3>
                {alumni.doNotContact && (
                  <Badge variant="destructive" className="flex items-center gap-1">
                    <UserX className="h-3 w-3" />
                    Do Not Contact
                  </Badge>
                )}
              </div>
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
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className={`h-8 w-8 ${alum.doNotContact ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={() => !alum.doNotContact && onCopy(alumni.phone || "", "Phone number")}
                    disabled={alum.doNotContact}
                  >
                    {copiedValues[alum.phone || ""] ? <CheckCircle size={14} /> : <Phone size={14} />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{alum.doNotContact ? 'Copying restricted' : 'Copy Phone Number'}</p>
                </TooltipContent>
              </Tooltip>
            )}
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className={`h-8 w-8 ${alum.doNotContact ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={() => !alum.doNotContact && onCopy(alum.email, "Email")}
                  disabled={alum.doNotContact}
                >
                  {copiedValues[alum.email] ? <CheckCircle size={14} /> : <Mail size={14} />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{alum.doNotContact ? 'Copying restricted' : 'Copy Email'}</p>
              </TooltipContent>
            </Tooltip>
            
            {alumni.linkedIn && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className={`h-8 w-8 ${alum.doNotContact ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={() => !alum.doNotContact && onOpenLinkedIn(alum.linkedIn || "")}
                    disabled={alum.doNotContact}
                  >
                    <Linkedin size={14} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{alum.doNotContact ? 'Link restricted' : 'Open LinkedIn Profile'}</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AlumniPage;
