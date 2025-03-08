
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";

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
  // Base submission data
  const submissionData: any = {
    type: 'form_response',
    content: submission.content as unknown as Json,
    form_id: submission.formId,
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
    notes: submission.notes
  }));
};
