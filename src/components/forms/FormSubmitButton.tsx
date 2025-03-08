
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface FormSubmitButtonProps {
  isSubmitting: boolean;
  disabled?: boolean;
}

const FormSubmitButton = ({ isSubmitting, disabled = false }: FormSubmitButtonProps) => {
  return (
    <Button 
      type="submit" 
      className="bg-uvu-green hover:bg-uvu-green-medium w-full sm:w-auto"
      disabled={isSubmitting || disabled}
    >
      {isSubmitting ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Submitting...
        </>
      ) : (
        "Submit"
      )}
    </Button>
  );
};

export default FormSubmitButton;
