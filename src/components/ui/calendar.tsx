
import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker, SelectSingleEventHandler } from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export type CalendarProps = React.ComponentProps<typeof DayPicker> & {
  showMonthYearPicker?: boolean;
  selected?: Date;
  onSelect?: (date: Date | undefined) => void;
};

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  showMonthYearPicker = false,
  selected,
  onSelect,
  ...props
}: CalendarProps) {
  const [displayedYear, setDisplayedYear] = React.useState(
    props.defaultMonth?.getFullYear() || new Date().getFullYear()
  );

  const months = [
    "January", "February", "March", "April", 
    "May", "June", "July", "August", 
    "September", "October", "November", "December"
  ];

  const handleMonthSelect = (month: number) => {
    const newDate = new Date(displayedYear, month, 1);
    if (onSelect) {
      onSelect(newDate);
    }
  };

  const handleYearChange = (increment: number) => {
    setDisplayedYear(prevYear => prevYear + increment);
  };

  if (showMonthYearPicker) {
    return (
      <div className={cn("p-3", className)}>
        <div className="flex justify-center items-center mb-4 relative">
          <button
            type="button"
            onClick={() => handleYearChange(-1)}
            className={cn(
              buttonVariants({ variant: "outline" }),
              "h-7 w-7 bg-transparent p-0 absolute left-1"
            )}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          
          <div className="text-base font-semibold">
            {displayedYear}
          </div>
          
          <button
            type="button"
            onClick={() => handleYearChange(1)}
            className={cn(
              buttonVariants({ variant: "outline" }),
              "h-7 w-7 bg-transparent p-0 absolute right-1"
            )}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        
        <div className="grid grid-cols-3 gap-2">
          {months.map((month, index) => (
            <button
              key={month}
              onClick={() => handleMonthSelect(index)}
              className={cn(
                buttonVariants({ variant: "outline" }),
                "py-2 px-1 h-auto justify-center text-sm hover:bg-primary hover:text-primary-foreground",
                selected && 
                  selected.getMonth() === index && 
                  selected.getFullYear() === displayedYear &&
                  "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
              )}
            >
              {month}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Create a handler that's compatible with DayPicker's expected type
  const handleSelectDay: SelectSingleEventHandler = (day) => {
    if (onSelect) {
      onSelect(day);
    }
  };

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell:
          "text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: cn(
          "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md",
          props.mode === "range"
            ? "[&:has(>.day-range-end)]:rounded-r-md [&:has(>.day-range-start)]:rounded-l-md"
            : ""
        ),
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-8 w-8 p-0 font-normal aria-selected:opacity-100"
        ),
        day_range_start: "day-range-start",
        day_range_end: "day-range-end",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground",
        day_outside: "text-muted-foreground opacity-50",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: () => <ChevronLeft className="h-4 w-4" />,
        IconRight: () => <ChevronRight className="h-4 w-4" />,
      }}
      mode="single"
      selected={selected}
      onSelect={handleSelectDay}
      fromYear={1980}
      toYear={new Date().getFullYear() + 10}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
