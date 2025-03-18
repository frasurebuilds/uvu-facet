
import { supabase } from "@/integrations/supabase/client";
import { Organization } from "@/types/models";
import { toCamelCase, toSnakeCase } from "./apiUtils";

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
  
  console.log('Updating organization:', id, updateData);
  
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
