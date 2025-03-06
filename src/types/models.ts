
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
  type: 'text' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'email' | 'number' | 'date';
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[]; // For select, checkbox, radio
  defaultValue?: string;
}

export interface FormSubmission {
  id: string;
  type: 'update' | 'new-info' | 'event-rsvp' | 'volunteer' | 'other';
  submittedBy: {
    name: string;
    email: string;
    alumniId?: string;
  };
  content: Record<string, any>;
  status: 'pending' | 'reviewed' | 'processed' | 'archived';
  createdAt: string;
  notes?: string;
  isAnonymous?: boolean;
  submittedByUvid?: string;
}
