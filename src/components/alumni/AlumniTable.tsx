
import { Alumni } from "@/types/models";
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

interface AlumniTableProps {
  alumni: Alumni[];
  copiedValues: Record<string, boolean>;
  onAlumniClick: (id: string) => void;
  onCopy: (text: string, label: string) => void;
  onOpenLinkedIn: (url: string) => void;
}

const AlumniTable = ({
  alumni,
  copiedValues,
  onAlumniClick,
  onCopy,
  onOpenLinkedIn,
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
            <TableHead className="text-right">Contact</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {alumni.map((alum) => (
            <TableRow 
              key={alum.id} 
              className="hover:bg-gray-50 cursor-pointer"
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
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default AlumniTable;
