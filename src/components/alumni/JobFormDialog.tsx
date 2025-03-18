
import React from "react";
import { JobHistory, Organization } from "@/types/models";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SearchSelect, SearchSelectOption } from "@/components/ui/search-select";

interface JobFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  job: Partial<JobHistory> | null;
  organizations: Organization[];
  onSubmit: (e: React.FormEvent) => void;
  setCurrentJob: React.Dispatch<React.SetStateAction<Partial<JobHistory> | null>>;
}

const JobFormDialog: React.FC<JobFormDialogProps> = ({
  open,
  onOpenChange,
  job,
  organizations,
  onSubmit,
  setCurrentJob
}) => {
  // Transform organizations array into SearchSelectOption format
  const organizationOptions: SearchSelectOption[] = organizations.map((org) => ({
    value: org.id,
    label: org.name
  }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {job?.id ? 'Edit Position' : 'Add New Position'}
          </DialogTitle>
          <DialogDescription>
            Enter the details of the position. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={onSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="jobTitle" className="text-right text-sm font-medium">
                Title
              </label>
              <Input
                id="jobTitle"
                className="col-span-3"
                value={job?.jobTitle || ''}
                onChange={(e) => setCurrentJob({...job, jobTitle: e.target.value})}
                required
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="organization" className="text-right text-sm font-medium">
                Organization
              </label>
              <div className="col-span-3">
                <SearchSelect
                  options={organizationOptions}
                  value={job?.organizationId || ''}
                  onValueChange={(value) => setCurrentJob({...job, organizationId: value})}
                  placeholder="Search for an organization"
                  emptyMessage="No organizations found"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="startDate" className="text-right text-sm font-medium">
                Start Date
              </label>
              <Input
                id="startDate"
                className="col-span-3"
                type="date"
                value={job?.startDate ? new Date(job.startDate).toISOString().split('T')[0] : ''}
                onChange={(e) => setCurrentJob({...job, startDate: e.target.value})}
                required
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="isCurrent" className="text-right text-sm font-medium">
                Current Position
              </label>
              <div className="col-span-3">
                <Select
                  value={job?.isCurrent ? 'true' : 'false'}
                  onValueChange={(value) => {
                    const isCurrent = value === 'true';
                    setCurrentJob({
                      ...job, 
                      isCurrent,
                      ...(isCurrent ? { endDate: undefined } : {})
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Is this their current position?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Yes</SelectItem>
                    <SelectItem value="false">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {!job?.isCurrent && (
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="endDate" className="text-right text-sm font-medium">
                  End Date
                </label>
                <Input
                  id="endDate"
                  className="col-span-3"
                  type="date"
                  value={job?.endDate ? new Date(job.endDate).toISOString().split('T')[0] : ''}
                  onChange={(e) => setCurrentJob({...job, endDate: e.target.value})}
                  required={!job?.isCurrent}
                />
              </div>
            )}
            
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="description" className="text-right text-sm font-medium">
                Description
              </label>
              <Textarea
                id="description"
                className="col-span-3"
                value={job?.description || ''}
                onChange={(e) => setCurrentJob({...job, description: e.target.value})}
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" type="button">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" className="bg-uvu-green hover:bg-uvu-green-medium">
              Save Position
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default JobFormDialog;
