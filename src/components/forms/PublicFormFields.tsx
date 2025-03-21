
import React from "react";
import { FormField } from "@/types/models";
import { Separator } from "@/components/ui/separator";

interface PublicFormFieldsProps {
  fields: FormField[];
  formValues: Record<string, any>;
  onInputChange: (fieldId: string, value: any) => void;
}

const PublicFormFields: React.FC<PublicFormFieldsProps> = ({ 
  fields, 
  formValues, 
  onInputChange 
}) => {
  return (
    <div className="space-y-6">
      {fields.map((field) => {
        // Handle different field types
        switch (field.type) {
          // Display elements (non-input)
          case 'header':
            return (
              <div key={field.id} className="mb-4">
                <h2 className="text-xl font-bold text-gray-800">{field.label}</h2>
              </div>
            );
            
          case 'description':
            return (
              <div key={field.id} className="mb-4">
                <p className="text-gray-600">{field.label}</p>
              </div>
            );
            
          case 'divider':
            return (
              <Separator key={field.id} className="my-4" />
            );
            
          // Input fields
          case 'text':
            return (
              <div key={field.id} className="space-y-2">
                <label htmlFor={field.id} className="block text-sm font-medium text-gray-700">
                  {field.label} {field.required && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="text"
                  id={field.id}
                  placeholder={field.placeholder}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={formValues[field.id] || ''}
                  onChange={(e) => onInputChange(field.id, e.target.value)}
                  required={field.required}
                />
              </div>
            );
            
          case 'textarea':
            return (
              <div key={field.id} className="space-y-2">
                <label htmlFor={field.id} className="block text-sm font-medium text-gray-700">
                  {field.label} {field.required && <span className="text-red-500">*</span>}
                </label>
                <textarea
                  id={field.id}
                  placeholder={field.placeholder}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={formValues[field.id] || ''}
                  onChange={(e) => onInputChange(field.id, e.target.value)}
                  required={field.required}
                  rows={4}
                />
              </div>
            );
            
          case 'email':
            return (
              <div key={field.id} className="space-y-2">
                <label htmlFor={field.id} className="block text-sm font-medium text-gray-700">
                  {field.label} {field.required && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="email"
                  id={field.id}
                  placeholder={field.placeholder}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={formValues[field.id] || ''}
                  onChange={(e) => onInputChange(field.id, e.target.value)}
                  required={field.required}
                />
              </div>
            );
            
          case 'select':
            return (
              <div key={field.id} className="space-y-2">
                <label htmlFor={field.id} className="block text-sm font-medium text-gray-700">
                  {field.label} {field.required && <span className="text-red-500">*</span>}
                </label>
                <select
                  id={field.id}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={formValues[field.id] || ''}
                  onChange={(e) => onInputChange(field.id, e.target.value)}
                  required={field.required}
                >
                  <option value="">Select an option</option>
                  {field.options?.map((option, index) => (
                    <option key={index} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            );
            
          case 'checkbox':
            return (
              <div key={field.id} className="space-y-2">
                <fieldset>
                  <legend className="block text-sm font-medium text-gray-700 mb-2">
                    {field.label} {field.required && <span className="text-red-500">*</span>}
                  </legend>
                  <div className="space-y-2">
                    {field.options?.map((option, index) => (
                      <div key={index} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`${field.id}-${index}`}
                          value={option}
                          checked={(formValues[field.id] || []).includes(option)}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            const currentValues = formValues[field.id] || [];
                            let newValues;
                            
                            if (checked) {
                              newValues = [...currentValues, option];
                            } else {
                              newValues = currentValues.filter((val: string) => val !== option);
                            }
                            
                            onInputChange(field.id, newValues);
                          }}
                          className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                        />
                        <label htmlFor={`${field.id}-${index}`} className="ml-2 block text-sm text-gray-700">
                          {option}
                        </label>
                      </div>
                    ))}
                  </div>
                </fieldset>
              </div>
            );
            
          case 'radio':
            return (
              <div key={field.id} className="space-y-2">
                <fieldset>
                  <legend className="block text-sm font-medium text-gray-700 mb-2">
                    {field.label} {field.required && <span className="text-red-500">*</span>}
                  </legend>
                  <div className="space-y-2">
                    {field.options?.map((option, index) => (
                      <div key={index} className="flex items-center">
                        <input
                          type="radio"
                          id={`${field.id}-${index}`}
                          name={field.id}
                          value={option}
                          checked={formValues[field.id] === option}
                          onChange={(e) => onInputChange(field.id, e.target.value)}
                          className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                          required={field.required && index === 0}
                        />
                        <label htmlFor={`${field.id}-${index}`} className="ml-2 block text-sm text-gray-700">
                          {option}
                        </label>
                      </div>
                    ))}
                  </div>
                </fieldset>
              </div>
            );
            
          case 'number':
            return (
              <div key={field.id} className="space-y-2">
                <label htmlFor={field.id} className="block text-sm font-medium text-gray-700">
                  {field.label} {field.required && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="number"
                  id={field.id}
                  placeholder={field.placeholder}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={formValues[field.id] || ''}
                  onChange={(e) => onInputChange(field.id, e.target.value === '' ? '' : Number(e.target.value))}
                  required={field.required}
                />
              </div>
            );
            
          case 'date':
            return (
              <div key={field.id} className="space-y-2">
                <label htmlFor={field.id} className="block text-sm font-medium text-gray-700">
                  {field.label} {field.required && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="date"
                  id={field.id}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={formValues[field.id] || ''}
                  onChange={(e) => onInputChange(field.id, e.target.value)}
                  required={field.required}
                />
              </div>
            );
            
          case 'month-year':
            // Parse existing value (if any)
            let selectedYear = '';
            let selectedMonth = '';
            
            if (formValues[field.id]) {
              const [year, month] = formValues[field.id].split('-');
              selectedYear = year || '';
              selectedMonth = month || '';
            }
            
            return (
              <div key={field.id} className="space-y-2">
                <label htmlFor={field.id} className="block text-sm font-medium text-gray-700">
                  {field.label} {field.required && <span className="text-red-500">*</span>}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    id={`${field.id}-month`}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    value={selectedMonth}
                    onChange={(e) => {
                      const newMonth = e.target.value;
                      // Only update if we have both month and year
                      if (newMonth && selectedYear) {
                        // Always use YYYY-MM format for date values
                        onInputChange(field.id, `${selectedYear}-${newMonth}`);
                      } else if (selectedYear) {
                        // If month is cleared but year exists
                        onInputChange(field.id, '');
                      }
                      // Update local state
                      selectedMonth = newMonth;
                    }}
                    required={field.required}
                  >
                    <option value="">Month</option>
                    <option value="01">January</option>
                    <option value="02">February</option>
                    <option value="03">March</option>
                    <option value="04">April</option>
                    <option value="05">May</option>
                    <option value="06">June</option>
                    <option value="07">July</option>
                    <option value="08">August</option>
                    <option value="09">September</option>
                    <option value="10">October</option>
                    <option value="11">November</option>
                    <option value="12">December</option>
                  </select>
                  
                  <select
                    id={`${field.id}-year`}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    value={selectedYear}
                    onChange={(e) => {
                      const newYear = e.target.value;
                      // Only update if we have both month and year
                      if (selectedMonth && newYear) {
                        // Always use YYYY-MM format for date values
                        onInputChange(field.id, `${newYear}-${selectedMonth}`);
                      } else if (selectedMonth) {
                        // If year is cleared but month exists
                        onInputChange(field.id, '');
                      }
                      // Update local state
                      selectedYear = newYear;
                    }}
                    required={field.required}
                  >
                    <option value="">Year</option>
                    {Array.from({ length: 100 }, (_, i) => {
                      const year = (new Date().getFullYear() - 70 + i).toString();
                      return (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>
            );
            
          default:
            return null;
        }
      })}
    </div>
  );
};

export default PublicFormFields;
