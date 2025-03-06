
import { Json } from "@/integrations/supabase/types";
import { FormField } from "@/types/models";

// Convert database column names to camelCase for frontend
export const toCamelCase = (obj: any): any => {
  if (obj === null || obj === undefined || typeof obj !== 'object') {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(v => toCamelCase(v));
  }

  const camelCaseObj: Record<string, any> = {};
  Object.keys(obj).forEach(key => {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    camelCaseObj[camelKey] = toCamelCase(obj[key]);
  });
  
  return camelCaseObj;
};

// Convert camelCase to snake_case for database
export const toSnakeCase = (obj: any): any => {
  if (obj === null || obj === undefined || typeof obj !== 'object') {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(v => toSnakeCase(v));
  }

  const snakeCaseObj: Record<string, any> = {};
  Object.keys(obj).forEach(key => {
    // Special case for linkedIn -> linked_in
    if (key === 'linkedIn') {
      snakeCaseObj['linked_in'] = toSnakeCase(obj[key]);
    } else {
      const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      snakeCaseObj[snakeKey] = toSnakeCase(obj[key]);
    }
  });
  
  return snakeCaseObj;
};

// Helper function to safely parse form fields from JSON
export const parseFormFields = (fields: Json): FormField[] => {
  if (Array.isArray(fields)) {
    return fields as FormField[];
  }
  
  try {
    if (typeof fields === 'string') {
      return JSON.parse(fields) as FormField[];
    }
  } catch (e) {
    console.error('Error parsing form fields:', e);
  }
  
  return [];
};
