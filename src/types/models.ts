
// Type definitions for our data models

export interface Alumni {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  graduationYear: number;
  degree: string;
  major: string;
  linkedIn?: string;
  notes?: string;
  lastContactDate?: string;
  avatar?: string;
  doNotContact: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Organization {
  id: string;
  name: string;
  industry: string;
  website?: string;
  location?: string;
  contactPerson?: string;
  contactEmail?: string;
  contactPhone?: string;
  employeeCount?: number;
  notes?: string;
  logo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface JobHistory {
  id: string;
  alumniId: string;
  organizationId?: string;
  organizationName?: string;
  website?: string;
  jobTitle: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Form {
  id: string;
  title: string;
  description?: string;
  status: 'active' | 'draft' | 'archived';
  formType: 'standard' | 'anonymous';
  fields: FormField[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface FormField {
  id: string;
  type: 'text' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'email' | 'number' | 'date' | 'month-year' | 'header' | 'description' | 'divider';
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[]; // For select, checkbox, radio
  defaultValue?: string;
  mappedField?: string; // Reference to an alumni profile field
}

export interface FormSubmission {
  id: string;
  type: string;
  submittedByName: string;
  submittedByEmail: string;
  submittedByUvid?: string;
  submittedByAlumniId?: string;
  isAnonymous?: boolean;
  content: Record<string, any>; // This is the correct type
  mappedFields?: Record<string, any>; // This is the correct type
  status: 'pending' | 'reviewed' | 'processed' | 'archived';
  createdAt: string;
  notes?: string;
}

// Add this new interface for employment form fields
export interface EmploymentFields {
  jobTitle?: string;
  organizationName?: string;
  startDate?: string;
  endDate?: string;
  isCurrent?: boolean | string; // Can be boolean or string "true"/"false"
  description?: string;
  website?: string;
  [key: string]: any; // Allow for other potential fields
}
