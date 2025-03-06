
import { supabase } from "@/integrations/supabase/client";
import { JobHistory } from "@/types/models";
import { toCamelCase, toSnakeCase } from "./apiUtils";

export const fetchJobHistoryByAlumniId = async (alumniId: string): Promise<JobHistory[]> => {
  const { data, error } = await supabase
    .from('job_history')
    .select(`
      *,
      organizations (id, name)
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
      organizationName: organizations ? organizations.name : undefined
    };
  });
  
  return toCamelCase(jobHistory) as JobHistory[];
};

export const createJobHistory = async (jobHistory: Omit<JobHistory, 'id' | 'createdAt' | 'updatedAt'>): Promise<JobHistory> => {
  // Remove organizationName property before sending to Supabase
  const { organizationName, ...jobData } = jobHistory as any;
  
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
  const { id, organizationName, ...updateData } = jobHistory as any;
  
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
