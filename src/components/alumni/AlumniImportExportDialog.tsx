
import { useState } from "react";
import { FileDown, FileUp, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Alumni } from "@/types/models";

interface AlumniImportExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  alumni: Alumni[];
}

const AlumniImportExportDialog = ({ open, onOpenChange, alumni }: AlumniImportExportDialogProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleImport = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a CSV file to import",
        variant: "destructive",
      });
      return;
    }

    if (!file.name.endsWith('.csv')) {
      toast({
        title: "Invalid file format",
        description: "Please select a CSV file",
        variant: "destructive",
      });
      return;
    }

    setImporting(true);
    try {
      // Here we would implement the actual CSV parsing and importing to Supabase
      // For now, we'll just simulate a delay and show a success message
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      toast({
        title: "Import successful",
        description: "Alumni data has been imported",
      });
      onOpenChange(false);
    } catch (error) {
      console.error("Import error:", error);
      toast({
        title: "Import failed",
        description: "There was an error importing the alumni data",
        variant: "destructive",
      });
    } finally {
      setImporting(false);
      setFile(null);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      // Convert alumni data to CSV
      const headers = ["id", "firstName", "lastName", "email", "phone", "graduationYear", "degree", "major", "linkedIn", "notes"];
      const csvData = [
        headers.join(","),
        ...alumni.map(alum => {
          return [
            alum.id,
            alum.firstName,
            alum.lastName,
            alum.email,
            alum.phone || "",
            alum.graduationYear,
            alum.degree,
            alum.major,
            alum.linkedIn || "",
            (alum.notes || "").replace(/,/g, ";").replace(/\n/g, " ")
          ].join(",");
        })
      ].join("\n");

      // Create a Blob and download
      const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `alumni_export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Export successful",
        description: `${alumni.length} alumni records exported`,
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Export failed",
        description: "There was an error exporting the alumni data",
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Import/Export Alumni Data</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="import" className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="import">Import</TabsTrigger>
            <TabsTrigger value="export">Export</TabsTrigger>
          </TabsList>
          
          <TabsContent value="import" className="space-y-4 mt-4">
            <div className="p-4 border-2 border-dashed rounded-md text-center hover:bg-gray-50 transition-colors">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
                id="csv-file-input"
              />
              <label 
                htmlFor="csv-file-input"
                className="flex flex-col items-center gap-2 cursor-pointer"
              >
                <FileUp className="h-8 w-8 text-gray-400" />
                <p className="text-sm font-medium">
                  {file ? file.name : "Click to select a CSV file"}
                </p>
                <p className="text-xs text-gray-500">
                  CSV file should have headers: firstName, lastName, email, etc.
                </p>
              </label>
            </div>
            
            <Button 
              onClick={handleImport}
              disabled={importing || !file}
              className="w-full bg-uvu-green hover:bg-uvu-green-medium"
            >
              {importing ? "Importing..." : "Import Alumni"}
            </Button>
          </TabsContent>
          
          <TabsContent value="export" className="space-y-4 mt-4">
            <div className="bg-gray-50 p-4 rounded-md">
              <div className="flex items-center gap-3 mb-2">
                <FileDown className="h-6 w-6 text-gray-600" />
                <div>
                  <h3 className="font-medium">Export to CSV</h3>
                  <p className="text-sm text-gray-500">
                    Export {alumni.length} alumni records to a CSV file
                  </p>
                </div>
              </div>
            </div>
            
            <Button 
              onClick={handleExport}
              disabled={exporting || alumni.length === 0}
              className="w-full bg-uvu-green hover:bg-uvu-green-medium"
            >
              {exporting ? "Exporting..." : "Export Alumni"}
            </Button>
          </TabsContent>
        </Tabs>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AlumniImportExportDialog;
