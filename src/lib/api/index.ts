
// Export all API functions from each module
export * from './alumniApi';
export * from './jobHistoryApi';
export * from './organizationApi';
export * from './formApi';

// Define a simplified type to avoid circular references and fix TS2589 error
export type FormFieldValue = string | number | boolean | string[] | null;
export type FormFieldsMap = Record<string, FormFieldValue>;
