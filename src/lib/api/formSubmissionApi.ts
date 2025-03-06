
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";

interface FormSubmissionRequest {
  formId: string;
  content: Record<string, any>;
  submittedByName: string;
  submittedByEmail: string;
  submittedByAlumniId?: string;
}

export const submitFormResponse = async (submission: FormSubmissionRequest) => {
  const { data, error } = await supabase
    .from('form_submissions')
    .insert({
      type: 'form_response',
      content: submission.content as unknown as Json,
      submitted_by_name: submission.submittedByName,
      submitted_by_email: submission.submittedByEmail,
      submitted_by_alumni_id: submission.submittedByAlumniId
    });

  if (error) {
    console.error('Error submitting form response:', error);
    throw error;
  }
  
  return data;
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
    submittedByAlumniId: submission.submitted_by_alumni_id,
    createdAt: submission.created_at,
    status: submission.status,
    notes: submission.notes
  }));
};
