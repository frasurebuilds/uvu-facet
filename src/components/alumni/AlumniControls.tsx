
import { Search, UserPlus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface AlumniControlsProps {
  searchTerm: string;
  viewMode: "table" | "cards";
  onSearchChange: (value: string) => void;
  onViewModeChange: (mode: "table" | "cards") => void;
  onAddAlumni: () => void;
}

const AlumniControls = ({
  searchTerm,
  viewMode,
  onSearchChange,
  onViewModeChange,
  onAddAlumni
}: AlumniControlsProps) => {
  return (
    <div className="mb-6 flex flex-col sm:flex-row gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        <Input
          placeholder="Search alumni by name, email, major..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
      <div className="flex gap-2">
        <Button
          variant={viewMode === "table" ? "default" : "outline"}
          className={viewMode === "table" ? "bg-uvu-green hover:bg-uvu-green-medium" : ""}
          onClick={() => onViewModeChange("table")}
        >
          Table View
        </Button>
        <Button
          variant={viewMode === "cards" ? "default" : "outline"}
          className={viewMode === "cards" ? "bg-uvu-green hover:bg-uvu-green-medium" : ""}
          onClick={() => onViewModeChange("cards")}
        >
          Card View
        </Button>
      </div>
    </div>
  );
};

export default AlumniControls;
