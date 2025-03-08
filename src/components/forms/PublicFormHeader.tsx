
import { CardHeader, CardTitle } from "@/components/ui/card";

interface PublicFormHeaderProps {
  title: string;
  description?: string;
}

const PublicFormHeader = ({ title, description }: PublicFormHeaderProps) => {
  return (
    <CardHeader>
      <CardTitle className="text-2xl">{title}</CardTitle>
      {description && (
        <p className="text-gray-500 mt-2">{description}</p>
      )}
    </CardHeader>
  );
};

export default PublicFormHeader;
