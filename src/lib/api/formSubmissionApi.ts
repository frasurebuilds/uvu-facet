import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";
import { fetchFormById } from "./formApi";

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
  try {
    const form = await fetchFormById(submission.formId);
    
    // Create a map of field IDs to alumni profile fields
    if (form && form.fields) {
      mappedFields = form.fields.reduce((map, field) => {
        if (field.mappedField && submission.content[field.id]) {
          map[field.mappedField] = submission.content[field.id];
        }
        return map;
      }, {} as Record<string, any>);
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
  } else {
    // Legacy submission with name and email
    submissionData.submitted_by_name = submission.submittedByName || 'Unknown User';
    submissionData.submitted_by_email = submission.submittedByEmail || 'unknown@example.com';
    if (submission.submittedByAlumniId) {
      submissionData.submitted_by_alumni_id = submission.submittedByAlumniId;
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
