
import { useState } from "react";
import PageLayout from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

// Mock data for forms - this would later be replaced with real data from API
const mockForms = [
  {
    id: "1",
    title: "Alumni Update Form",
    description: "Used by alumni to update their personal information and job history.",
    lastUpdated: "2023-05-15",
    status: "active",
    fields: 12
  },
  {
    id: "2",
    title: "Organization Partnership Form",
    description: "For organizations interested in partnerships with UVU alumni.",
    lastUpdated: "2023-06-22",
    status: "active",
    fields: 8
  },
  {
    id: "3",
    title: "Alumni Event Registration",
    description: "Registration form for upcoming alumni events.",
    lastUpdated: "2023-04-10",
    status: "draft",
    fields: 6
  }
];

const FormsPage = () => {
  const [activeTab, setActiveTab] = useState("active");

  return (
    <PageLayout
      title="Forms"
      subtitle="Create and manage forms for alumni and organizations"
      actionButton={
        <Button className="bg-uvu-green hover:bg-uvu-green-medium">
          <Plus className="mr-2 h-4 w-4" />
          Create Form
        </Button>
      }
    >
      <Tabs defaultValue="active" onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="active">Active Forms</TabsTrigger>
          <TabsTrigger value="drafts">Drafts</TabsTrigger>
          <TabsTrigger value="archived">Archived</TabsTrigger>
        </TabsList>
        
        <TabsContent value="active" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockForms.filter(f => f.status === "active").map(form => (
              <FormCard key={form.id} form={form} />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="drafts" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockForms.filter(f => f.status === "draft").map(form => (
              <FormCard key={form.id} form={form} />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="archived" className="space-y-4">
          <div className="text-center py-8">
            <p className="text-gray-500">No archived forms</p>
          </div>
        </TabsContent>
      </Tabs>

      {activeTab !== "archived" && mockForms.filter(f => 
        (activeTab === "active" && f.status === "active") || 
        (activeTab === "drafts" && f.status === "draft")
      ).length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No forms found</p>
        </div>
      )}
    </PageLayout>
  );
};

// Form card component
interface FormCardProps {
  form: {
    id: string;
    title: string;
    description: string;
    lastUpdated: string;
    status: string;
    fields: number;
  }
}

const FormCard = ({ form }: FormCardProps) => {
  return (
    <Card className="uvu-card card-hover-effect">
      <CardHeader>
        <CardTitle>{form.title}</CardTitle>
        <CardDescription>{form.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between text-sm">
          <div>
            <p className="text-gray-500">Last updated</p>
            <p>{form.lastUpdated}</p>
          </div>
          <div>
            <p className="text-gray-500">Fields</p>
            <p>{form.fields}</p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" size="sm">Edit</Button>
        <Button variant="secondary" size="sm">Preview</Button>
      </CardFooter>
    </Card>
  );
};

export default FormsPage;
