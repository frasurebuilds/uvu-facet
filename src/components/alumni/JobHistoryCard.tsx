
import React from "react";
import { JobHistory } from "@/types/models";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
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
import { Briefcase, Plus, Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";
import OrganizationLogo from "@/components/organizations/OrganizationLogo";

interface JobHistoryCardProps {
  jobHistory: JobHistory[];
  onAddJob: () => void;
  onEditJob: (job: JobHistory) => void;
  onDeleteJob: (jobId: string) => void;
}

const JobHistoryCard: React.FC<JobHistoryCardProps> = ({
  jobHistory,
  onAddJob,
  onEditJob,
  onDeleteJob
}) => {
  // Format date to show only month and year
  const formatMonthYear = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMMM yyyy");
    } catch (error) {
      return "Invalid date";
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-uvu-green" />
            Employment History
          </CardTitle>
          <CardDescription>
            Current and previous positions
          </CardDescription>
        </div>
        <Button 
          className="bg-uvu-green hover:bg-uvu-green-medium"
          onClick={onAddJob}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Position
        </Button>
      </CardHeader>
      <CardContent>
        {jobHistory.length > 0 ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Position</TableHead>
                  <TableHead>Organization</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobHistory.map((job) => (
                  <TableRow key={job.id}>
                    <TableCell className="font-medium">{job.jobTitle}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <OrganizationLogo 
                          name={job.organizationName || 'Unknown'} 
                          website={job.website || null}
                          size="sm"
                        />
                        <span>{job.organizationName || 'N/A'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {formatMonthYear(job.startDate)}
                      {job.isCurrent 
                        ? ' - Present' 
                        : job.endDate 
                          ? ` - ${formatMonthYear(job.endDate)}` 
                          : ''}
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        job.isCurrent ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {job.isCurrent ? 'Current' : 'Previous'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-gray-500 hover:text-uvu-green"
                          onClick={() => onEditJob(job)}
                        >
                          <Edit size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-gray-500 hover:text-red-500"
                          onClick={() => onDeleteJob(job.id)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-500">No employment history found for this alumni.</p>
            <Button 
              className="mt-4 bg-uvu-green hover:bg-uvu-green-medium"
              onClick={onAddJob}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add First Position
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default JobHistoryCard;
