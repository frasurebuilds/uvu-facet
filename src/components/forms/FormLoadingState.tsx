
import { Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const FormLoadingState = () => {
  return (
    <Card>
      <CardContent className="flex flex-col justify-center items-center py-16">
        <Loader2 className="w-10 h-10 animate-spin text-uvu-green mb-4" />
        <p className="text-gray-500 font-medium">Loading form...</p>
      </CardContent>
    </Card>
  );
};

export default FormLoadingState;
