
import { supabase } from "@/integrations/supabase/client";
import { Form, FormField } from "@/types/models";
import { parseFormFields } from "./apiUtils";

export const fetchForms = async (): Promise<Form[]> => {
  const { data, error } = await supabase
    .from('forms')
    .select('*')
    .order('updated_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching forms:', error);
    throw error;
  }
  
  return data.map(form => ({
    id: form.id,
    title: form.title,
    description: form.description,
    status: form.status as "active" | "draft" | "archived",
    fields: parseFormFields(form.fields),
    createdAt: form.created_at,
    updatedAt: form.updated_at,
    createdBy: form.created_by
  }));
};

export const fetchFormById = async (id: string): Promise<Form> => {
  const { data, error } = await supabase
    .from('forms')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error(`Error fetching form with id ${id}:`, error);
    throw error;
  }
  
  return {
    id: data.id,
    title: data.title,
    description: data.description,
    status: data.status as "active" | "draft" | "archived",
    fields: parseFormFields(data.fields),
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    createdBy: data.created_by
  };
};

export const createForm = async (form: Omit<Form, 'id' | 'createdAt' | 'updatedAt'>): Promise<Form> => {
  const { data, error } = await supabase
    .from('forms')
    .insert({
      title: form.title,
      description: form.description,
      status: form.status,
      fields: form.fields,
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
  if (updateData.fields !== undefined) dbData.fields = updateData.fields;
  
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
