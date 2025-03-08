
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface UvidFieldProps {
  uvid: string;
  setUvid: (value: string) => void;
}

const UvidField = ({ uvid, setUvid }: UvidFieldProps) => {
  return (
    <div className="space-y-4 border-b pb-6">
      <h3 className="font-medium text-lg">Your Information</h3>
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
      </div>
    </div>
  );
};

export default UvidField;
