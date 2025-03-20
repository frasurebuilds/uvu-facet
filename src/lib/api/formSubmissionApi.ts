import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";
import { EmploymentFields } from "@/types/models";
import { fetchFormById } from "./formApi";
import { fetchAlumniByEmail } from "./alumniApi";

interface FormSubmissionRequest {
  formId: string;
  content: Record<string, any>;
  // For standard forms
  submittedByUvid?: string;
  // For anonymous forms
  isAnonymous?: boolean;
  // Backwards compatibility for existing code
  submittedByName?: string;
  submittedByEmail?: string;
  submittedByAlumniId?: string;
}

export const submitFormResponse = async (submission: FormSubmissionRequest) => {
  // First get the form to check for field mappings
  let mappedFields = {};
  let employmentFields: EmploymentFields = {};
  
  try {
    const form = await fetchFormById(submission.formId);
    
    // Create a map of field IDs to alumni profile and employment fields
    if (form && form.fields) {
      form.fields.forEach(field => {
        if (field.mappedField && submission.content[field.id]) {
          // Check if this is an employment history field
          if (field.mappedField.startsWith('employment.')) {
            const employmentField = field.mappedField.replace('employment.', '');
            employmentFields[employmentField] = submission.content[field.id];
          } else {
            // Regular alumni profile field
            mappedFields[field.mappedField] = submission.content[field.id];
          }
        }
      });
    }
  } catch (error) {
    console.warn("Could not fetch form details for mapping fields:", error);
    // Continue with submission even if mapping fails
  }

  // Base submission data
  const submissionData: any = {
    type: 'form_response',
    content: submission.content as unknown as Json,
    form_id: submission.formId,
    mapped_fields: mappedFields as unknown as Json
  };

  // Handle different submission types
  if (submission.isAnonymous) {
    // Anonymous submission - set placeholder values for required fields
    submissionData.is_anonymous = true;
    submissionData.submitted_by_name = 'Anonymous User';
    submissionData.submitted_by_email = 'anonymous@example.com';
  } else if (submission.submittedByUvid) {
    // Standard submission with UVID
    submissionData.submitted_by_uvid = submission.submittedByUvid;
    submissionData.submitted_by_name = `UVID: ${submission.submittedByUvid}`;
    submissionData.submitted_by_email = `${submission.submittedByUvid}@uvu.edu`;
    
    // Check if an alumni profile already exists with this UVID email
    try {
      const alumniEmail = `${submission.submittedByUvid}@uvu.edu`;
      const existingAlumni = await fetchAlumniByEmail(alumniEmail);
      
      if (existingAlumni) {
        console.log(`Found existing alumni profile for UVID ${submission.submittedByUvid}`);
        submissionData.submitted_by_alumni_id = existingAlumni.id;
        
        // Update alumni profile with mapped fields if there are any
        if (Object.keys(mappedFields).length > 0) {
          await updateAlumniProfile(existingAlumni.id, mappedFields);
        }
        
        // Create employment history entry if we have sufficient data
        if (Object.keys(employmentFields).length > 0 && 
            employmentFields.jobTitle && 
            (employmentFields.organizationName || employmentFields.startDate)) {
          await createEmploymentHistoryEntry(existingAlumni.id, employmentFields);
        }
      } else {
        console.log(`No alumni profile found for UVID ${submission.submittedByUvid}, creating new profile`);
        // Create a new alumni profile with minimal information
        // Default values to use if mapped fields don't provide them
        const defaultValues = {
          first_name: 'Unknown',
          last_name: 'Unknown',
          graduation_year: new Date().getFullYear(),
          degree: 'Unknown',
          major: 'Unknown'
        };
        
        // Extract values from mapped fields or use defaults
        const mappedFieldsObj = mappedFields as Record<string, any>;
        const alumniData = {
          email: alumniEmail,
          first_name: mappedFieldsObj.firstName || defaultValues.first_name,
          last_name: mappedFieldsObj.lastName || defaultValues.last_name,
          graduation_year: mappedFieldsObj.graduationYear || defaultValues.graduation_year,
          degree: mappedFieldsObj.degree || defaultValues.degree,
          major: mappedFieldsObj.major || defaultValues.major
        };
        
        const { data: newAlumni, error: createError } = await supabase
          .from('alumni')
          .insert(alumniData)
          .select()
          .single();
          
        if (createError) {
          console.error('Error creating alumni profile:', createError);
        } else if (newAlumni) {
          console.log('Created new alumni profile:', newAlumni);
          submissionData.submitted_by_alumni_id = newAlumni.id;
          
          // Create employment history entry if we have sufficient data
          if (Object.keys(employmentFields).length > 0 && 
              employmentFields.jobTitle && 
              (employmentFields.organizationName || employmentFields.startDate)) {
            await createEmploymentHistoryEntry(newAlumni.id, employmentFields);
          }
        }
      }
    } catch (error) {
      console.warn("Error checking for existing alumni or creating new profile:", error);
      // Continue with submission even if alumni profile handling fails
    }
  } else {
    // Legacy submission with name and email
    submissionData.submitted_by_name = submission.submittedByName || 'Unknown User';
    submissionData.submitted_by_email = submission.submittedByEmail || 'unknown@example.com';
    if (submission.submittedByAlumniId) {
      submissionData.submitted_by_alumni_id = submission.submittedByAlumniId;
      
      // Create employment history entry if we have an alumni ID and sufficient data
      if (Object.keys(employmentFields).length > 0 && 
          employmentFields.jobTitle && 
          (employmentFields.organizationName || employmentFields.startDate)) {
        await createEmploymentHistoryEntry(submission.submittedByAlumniId, employmentFields);
      }
    }
  }

  console.log('Submitting form response with data:', submissionData);

  try {
    const { data, error } = await supabase
      .from('form_submissions')
      .insert(submissionData);

    if (error) {
      console.error('Error submitting form response:', error);
      throw error;
    }
    
    console.log('Form submission successful:', data);
    return data;
  } catch (error) {
    console.error('Exception during form submission:', error);
    throw error;
  }
};

