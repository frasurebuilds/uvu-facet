
import { Alumni, JobHistory } from "@/types/models";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Phone, Mail, Linkedin, CheckCircle, UserX } from "lucide-react";
import OrganizationLogo from "../organizations/OrganizationLogo";

interface AlumniTableProps {
  alumni: Alumni[];
  copiedValues: Record<string, boolean>;
  onAlumniClick: (id: string) => void;
  onCopy: (text: string, label: string) => void;
  onOpenLinkedIn: (url: string) => void;
  alumniJobs?: Record<string, JobHistory | null>;
}

const AlumniTable = ({
  alumni,
  copiedValues,
  onAlumniClick,
  onCopy,
  onOpenLinkedIn,
  alumniJobs = {},
}: AlumniTableProps) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Graduation</TableHead>
            <TableHead className="hidden md:table-cell">Major</TableHead>
            <TableHead className="hidden lg:table-cell">Current Position</TableHead>
            <TableHead className="hidden lg:table-cell">Organization</TableHead>
            <TableHead className="hidden md:table-cell text-center">Contact Status</TableHead>
            <TableHead className="text-right">Contact</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {alumni.map((alum) => {
            const currentJob = alumniJobs[alum.id] || null;
            
            return (
              <TableRow 
                key={alum.id} 
                className={`hover:bg-gray-50 cursor-pointer ${alum.doNotContact ? 'bg-gray-50' : ''}`}
                onClick={() => onAlumniClick(alum.id)}
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
                  {currentJob ? currentJob.jobTitle : "-"}
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  {currentJob?.organizationName ? (
                    <div className="flex items-center gap-2">
                      {currentJob.website && (
                        <OrganizationLogo
                          name={currentJob.organizationName}
                          website={currentJob.website}
                          size="sm"
                        />
                      )}
                      <span>{currentJob.organizationName}</span>
                    </div>
                  ) : (
                    "-"
                  )}
                </TableCell>
                <TableCell className="hidden md:table-cell text-center">
                  {alum.doNotContact ? (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      <UserX size={12} className="mr-1" />
                      Restricted
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Active
                    </span>
                  )}
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
                            onClick={() => !alum.doNotContact && onCopy(alum.phone || "", "Phone number")}
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
                          onClick={() => !alum.doNotContact && onCopy(alum.email, "Email")}
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
                            onClick={() => !alum.doNotContact && onOpenLinkedIn(alum.linkedIn || "")}
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
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default AlumniTable;
