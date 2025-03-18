
import React, { useState, useCallback } from "react";
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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { SearchSelect, SearchSelectOption } from "@/components/ui/search-select";
import { createOrganization } from "@/lib/api/organizationApi";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

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
  const { toast } = useToast();
  const [creatingOrganization, setCreatingOrganization] = useState(false);
  
  const organizationOptions: SearchSelectOption[] = organizations.map((org) => ({
    value: org.id,
    label: org.name
  }));

  const handleCreateOrganization = useCallback(async (name: string) => {
    try {
      setCreatingOrganization(true);
      const newOrganization = await createOrganization({
        name,
        industry: "Unknown", // Required field
      });
      
      setCurrentJob(prev => ({
        ...prev,
        organizationId: newOrganization.id
      }));
      
      toast({
        title: "Organization Created",
        description: `Created organization "${name}" successfully`,
      });
    } catch (error) {
      console.error("Failed to create organization:", error);
      toast({
        title: "Error",
        description: "Failed to create organization. Please try again.",
        variant: "destructive",
      });
    } finally {
      setCreatingOrganization(false);
    }
  }, [setCurrentJob, toast]);

  const formatMonthYear = (dateString?: string) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return format(date, "MMMM yyyy");
    } catch (error) {
      return "";
    }
  };

  const setDateValue = (field: 'startDate' | 'endDate', date: Date | undefined) => {
    if (!date) return;
    
    // Standardize to the first day of the month
    const standardizedDate = new Date(date.getFullYear(), date.getMonth(), 1);
    setCurrentJob({
      ...job,
      [field]: standardizedDate.toISOString()
    });
  };

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
                  emptyMessage="No organizations found."
                  allowCreate={true}
                  onCreateOption={handleCreateOrganization}
                  createOptionLabel="Create organization"
                  disabled={creatingOrganization}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="startDate" className="text-right text-sm font-medium">
                Start Date
              </label>
              <div className="col-span-3">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="startDate"
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !job?.startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {job?.startDate ? formatMonthYear(job.startDate) : "Select month and year"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 z-[9999]" align="start">
                    <Calendar
                      mode="single"
                      selected={job?.startDate ? new Date(job.startDate) : undefined}
                      onSelect={(date) => setDateValue('startDate', date)}
                      initialFocus
                      defaultMonth={job?.startDate ? new Date(job.startDate) : new Date()}
                      showMonthYearPicker
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
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
                <div className="col-span-3">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="endDate"
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !job?.endDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {job?.endDate ? formatMonthYear(job.endDate) : "Select month and year"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 z-[9999]" align="start">
                      <Calendar
                        mode="single"
                        selected={job?.endDate ? new Date(job.endDate) : undefined}
                        onSelect={(date) => setDateValue('endDate', date)}
                        initialFocus
                        defaultMonth={job?.endDate ? new Date(job.endDate) : new Date()}
                        showMonthYearPicker
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
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
