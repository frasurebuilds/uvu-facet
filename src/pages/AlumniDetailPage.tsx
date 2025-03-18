
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PageLayout from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { Alumni, JobHistory, Organization } from "@/types/models";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  Save, 
  Edit,
  X,
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

// Import our components
import PersonalInfoCard from "@/components/alumni/PersonalInfoCard";
import ContactCard from "@/components/alumni/ContactCard";
import JobHistoryCard from "@/components/alumni/JobHistoryCard";
import JobFormDialog from "@/components/alumni/JobFormDialog";
import FormSubmissionsCard from "@/components/alumni/FormSubmissionsCard";

const AlumniDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

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

  const handleCheckboxChange = (field: string, checked: boolean) => {
    setFormData({
      ...formData,
      [field]: checked,
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

  // Extract UVID from email if it's a UVU email
  const uvid = alumni.email.endsWith('@uvu.edu') 
    ? alumni.email.split('@')[0] 
    : undefined;

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
          <PersonalInfoCard 
            alumni={alumni}
            formData={formData}
            editMode={editMode}
            handleInputChange={handleInputChange}
            handleCheckboxChange={handleCheckboxChange}
          />

          <ContactCard alumni={alumni} />
        </div>

        <JobHistoryCard 
          jobHistory={jobHistory}
          onAddJob={openNewJobDialog}
          onEditJob={openEditJobDialog}
          onDeleteJob={handleDeleteJob}
        />
        
        <FormSubmissionsCard 
          alumniId={alumni.id}
          alumniEmail={alumni.email}
          uvid={uvid}
        />
      </div>

      <JobFormDialog 
        open={jobDialogOpen}
        onOpenChange={setJobDialogOpen}
        job={currentJob}
        organizations={organizations}
        onSubmit={handleJobFormSubmit}
        setCurrentJob={setCurrentJob}
      />
    </PageLayout>
  );
};

export default AlumniDetailPage;
