
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface UvidFieldProps {
  uvid: string;
  setUvid: (value: string) => void;
}

const UvidField = ({ uvid, setUvid }: UvidFieldProps) => {
  return (
    <div className="space-y-4 border-b pb-6">
      <div className="flex items-center gap-2">
        <h3 className="font-medium text-lg">Your Information</h3>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Info className="h-4 w-4 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs">
                Your UVID will be used to find or create your alumni profile. 
                Information from this form may update your profile if fields are mapped.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="uvid">
          UVID <span className="text-red-500">*</span>
        </Label>
        <Input
          id="uvid"
          value={uvid}
          onChange={(e) => setUvid(e.target.value)}
          placeholder="Enter your UVID"
          required
        />
        <p className="text-sm text-muted-foreground">
          Your UVID is used to identify you and update your alumni profile.
        </p>
      </div>
    </div>
  );
};

export default UvidField;
