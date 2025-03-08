
import { useParams, Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchFormById } from "@/lib/api/formApi";

const FormSubmittedPage = () => {
  const { id } = useParams<{ id: string }>();
  
  // Fetch form data to determine if it was anonymous
  const { data: form } = useQuery({
    queryKey: ['submitted-form', id],
    queryFn: () => fetchFormById(id as string, true), // Use public access mode
    enabled: !!id
  });

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <Card>
        <CardContent className="pt-6 flex flex-col items-center text-center">
          <CheckCircle2 className="h-12 w-12 text-green-500 mb-4" />
          <h1 className="text-2xl font-semibold mb-2">Thank You!</h1>
          <p className="text-gray-500 mb-6">
            {form?.formType === 'anonymous' 
              ? "Your anonymous response has been successfully submitted."
              : "Your form has been successfully submitted."}
          </p>
          <div className="space-x-4">
            <Button 
              variant="outline" 
              asChild
            >
              <Link to={`/public-form/${id}`}>Submit Another Response</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FormSubmittedPage;
