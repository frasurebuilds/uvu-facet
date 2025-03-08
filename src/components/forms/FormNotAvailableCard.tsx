
import { Card, CardContent } from "@/components/ui/card";

interface FormNotAvailableCardProps {
  isError: boolean;
}

const FormNotAvailableCard = ({ isError }: FormNotAvailableCardProps) => {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-center py-8">
          <h2 className="text-xl font-semibold mb-2">Form Not Available</h2>
          <p className="text-gray-500">
            {isError 
              ? "The form you're looking for doesn't exist."
              : "This form is currently not active."}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default FormNotAvailableCard;
