
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
  const { data: jobData, error: jobError } = await supabase
    .from('job_history')
    .select('alumni_id')
    .eq('organization_id', organizationId)
    .eq('is_current', isCurrent);
  
  if (jobError) {
    console.error(`Error fetching job history for organization ${organizationId}:`, jobError);
    throw jobError;
  }
  
  if (!jobData || jobData.length === 0) {
    return [];
  }
  
  const alumniIds = jobData.map(job => job.alumni_id);
  
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

export const fetchAlumniByUvid = async (uvid: string): Promise<Alumni | null> => {
  const { data, error } = await supabase
    .from('alumni')
    .select('*')
    .eq('uvid', uvid)
    .maybeSingle();
  
  if (error) {
    console.error(`Error fetching alumni with UVID ${uvid}:`, error);
    throw error;
  }
  
  return data ? toCamelCase(data) as Alumni : null;
};

// Define primitive value types to avoid circular references
export type FormFieldValue = string | number | boolean | null;

// Define a simple interface for alumni form submission
export interface AlumniFormSubmission {
  mappedFields?: Record<string, FormFieldValue>;
  submittedByUvid?: string;
}

export const createAlumniFromFormSubmission = async (submission: AlumniFormSubmission): Promise<Alumni | null> => {
  if (!submission.mappedFields || Object.keys(submission.mappedFields).length === 0) {
    return null;
  }

  try {
    const alumniData = {
      ...submission.mappedFields,
      uvid: submission.submittedByUvid,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      doNotContact: false
    };

    console.log("Creating alumni with data:", alumniData);

    const { data, error } = await supabase
      .from('alumni')
      .insert(toSnakeCase(alumniData))
      .select()
      .single();
    
    if (error) {
      console.error('Error creating alumni from form submission:', error);
      return null;
    }
    
    return toCamelCase(data) as Alumni;
  } catch (error) {
    console.error('Error in createAlumniFromFormSubmission:', error);
    return null;
  }
};

export const updateAlumniFromFormSubmission = async (
  alumniId: string, 
  mappedFields: Record<string, FormFieldValue>
): Promise<Alumni | null> => {
  try {
    if (!mappedFields || Object.keys(mappedFields).length === 0) {
      return null;
    }

    const updateData = {
      ...mappedFields,
      updatedAt: new Date().toISOString()
    };

    console.log("Updating alumni with data:", updateData);

    const { data, error } = await supabase
      .from('alumni')
      .update(toSnakeCase(updateData))
      .eq('id', alumniId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating alumni from form submission:', error);
      return null;
    }
    
    return toCamelCase(data) as Alumni;
  } catch (error) {
    console.error('Error in updateAlumniFromFormSubmission:', error);
    return null;
  }
};
