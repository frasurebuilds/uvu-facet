
import * as React from "react";
import { Check, ChevronsUpDown, PlusCircle, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export interface SearchSelectOption {
  value: string;
  label: string;
}

interface SearchSelectProps {
  options: SearchSelectOption[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  emptyMessage?: string;
  className?: string;
  disabled?: boolean;
  allowCreate?: boolean;
  onCreateOption?: (value: string) => void;
  createOptionLabel?: string;
}

export function SearchSelect({
  options,
  value,
  onValueChange,
  placeholder = "Search...",
  emptyMessage = "No results found.",
  className,
  disabled = false,
  allowCreate = false,
  onCreateOption,
  createOptionLabel = "Create",
}: SearchSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");

  const selectedOption = React.useMemo(
    () => options.find((option) => option.value === value),
    [options, value]
  );

  const showCreateOption = React.useMemo(() => {
    if (!allowCreate || !searchQuery || !onCreateOption) return false;
    
    // Don't show create option if the search query exactly matches an existing option
    return !options.some(
      option => option.label.toLowerCase() === searchQuery.toLowerCase()
    );
  }, [allowCreate, searchQuery, options, onCreateOption]);

  const handleSelect = React.useCallback(
    (selectedValue: string) => {
      onValueChange(selectedValue);
      setOpen(false);
      setSearchQuery("");
    },
    [onValueChange]
  );

  const handleCreateOption = React.useCallback(() => {
    if (onCreateOption && searchQuery) {
      onCreateOption(searchQuery);
      setSearchQuery("");
      setOpen(false);
    }
  }, [onCreateOption, searchQuery]);

  const clearSelection = React.useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onValueChange("");
    },
    [onValueChange]
  );

  // Reset search query when dialog closes
  React.useEffect(() => {
    if (!open) {
      setSearchQuery("");
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={disabled ? undefined : setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between font-normal",
            !value && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          {selectedOption ? selectedOption.label : placeholder}
          <div className="flex items-center gap-1 ml-2">
            {value && (
              <X
                className="h-4 w-4 text-muted-foreground hover:text-foreground"
                onClick={clearSelection}
              />
            )}
            <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
          </div>
        </Button>
      </DialogTrigger>
      <DialogPortal>
        <DialogContent
          className="p-0 max-w-[400px] border bg-background shadow-md rounded-md overflow-hidden"
          style={{
            position: "absolute",
            width: "calc(100% - 3rem)",
            maxHeight: "300px",
            zIndex: 1000,
            backgroundColor: "var(--background)",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
            top: "calc(100% + 5px)", // Position right below the trigger button
            left: "0",
            transform: "none",
            marginTop: "0",
          }}
          onInteractOutside={(e) => {
            e.preventDefault(); // Prevent closing on interaction outside
          }}
        >
          {/* Add hidden DialogTitle for accessibility */}
          <DialogTitle className="sr-only">Search Options</DialogTitle>
          <Command shouldFilter={false} className="w-full">
            <div className="flex items-center border-b px-3 bg-background">
              <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
              <CommandInput
                placeholder={placeholder}
                className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 border-none"
                value={searchQuery}
                onValueChange={setSearchQuery}
                autoFocus
              />
            </div>
            <CommandList className="max-h-[200px] overflow-y-auto">
              <CommandEmpty className="py-3 px-4 text-sm text-center">
                {emptyMessage}
                {showCreateOption && (
                  <Button
                    variant="ghost"
                    className="w-full justify-start mt-2 text-uvu-green hover:text-uvu-green-medium hover:bg-uvu-green/10"
                    onClick={handleCreateOption}
                    type="button"
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    {createOptionLabel} "{searchQuery}"
                  </Button>
                )}
              </CommandEmpty>
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.label}
                    onSelect={() => handleSelect(option.value)}
                    className="cursor-pointer px-4 py-2 hover:bg-accent hover:text-accent-foreground"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === option.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {option.label}
                  </CommandItem>
                ))}
              </CommandGroup>
              {showCreateOption && (
                <>
                  <CommandSeparator className="mx-2" />
                  <CommandGroup>
                    <CommandItem
                      onSelect={handleCreateOption}
                      className="cursor-pointer text-uvu-green hover:text-uvu-green-medium px-4 py-2 hover:bg-accent hover:text-accent-foreground"
                    >
                      <PlusCircle className="mr-2 h-4 w-4" />
                      {createOptionLabel} "{searchQuery}"
                    </CommandItem>
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}
