import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";
import { fetchFormById } from "./formApi";
import { FormSubmission } from "@/types/models";
import { fetchAlumniByUvid, FormFieldValue } from "./alumniApi";
import { toCamelCase } from "./apiUtils";

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
  try {
    // Base submission data
    const submissionData: any = {
      type: 'form_response',
      content: submission.content as unknown as Json,
      form_id: submission.formId,
    };

    // Handle different submission types
    if (submission.isAnonymous) {
      // Anonymous submission - don't add any personal info
      submissionData.is_anonymous = true;
      submissionData.submitted_by_name = 'Anonymous';
      submissionData.submitted_by_email = '';
    } else if (submission.submittedByUvid) {
      // Standard submission with UVID - look up or create alumni profile connection
      submissionData.submitted_by_uvid = submission.submittedByUvid;
      submissionData.submitted_by_name = submission.submittedByName || 'User';
      submissionData.submitted_by_email = submission.submittedByEmail || '';
      
      try {
        // Get the form to check for mapped fields
        const form = await fetchFormById(submission.formId);
        
        // Find mapped fields
        if (form && form.fields) {
          const mappedFields: Record<string, FormFieldValue> = {};
          
          // Extract mapped field values from submission content
          form.fields.forEach(field => {
            if (field.mapToField && submission.content[field.id] !== undefined) {
              const value = submission.content[field.id];
              mappedFields[field.mapToField] = typeof value === 'string' || typeof value === 'number' || 
                                              typeof value === 'boolean' || value === null
                                              ? value
                                              : String(value);
            }
          });
          
          // If we have mapped fields, store them in the submission
          if (Object.keys(mappedFields).length > 0) {
            submissionData.mapped_fields = mappedFields as unknown as Json;
          }
          
          // Try to find alumni by UVID
          const alumni = await fetchAlumniByUvid(submission.submittedByUvid);
          
          // If alumni found, add the alumni ID to the submission
          if (alumni) {
            submissionData.submitted_by_alumni_id = alumni.id;
          }
        }
      } catch (error) {
        console.error('Error processing form mapping:', error);
        // Continue with submission even if mapping fails
      }
    } else {
      // Legacy submission with name and email
      submissionData.submitted_by_name = submission.submittedByName || 'Anonymous';
      submissionData.submitted_by_email = submission.submittedByEmail || '';
      if (submission.submittedByAlumniId) {
        submissionData.submitted_by_alumni_id = submission.submittedByAlumniId;
      }
    }

    console.log("Submitting form data:", submissionData);

    const { data, error } = await supabase
      .from('form_submissions')
      .insert(submissionData)
      .select();

    if (error) {
      console.error('Error submitting form response:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error in submitFormResponse:', error);
    throw error;
  }
};

export const fetchFormSubmissions = async (): Promise<FormSubmission[]> => {
  // Get the data from form_submissions
  const { data, error } = await supabase
    .from('form_submissions')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching form submissions:', error);
    throw error;
  }
  
  // Map the Supabase response to our frontend data model
  return Promise.all(data.map(async (submission) => {
    let formInfo = null;
    
    if (submission.form_id) {
      try {
        formInfo = await fetchFormById(submission.form_id);
      } catch (err) {
        console.error(`Error fetching form with ID ${submission.form_id}:`, err);
      }
    }
    
    // Convert snake_case to camelCase, but handle mappedFields separately to avoid type issues
    const submissionData = {
      id: submission.id,
      type: submission.type as FormSubmission['type'],
      content: submission.content,
      submittedBy: {
        name: submission.submitted_by_name || 'Anonymous',
        email: submission.submitted_by_email || '',
        alumniId: submission.submitted_by_alumni_id,
      },
      submittedByUvid: submission.submitted_by_uvid,
      isAnonymous: submission.is_anonymous,
      createdAt: submission.created_at,
      status: submission.status,
      notes: submission.notes,
      formId: submission.form_id,
      mappedFields: submission.mapped_fields || {},
      form: formInfo ? {
        id: formInfo.id,
        title: formInfo.title,
        description: formInfo.description
      } : undefined
    };
    
    return submissionData as FormSubmission;
  }));
};

export const updateFormSubmissionStatus = async (id: string, status: string) => {
  const { error } = await supabase
    .from('form_submissions')
    .update({ status })
    .eq('id', id);
  
  if (error) {
    console.error('Error updating form submission status:', error);
    throw error;
  }
  
  return true;
};

export const addFormSubmissionNote = async (id: string, notes: string) => {
  const { error } = await supabase
    .from('form_submissions')
    .update({ notes })
    .eq('id', id);
  
  if (error) {
    console.error('Error adding form submission note:', error);
    throw error;
  }
  
  return true;
};
