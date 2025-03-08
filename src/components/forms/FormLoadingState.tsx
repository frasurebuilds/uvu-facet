
import { Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface FormLoadingStateProps {
  message?: string;
}

const FormLoadingState = ({ message = "Loading form..." }: FormLoadingStateProps) => {
  return (
    <Card className="shadow-md">
      <CardContent className="flex flex-col justify-center items-center py-16">
        <Loader2 className="w-10 h-10 animate-spin text-uvu-green mb-4" />
        <p className="text-gray-500 font-medium">{message}</p>
      </CardContent>
    </Card>
  );
};

export default FormLoadingState;
