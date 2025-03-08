
import { supabase } from "@/integrations/supabase/client";
import { Form, FormField } from "@/types/models";
import { parseFormFields } from "./apiUtils";
import { Json } from "@/integrations/supabase/types";

export const fetchForms = async (): Promise<Form[]> => {
  console.log('Fetching all forms');
  
  const { data, error } = await supabase
    .from('forms')
    .select('*')
    .order('updated_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching forms:', error);
    throw error;
  }
  
  console.log(`Retrieved ${data?.length || 0} forms from database`);
  
  return data.map(form => ({
    id: form.id,
    title: form.title,
    description: form.description,
    status: form.status as "active" | "draft" | "archived",
    formType: form.form_type as "standard" | "anonymous" || "standard", // Default to standard for older forms
    fields: parseFormFields(form.fields),
    createdAt: form.created_at,
    updatedAt: form.updated_at,
    createdBy: form.created_by
  }));
};

export const fetchFormById = async (id: string, isPublicAccess: boolean = false): Promise<Form> => {
  console.log('Fetching form with ID:', id, 'isPublicAccess:', isPublicAccess);
  
  if (!id) {
    console.error('Invalid form ID provided:', id);
    throw new Error('Invalid form ID');
  }

  try {
    // First, let's log that we're querying the database
    console.log(`Executing Supabase query for form ID: ${id}`);
    
    // Fetch the form data from Supabase with retry logic
    let attempts = 0;
    const maxAttempts = 3;
    let data = null;
    let error = null;
    
    while (attempts < maxAttempts && !data) {
      // Create the base query
      let query = supabase
        .from('forms')
        .select('*')
        .eq('id', id);
      
      // Only filter by 'active' status for public access
      if (isPublicAccess) {
        query = query.eq('status', 'active');
        console.log('Adding status=active filter for public access');
      } else {
        console.log('No status filter applied for admin access');
      }
      
      const result = await query.maybeSingle();
      
      data = result.data;
      error = result.error;
      
      if (data) break;
      if (error && error.code !== 'PGRST116') break; // Only retry for certain errors
      
      attempts++;
      await new Promise(resolve => setTimeout(resolve, 500 * attempts)); // Exponential backoff
    }
    
    // Log the result
    console.log('Database query result:', data);
    
    if (error) {
      console.error(`Error fetching form with id ${id} from database:`, error);
      throw new Error(`Database error: ${error.message}`);
    }
    
    if (!data) {
      console.error(`Form with id ${id} not found in database${isPublicAccess ? ' or not active' : ''}`);
      throw new Error(`Form not found in database${isPublicAccess ? ' or not active' : ''}`);
    }
    
    // Transform the database record into our Form type
    console.log('Form data retrieved, converting to application model');
    
    return {
      id: data.id,
      title: data.title,
      description: data.description,
      status: data.status as "active" | "draft" | "archived",
      formType: data.form_type as "standard" | "anonymous" || "standard",
      fields: parseFormFields(data.fields),
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      createdBy: data.created_by
    };
  } catch (error) {
    console.error(`Failed to fetch form with id ${id}:`, error);
    throw error;
  }
};

export const createForm = async (form: Omit<Form, 'id' | 'createdAt' | 'updatedAt'>): Promise<Form> => {
  // Convert FormField[] to Json before saving
  const { data, error } = await supabase
    .from('forms')
    .insert({
      title: form.title,
      description: form.description,
      status: form.status,
      form_type: form.formType,
      fields: form.fields as unknown as Json,
      created_by: form.createdBy
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error creating form:', error);
    throw error;
  }
  
  return {
    id: data.id,
    title: data.title,
    description: data.description,
    status: data.status as "active" | "draft" | "archived",
    formType: data.form_type as "standard" | "anonymous",
    fields: parseFormFields(data.fields),
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    createdBy: data.created_by
  };
};

export const updateForm = async (form: Partial<Form> & { id: string }): Promise<Form> => {
  const { id, ...updateData } = form;
  
  // Convert to snake_case for database
  const dbData: any = {};
  if (updateData.title !== undefined) dbData.title = updateData.title;
  if (updateData.description !== undefined) dbData.description = updateData.description;
  if (updateData.status !== undefined) dbData.status = updateData.status;
  if (updateData.formType !== undefined) dbData.form_type = updateData.formType;
  if (updateData.fields !== undefined) dbData.fields = updateData.fields as unknown as Json;
  
  // Always update the updated_at timestamp
  dbData.updated_at = new Date();
  
  const { data, error } = await supabase
    .from('forms')
    .update(dbData)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error(`Error updating form with id ${id}:`, error);
    throw error;
  }
  
  return {
    id: data.id,
    title: data.title,
    description: data.description,
    status: data.status as "active" | "draft" | "archived",
    formType: data.form_type as "standard" | "anonymous",
    fields: parseFormFields(data.fields),
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    createdBy: data.created_by
  };
};

export const deleteForm = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('forms')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error(`Error deleting form with id ${id}:`, error);
    throw error;
  }
};
