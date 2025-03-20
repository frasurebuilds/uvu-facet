
import { supabase } from "@/integrations/supabase/client";
import { JobHistory } from "@/types/models";
import { toCamelCase, toSnakeCase } from "./apiUtils";

export const fetchJobHistoryByAlumniId = async (alumniId: string): Promise<JobHistory[]> => {
  const { data, error } = await supabase
    .from('job_history')
    .select(`
      *,
      organizations (id, name, website)
    `)
    .eq('alumni_id', alumniId)
    .order('is_current', { ascending: false })
    .order('start_date', { ascending: false });
  
  if (error) {
    console.error(`Error fetching job history for alumni ${alumniId}:`, error);
    throw error;
  }
  
  // Transform the data to match our JobHistory interface
  const jobHistory = data.map(job => {
    const { organizations, ...jobData } = job;
    return {
      ...jobData,
      organizationName: organizations ? organizations.name : undefined,
      website: organizations ? organizations.website : undefined
    };
  });
  
  return toCamelCase(jobHistory) as JobHistory[];
};

export const fetchCurrentJobByAlumniId = async (alumniId: string): Promise<JobHistory | null> => {
  const { data, error } = await supabase
    .from('job_history')
    .select(`
      *,
      organizations (id, name, website)
    `)
    .eq('alumni_id', alumniId)
    .eq('is_current', true)
    .order('start_date', { ascending: false })
    .limit(1)
    .maybeSingle();
  
  if (error) {
    console.error(`Error fetching current job for alumni ${alumniId}:`, error);
    throw error;
  }
  
  if (!data) return null;
  
  // Transform the data to match our JobHistory interface
  const { organizations, ...jobData } = data;
  const job = {
    ...jobData,
    organizationName: organizations ? organizations.name : undefined,
    website: organizations ? organizations.website : undefined
  };
  
  return toCamelCase(job) as JobHistory;
};

export const createJobHistory = async (jobHistory: Omit<JobHistory, 'id' | 'createdAt' | 'updatedAt'>): Promise<JobHistory> => {
  // Remove organizationName and website properties before sending to Supabase
  const { organizationName, website, ...jobData } = jobHistory as any;
  
  const { data, error } = await supabase
    .from('job_history')
    .insert(toSnakeCase(jobData))
    .select()
    .single();
  
  if (error) {
    console.error('Error creating job history:', error);
    throw error;
  }
  
  return toCamelCase(data) as JobHistory;
};

export const updateJobHistory = async (jobHistory: Partial<JobHistory> & { id: string }): Promise<JobHistory> => {
  // Remove organizationName and website properties before sending to Supabase
  const { id, organizationName, website, ...updateData } = jobHistory as any;
  
  const { data, error } = await supabase
    .from('job_history')
    .update(toSnakeCase(updateData))
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error(`Error updating job history with id ${id}:`, error);
    throw error;
  }
  
  return toCamelCase(data) as JobHistory;
};

export const deleteJobHistory = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('job_history')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error(`Error deleting job history with id ${id}:`, error);
    throw error;
  }
};
