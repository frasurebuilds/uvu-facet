
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

interface FormNotAvailableCardProps {
  isError: boolean;
  errorMessage?: string;
}

const FormNotAvailableCard = ({ isError, errorMessage }: FormNotAvailableCardProps) => {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-center py-8">
          <div className="flex justify-center mb-4">
            <AlertTriangle className="h-12 w-12 text-amber-500" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Form Not Available</h2>
          <p className="text-gray-500">
            {isError 
              ? "The form you're looking for doesn't exist."
              : "This form is currently not active."}
          </p>
          {errorMessage && (
            <p className="text-red-500 mt-2 text-sm">
              Error details: {errorMessage}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default FormNotAvailableCard;
