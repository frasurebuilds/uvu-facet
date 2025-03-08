
import { supabase } from "@/integrations/supabase/client";
import { Alumni } from "@/types/models";
import { toCamelCase, toSnakeCase } from "./apiUtils";

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
