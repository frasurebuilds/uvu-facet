import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import PageLayout from "@/components/layout/PageLayout";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  CardFooter 
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alumni, JobHistory, Organization } from "@/types/models";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  Save, 
  Phone, 
  Mail, 
  Linkedin, 
  Calendar, 
  Briefcase, 
  Building, 
  Trash2, 
  Plus,
  Edit,
  X,
  GraduationCap
} from "lucide-react";
import { 
  fetchAlumniById, 
  updateAlumni, 
  fetchJobHistoryByAlumniId,
  createJobHistory,
  updateJobHistory,
  deleteJobHistory,
  fetchOrganizations
} from "@/lib/api";
import { format, parseISO } from "date-fns";

const AlumniDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [alumni, setAlumni] = useState<Alumni | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [jobHistory, setJobHistory] = useState<JobHistory[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [jobDialogOpen, setJobDialogOpen] = useState(false);
  const [currentJob, setCurrentJob] = useState<Partial<JobHistory> | null>(null);

  const [formData, setFormData] = useState<Partial<Alumni>>({});

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const alumniData = await fetchAlumniById(id);
        setAlumni(alumniData);
        setFormData(alumniData);
        
        const jobHistoryData = await fetchJobHistoryByAlumniId(id);
        setJobHistory(jobHistoryData);
        
        const organizationsData = await fetchOrganizations();
        setOrganizations(organizationsData);
      } catch (error) {
        console.error("Failed to load data:", error);
        toast({
          title: "Error",
          description: "Failed to load alumni data.",
          variant: "destructive",
        });
        navigate("/alumni");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, navigate, toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSave = async () => {
    if (!alumni || !formData) return;
    
    try {
      setSaving(true);
      const updatedAlumni = await updateAlumni({
        id: alumni.id,
        ...formData,
      });
      
      setAlumni(updatedAlumni);
      setEditMode(false);
      
      toast({
        title: "Success",
        description: "Alumni information updated successfully.",
      });
    } catch (error) {
      console.error("Failed to update alumni:", error);
      toast({
        title: "Error",
        description: "Failed to update alumni information.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleJobFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentJob || !alumni) return;
    
    try {
      const jobData = {
        ...currentJob,
        alumniId: alumni.id,
      };
      
      if (jobData.isCurrent) {
        jobData.endDate = undefined;
      }
      
      if (!jobData.isCurrent && !jobData.endDate) {
        toast({
          title: "Error",
          description: "End date is required for previous positions.",
          variant: "destructive",
        });
        return;
      }
      
      if (currentJob.id) {
        await updateJobHistory(jobData as JobHistory);
        toast({
          title: "Success",
          description: "Job history updated successfully.",
        });
      } else {
        await createJobHistory(jobData as Omit<JobHistory, 'id' | 'createdAt' | 'updatedAt'>);
        toast({
          title: "Success",
          description: "Job history added successfully.",
        });
      }
      
      const updatedJobHistory = await fetchJobHistoryByAlumniId(alumni.id);
      setJobHistory(updatedJobHistory);
      
      setJobDialogOpen(false);
      setCurrentJob(null);
    } catch (error) {
      console.error("Failed to save job history:", error);
      toast({
        title: "Error",
        description: "Failed to save job history.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm("Are you sure you want to delete this job history entry?")) {
      return;
    }
    
    try {
      await deleteJobHistory(jobId);
      
      setJobHistory(jobHistory.filter(job => job.id !== jobId));
      
      toast({
        title: "Success",
        description: "Job history deleted successfully.",
      });
    } catch (error) {
      console.error("Failed to delete job history:", error);
      toast({
        title: "Error",
        description: "Failed to delete job history.",
        variant: "destructive",
      });
    }
  };

  const openNewJobDialog = () => {
    setCurrentJob({
      isCurrent: false,
      startDate: new Date().toISOString().split('T')[0],
    });
    setJobDialogOpen(true);
  };

  const openEditJobDialog = (job: JobHistory) => {
    setCurrentJob({...job});
    setJobDialogOpen(true);
  };

  if (loading) {
    return (
      <PageLayout title="Loading Alumni Details">
        <div className="text-center py-10">
          <p className="text-gray-500">Loading alumni data...</p>
        </div>
      </PageLayout>
    );
  }

  if (!alumni) {
    return (
      <PageLayout title="Alumni Not Found">
        <div className="text-center py-10">
          <p className="text-gray-500">The requested alumni could not be found.</p>
          <Button 
            className="mt-4 bg-uvu-green hover:bg-uvu-green-medium"
            onClick={() => navigate("/alumni")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Alumni List
          </Button>
        </div>
      </PageLayout>
    );
  }

  const actionButton = editMode ? (
    <div className="flex gap-2">
      <Button 
        variant="outline" 
        onClick={() => {
          setFormData(alumni);
          setEditMode(false);
        }}
      >
        <X className="mr-2 h-4 w-4" />
        Cancel
      </Button>
      <Button 
        className="bg-uvu-green hover:bg-uvu-green-medium"
        onClick={handleSave}
        disabled={saving}
      >
        <Save className="mr-2 h-4 w-4" />
        Save Changes
      </Button>
    </div>
  ) : (
    <Button 
      className="bg-uvu-green hover:bg-uvu-green-medium"
      onClick={() => setEditMode(true)}
    >
      <Edit className="mr-2 h-4 w-4" />
      Edit Alumni
    </Button>
  );

  return (
    <PageLayout
      title={`${alumni.firstName} ${alumni.lastName}`}
      subtitle="Alumni Details"
      actionButton={actionButton}
    >
      <div className="flex flex-col gap-6">
        <Button 
          variant="ghost" 
          className="w-fit" 
          onClick={() => navigate("/alumni")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Alumni List
        </Button>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-uvu-green" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">First Name</label>
                    {editMode ? (
                      <Input 
                        name="firstName"
                        value={formData.firstName || ''}
                        onChange={handleInputChange}
                        className="mt-1"
                      />
                    ) : (
                      <p>{alumni.firstName}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Last Name</label>
                    {editMode ? (
                      <Input 
                        name="lastName"
                        value={formData.lastName || ''}
                        onChange={handleInputChange}
                        className="mt-1"
                      />
                    ) : (
                      <p>{alumni.lastName}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Email</label>
                    {editMode ? (
                      <Input 
                        name="email"
                        type="email"
                        value={formData.email || ''}
                        onChange={handleInputChange}
                        className="mt-1"
                      />
                    ) : (
                      <p>{alumni.email}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Phone</label>
                    {editMode ? (
                      <Input 
                        name="phone"
                        value={formData.phone || ''}
                        onChange={handleInputChange}
                        className="mt-1"
                      />
                    ) : (
                      <p>{alumni.phone || 'No phone number'}</p>
                    )}
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Graduation Year</label>
                    {editMode ? (
                      <Input 
                        name="graduationYear"
                        type="number"
                        value={formData.graduationYear || ''}
                        onChange={handleInputChange}
                        className="mt-1"
                      />
                    ) : (
                      <p>{alumni.graduationYear}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Degree</label>
                    {editMode ? (
                      <Input 
                        name="degree"
                        value={formData.degree || ''}
                        onChange={handleInputChange}
                        className="mt-1"
                      />
                    ) : (
                      <p>{alumni.degree}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Major</label>
                    {editMode ? (
                      <Input 
                        name="major"
                        value={formData.major || ''}
                        onChange={handleInputChange}
                        className="mt-1"
                      />
                    ) : (
                      <p>{alumni.major}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">LinkedIn</label>
                    {editMode ? (
                      <Input 
                        name="linkedIn"
                        value={formData.linkedIn || ''}
                        onChange={handleInputChange}
                        className="mt-1"
                      />
                    ) : (
                      <p>{alumni.linkedIn || 'No LinkedIn profile'}</p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="mt-4">
                <label className="text-sm font-medium text-gray-500">Notes</label>
                {editMode ? (
                  <Textarea 
                    name="notes"
                    value={formData.notes || ''}
                    onChange={handleInputChange}
                    className="mt-1"
                    rows={4}
                  />
                ) : (
                  <p className="whitespace-pre-line">{alumni.notes || 'No notes'}</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-uvu-green" />
                Contact
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <a href={`mailto:${alumni.email}`} className="text-uvu-green hover:text-uvu-green-medium">
                    {alumni.email}
                  </a>
                </div>
                
                {alumni.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-gray-400" />
                    <a href={`tel:${alumni.phone}`} className="text-uvu-green hover:text-uvu-green-medium">
                      {alumni.phone}
                    </a>
                  </div>
                )}
                
                {alumni.linkedIn && (
                  <div className="flex items-center gap-3">
                    <Linkedin className="h-5 w-5 text-gray-400" />
                    <a 
                      href={alumni.linkedIn.startsWith('http') ? alumni.linkedIn : `https://${alumni.linkedIn}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-uvu-green hover:text-uvu-green-medium"
                    >
                      LinkedIn Profile
                    </a>
                  </div>
                )}
              </div>
              
              <div className="mt-6 pt-6 border-t">
                <h4 className="font-medium">Education</h4>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <span>{alumni.graduationYear}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <GraduationCap className="h-5 w-5 text-gray-400" />
                    <span>{alumni.degree} in {alumni.major}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

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
              onClick={openNewJobDialog}
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
                        <TableCell>{job.organizationName || 'N/A'}</TableCell>
                        <TableCell>
                          {new Date(job.startDate).toLocaleDateString()} - 
                          {job.endDate ? new Date(job.endDate).toLocaleDateString() : 'Present'}
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
                              onClick={() => openEditJobDialog(job)}
                            >
                              <Edit size={16} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-gray-500 hover:text-red-500"
                              onClick={() => handleDeleteJob(job.id)}
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
                  onClick={openNewJobDialog}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add First Position
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={jobDialogOpen} onOpenChange={setJobDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {currentJob?.id ? 'Edit Position' : 'Add New Position'}
            </DialogTitle>
            <DialogDescription>
              Enter the details of the position. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleJobFormSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="jobTitle" className="text-right text-sm font-medium">
                  Title
                </label>
                <Input
                  id="jobTitle"
                  className="col-span-3"
                  value={currentJob?.jobTitle || ''}
                  onChange={(e) => setCurrentJob({...currentJob, jobTitle: e.target.value})}
                  required
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="organization" className="text-right text-sm font-medium">
                  Organization
                </label>
                <div className="col-span-3">
                  <Select
                    value={currentJob?.organizationId || ''}
                    onValueChange={(value) => setCurrentJob({...currentJob, organizationId: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select an organization" />
                    </SelectTrigger>
                    <SelectContent>
                      {organizations.map((org) => (
                        <SelectItem key={org.id} value={org.id}>
                          {org.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                  value={currentJob?.startDate ? new Date(currentJob.startDate).toISOString().split('T')[0] : ''}
                  onChange={(e) => setCurrentJob({...currentJob, startDate: e.target.value})}
                  required
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="isCurrent" className="text-right text-sm font-medium">
                  Current Position
                </label>
                <div className="col-span-3">
                  <Select
                    value={currentJob?.isCurrent ? 'true' : 'false'}
                    onValueChange={(value) => {
                      const isCurrent = value === 'true';
                      setCurrentJob({
                        ...currentJob, 
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
              
              {!currentJob?.isCurrent && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="endDate" className="text-right text-sm font-medium">
                    End Date
                  </label>
                  <Input
                    id="endDate"
                    className="col-span-3"
                    type="date"
                    value={currentJob?.endDate ? new Date(currentJob.endDate).toISOString().split('T')[0] : ''}
                    onChange={(e) => setCurrentJob({...currentJob, endDate: e.target.value})}
                    required={!currentJob?.isCurrent}
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
                  value={currentJob?.description || ''}
                  onChange={(e) => setCurrentJob({...currentJob, description: e.target.value})}
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
    </PageLayout>
  );
};

export default AlumniDetailPage;
