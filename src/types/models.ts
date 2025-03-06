
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
  jobTitle?: string;
  organizationId?: string;
  organizationName?: string;
  linkedIn?: string;
  notes?: string;
  lastContactDate?: string;
  avatar?: string;
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
  partnerships?: string[];
  notes?: string;
  logo?: string;
  createdAt: string;
  updatedAt: string;
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
}
