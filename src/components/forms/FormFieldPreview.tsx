
import React from "react";
import { FormField } from "@/types/models";
import { Separator } from "@/components/ui/separator";

interface FormFieldPreviewProps {
  field: FormField;
}

const FormFieldPreview: React.FC<FormFieldPreviewProps> = ({ field }) => {
  // Helper function to render the preview based on field type
  const renderPreview = () => {
    switch (field.type) {
      // Display elements
      case 'header':
        return (
          <div className="preview-field">
            <h2 className="text-xl font-bold text-gray-800">{field.label}</h2>
          </div>
        );
        
      case 'description':
        return (
          <div className="preview-field">
            <p className="text-gray-600">{field.label}</p>
          </div>
        );
        
      case 'divider':
        return (
          <Separator className="my-4" />
        );

      // Input fields
      case 'text':
        return (
          <div className="preview-field">
            <label className="block text-sm font-medium mb-1">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <input
              type="text"
              className="w-full p-2 border border-gray-300 rounded-md bg-gray-50"
              placeholder={field.placeholder}
              disabled
            />
          </div>
        );
        
      case 'textarea':
        return (
          <div className="preview-field">
            <label className="block text-sm font-medium mb-1">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <textarea
              className="w-full p-2 border border-gray-300 rounded-md bg-gray-50"
              placeholder={field.placeholder}
              rows={3}
              disabled
            />
          </div>
        );
        
      case 'email':
        return (
          <div className="preview-field">
            <label className="block text-sm font-medium mb-1">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <input
              type="email"
              className="w-full p-2 border border-gray-300 rounded-md bg-gray-50"
              placeholder={field.placeholder || "email@example.com"}
              disabled
            />
          </div>
        );
        
      case 'select':
        return (
          <div className="preview-field">
            <label className="block text-sm font-medium mb-1">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <select
              className="w-full p-2 border border-gray-300 rounded-md bg-gray-50"
              disabled
            >
              <option>Select an option</option>
              {field.options?.map((option, index) => (
                <option key={index}>{option}</option>
              ))}
            </select>
          </div>
        );
        
      case 'checkbox':
        return (
          <div className="preview-field">
            <fieldset>
              <legend className="block text-sm font-medium mb-1">
                {field.label} {field.required && <span className="text-red-500">*</span>}
              </legend>
              <div className="space-y-2">
                {field.options?.map((option, index) => (
                  <div key={index} className="flex items-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-green-600"
                      disabled
                    />
                    <span className="ml-2 text-sm text-gray-700">{option}</span>
                  </div>
                ))}
              </div>
            </fieldset>
          </div>
        );
        
      case 'radio':
        return (
          <div className="preview-field">
            <fieldset>
              <legend className="block text-sm font-medium mb-1">
                {field.label} {field.required && <span className="text-red-500">*</span>}
              </legend>
              <div className="space-y-2">
                {field.options?.map((option, index) => (
                  <div key={index} className="flex items-center">
                    <input
                      type="radio"
                      className="h-4 w-4 text-green-600"
                      disabled
                    />
                    <span className="ml-2 text-sm text-gray-700">{option}</span>
                  </div>
                ))}
              </div>
            </fieldset>
          </div>
        );
        
      case 'number':
        return (
          <div className="preview-field">
            <label className="block text-sm font-medium mb-1">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <input
              type="number"
              className="w-full p-2 border border-gray-300 rounded-md bg-gray-50"
              placeholder={field.placeholder}
              disabled
            />
          </div>
        );
        
      case 'date':
        return (
          <div className="preview-field">
            <label className="block text-sm font-medium mb-1">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <input
              type="date"
              className="w-full p-2 border border-gray-300 rounded-md bg-gray-50"
              disabled
            />
          </div>
        );
        
      default:
        return (
          <div className="preview-field">
            <p className="text-sm text-gray-500">Unknown field type: {field.type}</p>
          </div>
        );
    }
  };

  return (
    <div className="border border-gray-200 rounded-md p-4 bg-white shadow-sm">
      {renderPreview()}
    </div>
  );
};

export default FormFieldPreview;