// Helper function to update an alumni profile with mapped fields
const updateAlumniProfile = async (alumniId: string, mappedFields: Record<string, any>) => {
  if (!alumniId || Object.keys(mappedFields).length === 0) return;
  
  // Convert camelCase field names to snake_case for the database
  const updateData = Object.entries(mappedFields).reduce((data, [key, value]) => {
    const snakeCaseKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
    data[snakeCaseKey] = value;
    return data;
  }, {} as Record<string, any>);
  
  try {
    const { error } = await supabase
      .from('alumni')
      .update(updateData)
      .eq('id', alumniId);
      
    if (error) {
      console.error('Error updating alumni profile with mapped fields:', error);
    } else {
      console.log('Updated alumni profile with mapped fields:', updateData);
    }
  } catch (error) {
    console.error('Exception during alumni profile update:', error);
  }
};

// Helper function to create a job history entry
const createEmploymentHistoryEntry = async (alumniId: string, employmentData: EmploymentFields) => {
  if (!alumniId || !employmentData.jobTitle) {
    console.log('Insufficient data to create employment history entry');
    return;
  }
  
  try {
    // Prepare the job history data
    const jobData: any = {
      alumni_id: alumniId,
      job_title: employmentData.jobTitle,
      organization_name: employmentData.organizationName || 'Unknown Organization',
      description: employmentData.description || '',
      is_current: employmentData.isCurrent === 'true' || employmentData.isCurrent === true || false
    };
    
    // Handle start date
    if (employmentData.startDate) {
      // If it's a month-year format (YYYY-MM), append day to make it a valid date
      if (/^\d{4}-\d{2}$/.test(employmentData.startDate)) {
        jobData.start_date = `${employmentData.startDate}-01`;
      } else {
        jobData.start_date = employmentData.startDate;
      }
    } else {
      // Default to today if no start date provided
      jobData.start_date = new Date().toISOString().split('T')[0];
    }
    
    // Handle end date
    if (employmentData.endDate) {
      // If it's a month-year format (YYYY-MM), append day to make it a valid date
      if (/^\d{4}-\d{2}$/.test(employmentData.endDate)) {
        jobData.end_date = `${employmentData.endDate}-01`;
      } else {
        jobData.end_date = employmentData.endDate;
      }
    } else if (!jobData.is_current) {
      // If not current job and no end date, default to same as start date
      jobData.end_date = jobData.start_date;
    }
    
    console.log('Creating employment history entry:', jobData);
    
    const { data, error } = await supabase
      .from('job_history')
      .insert(jobData)
      .select();
      
    if (error) {
      console.error('Error creating employment history entry:', error);
    } else {
      console.log('Created employment history entry:', data);
    }
  } catch (error) {
    console.error('Exception during employment history creation:', error);
  }
};

