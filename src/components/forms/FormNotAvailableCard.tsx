
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface FormNotAvailableCardProps {
  isError: boolean;
  errorMessage?: string;
  showReturnButton?: boolean;
}

const FormNotAvailableCard = ({ 
  isError, 
  errorMessage,
  showReturnButton = true
}: FormNotAvailableCardProps) => {
  const navigate = useNavigate();
  
  return (
    <Card className="shadow-md">
      <CardContent className="pt-6">
        <div className="text-center py-8">
          <div className="flex justify-center mb-4">
            <AlertTriangle className="h-12 w-12 text-amber-500" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Form Not Available</h2>
          <p className="text-gray-500 mb-4">
            {isError 
              ? "The form you're looking for doesn't exist or cannot be accessed."
              : "This form is currently not active."}
          </p>
          {errorMessage && (
            <p className="text-red-500 mt-2 text-sm mb-4">
              Error details: {errorMessage}
            </p>
          )}
          
          {showReturnButton && (
            <Button 
              variant="outline" 
              onClick={() => navigate('/forms')}
              className="mt-2"
            >
              Return to Forms
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default FormNotAvailableCard;
