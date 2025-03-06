import { supabase } from "@/integrations/supabase/client";
import { Alumni, JobHistory, Organization } from "@/types/models";

// Convert database column names to camelCase for frontend
const toCamelCase = (obj: any): any => {
  if (obj === null || obj === undefined || typeof obj !== 'object') {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(v => toCamelCase(v));
  }

  const camelCaseObj: Record<string, any> = {};
  Object.keys(obj).forEach(key => {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    camelCaseObj[camelKey] = toCamelCase(obj[key]);
  });
  
  return camelCaseObj;
};

// Convert camelCase to snake_case for database
const toSnakeCase = (obj: any): any => {
  if (obj === null || obj === undefined || typeof obj !== 'object') {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(v => toSnakeCase(v));
  }

  const snakeCaseObj: Record<string, any> = {};
  Object.keys(obj).forEach(key => {
    // Special case for linkedIn -> linked_in
    if (key === 'linkedIn') {
      console.log("Converting 'linkedIn' to 'linked_in'");
    }
    
    const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    snakeCaseObj[snakeKey] = toSnakeCase(obj[key]);
  });
  
  console.log("Converted to snake case:", snakeCaseObj);
  return snakeCaseObj;
};

// Alumni API functions
export const fetchAlumni = async (): Promise<Alumni[]> => {
  const { data, error } = await supabase
    .from('alumni')
    .select('*')
    .order('last_name', { ascending: true });
  
  if (error) {
    console.error('Error fetching alumni:', error);
    throw error;
  }
  
  return toCamelCase(data) as Alumni[];
};

export const fetchAlumniById = async (id: string): Promise<Alumni> => {
  const { data, error } = await supabase
    .from('alumni')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error(`Error fetching alumni with id ${id}:`, error);
    throw error;
  }
  
  return toCamelCase(data) as Alumni;
};

export const updateAlumni = async (alumni: Partial<Alumni> & { id: string }): Promise<Alumni> => {
  const { id, ...updateData } = alumni;
  const { data, error } = await supabase
    .from('alumni')
    .update(toSnakeCase(updateData))
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error(`Error updating alumni with id ${id}:`, error);
    throw error;
  }
  
  return toCamelCase(data) as Alumni;
};

// Job History API functions
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

// Organizations API functions
export const fetchOrganizations = async (): Promise<Organization[]> => {
  const { data, error } = await supabase
    .from('organizations')
    .select('*')
    .order('name', { ascending: true });
  
  if (error) {
    console.error('Error fetching organizations:', error);
    throw error;
  }
  
  return toCamelCase(data) as Organization[];
};

export const fetchOrganizationById = async (id: string): Promise<Organization> => {
  const { data, error } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error(`Error fetching organization with id ${id}:`, error);
    throw error;
  }
  
  return toCamelCase(data) as Organization;
};

export const updateOrganization = async (organization: Partial<Organization> & { id: string }): Promise<Organization> => {
  const { id, ...updateData } = organization;
  const { data, error } = await supabase
    .from('organizations')
    .update(toSnakeCase(updateData))
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error(`Error updating organization with id ${id}:`, error);
    throw error;
  }
  
  return toCamelCase(data) as Organization;
};

export const createOrganization = async (organization: Omit<Organization, 'id' | 'createdAt' | 'updatedAt'>): Promise<Organization> => {
  const { data, error } = await supabase
    .from('organizations')
    .insert(toSnakeCase(organization))
    .select()
    .single();
  
  if (error) {
    console.error('Error creating organization:', error);
    throw error;
  }
  
  return toCamelCase(data) as Organization;
};

export const fetchAlumniByOrganizationId = async (organizationId: string, isCurrent: boolean = true): Promise<Alumni[]> => {
  // First get the job history entries for this organization
  const { data: jobData, error: jobError } = await supabase
    .from('job_history')
    .select('alumni_id')
    .eq('organization_id', organizationId)
    .eq('is_current', isCurrent);
  
  if (jobError) {
    console.error(`Error fetching job history for organization ${organizationId}:`, jobError);
    throw jobError;
  }
  
  // No alumni found for this organization
  if (!jobData || jobData.length === 0) {
    return [];
  }
  
  // Extract the alumni IDs
  const alumniIds = jobData.map(job => job.alumni_id);
  
  // Fetch the alumni details
  const { data: alumniData, error: alumniError } = await supabase
    .from('alumni')
    .select('*')
    .in('id', alumniIds)
    .order('last_name', { ascending: true });
  
  if (alumniError) {
    console.error(`Error fetching alumni for organization ${organizationId}:`, alumniError);
    throw alumniError;
  }
  
  return toCamelCase(alumniData) as Alumni[];
};
