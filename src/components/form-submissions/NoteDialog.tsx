
import React from "react";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface NoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  noteText: string;
  setNoteText: (value: string) => void;
  onSave: () => void;
}

const NoteDialog = ({
  open,
  onOpenChange,
  noteText,
  setNoteText,
  onSave
}: NoteDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Note to Submission</DialogTitle>
          <DialogDescription>
            Add a note to this submission for reference or follow-up actions.
          </DialogDescription>
        </DialogHeader>
        <Textarea 
          value={noteText} 
          onChange={(e) => setNoteText(e.target.value)}
          placeholder="Enter your notes here..."
          rows={5}
        />
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSave} className="bg-uvu-green hover:bg-uvu-green-medium">
            Save Note
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NoteDialog;