export const fetchFormSubmissions = async () => {
  const { data, error } = await supabase
    .from('form_submissions')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching form submissions:', error);
    throw error;
  }
  
  return data.map(submission => ({
    id: submission.id,
    type: submission.type,
    content: submission.content,
    submittedByName: submission.submitted_by_name,
    submittedByEmail: submission.submitted_by_email,
    submittedByUvid: submission.submitted_by_uvid,
    submittedByAlumniId: submission.submitted_by_alumni_id,
    isAnonymous: submission.is_anonymous,
    createdAt: submission.created_at,
    status: submission.status,
    notes: submission.notes,
    mappedFields: submission.mapped_fields
  }));
};

// Function to process a submission - would update alumni data based on mappedFields
export const processFormSubmission = async (submissionId: string) => {
  // First fetch the submission
  const { data: submission, error: fetchError } = await supabase
    .from('form_submissions')
    .select('*')
    .eq('id', submissionId)
    .single();
    
  if (fetchError) {
    console.error('Error fetching submission for processing:', fetchError);
    throw fetchError;
  }
  
  // If there's an alumni ID and mapped fields, update the alumni record
  if (submission.submitted_by_alumni_id && submission.mapped_fields) {
    // Convert the mapped fields to a format suitable for the alumni table
    const mappedFieldsObject = submission.mapped_fields as Record<string, any>;
    
    // Only proceed if we have valid mapped fields
    if (Object.keys(mappedFieldsObject).length > 0) {
      const { error: updateError } = await supabase
        .from('alumni')
        .update(mappedFieldsObject)
        .eq('id', submission.submitted_by_alumni_id);
        
      if (updateError) {
        console.error('Error updating alumni with mapped fields:', updateError);
        throw updateError;
      }
    }
  }
  
  // Update the submission status
  const { error: statusError } = await supabase
    .from('form_submissions')
    .update({ status: 'processed' })
    .eq('id', submissionId);
    
  if (statusError) {
    console.error('Error updating submission status:', statusError);
    throw statusError;
  }
  
  return true;
};

// Function to update a submission's status
export const updateSubmissionStatus = async (
  submissionId: string, 
  status: 'pending' | 'reviewed' | 'processed' | 'archived',
  notes?: string
) => {
  const updates: any = { status };
  if (notes !== undefined) {
    updates.notes = notes;
  }
  
  const { error } = await supabase
    .from('form_submissions')
    .update(updates)
    .eq('id', submissionId);
    
  if (error) {
    console.error('Error updating submission status:', error);
    throw error;
  }
  
  return true;
};

// Function to delete a form submission
export const deleteFormSubmission = async (submissionId: string) => {
  const { error } = await supabase
    .from('form_submissions')
    .delete()
    .eq('id', submissionId);
    
  if (error) {
    console.error('Error deleting form submission:', error);
    throw error;
  }
  
  return true;
};
