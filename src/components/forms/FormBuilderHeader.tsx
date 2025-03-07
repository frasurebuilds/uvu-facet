
import { Button } from "@/components/ui/button";
import { ArrowLeft, Eye, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface FormBuilderHeaderProps {
  previewMode: boolean;
  isSubmitting: boolean;
  togglePreviewMode: () => void;
  handleSave: () => void;
}

const FormBuilderHeader = ({
  previewMode,
  isSubmitting,
  togglePreviewMode,
  handleSave
}: FormBuilderHeaderProps) => {
  const navigate = useNavigate();
  
  return (
    <div className="flex justify-between items-center">
      <Button 
        variant="outline" 
        onClick={() => navigate('/forms')}
        className="flex items-center gap-2"
      >
        <ArrowLeft size={16} />
        Back to Forms
      </Button>
      
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={togglePreviewMode}
          className="flex items-center gap-2"
        >
          <Eye size={16} />
          {previewMode ? "Edit Mode" : "Preview"}
        </Button>
        
        <Button
          onClick={handleSave}
          disabled={isSubmitting}
          className="bg-uvu-green hover:bg-uvu-green-medium flex items-center gap-2"
        >
          <Save size={16} />
          Save Form
        </Button>
      </div>
    </div>
  );
};

export default FormBuilderHeader;
