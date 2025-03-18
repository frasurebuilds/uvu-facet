import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export type CalendarProps = React.ComponentProps<typeof DayPicker> & {
  /** Custom prop to show month picker only */
  monthPickerMode?: boolean;
};

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  monthPickerMode = false,
  ...props
}: CalendarProps) {
  const [month, setMonth] = React.useState<Date>(props.defaultMonth || new Date());
  const [year, setYear] = React.useState<number>(month.getFullYear());

  // Handle month selection in month picker mode
  const handleMonthSelect = (newMonth: number) => {
    const newDate = new Date(year, newMonth, 1);
    setMonth(newDate);
    if (props.mode === "single" && props.onSelect) {
      props.onSelect(newDate);
    }
  };

  // Create month buttons for the month picker
  const monthButtons = React.useMemo(() => {
    if (!monthPickerMode) return null;

    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    
    return (
      <div className="grid grid-cols-3 gap-2 p-2">
        {months.map((monthName, index) => (
          <button
            key={monthName}
            onClick={() => handleMonthSelect(index)}
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "justify-center",
              month.getMonth() === index && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
            )}
            type="button"
          >
            {monthName.substring(0, 3)}
          </button>
        ))}
      </div>
    );
  }, [month, year, monthPickerMode]);

  // Handle year navigation
  const handlePreviousYear = () => {
    setYear(year - 1);
    setMonth(new Date(year - 1, month.getMonth(), 1));
  };

  const handleNextYear = () => {
    setYear(year + 1);
    setMonth(new Date(year + 1, month.getMonth(), 1));
  };

  // Year picker component
  const yearPicker = React.useMemo(() => {
    if (!monthPickerMode) return null;

    return (
      <div className="flex items-center justify-center p-2">
        <button
          onClick={handlePreviousYear}
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          type="button"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="mx-2 text-sm font-medium">{year}</div>
        <button
          onClick={handleNextYear}
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          type="button"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    );
  }, [year, monthPickerMode]);

  // If in month picker mode, render our custom month/year picker
  if (monthPickerMode) {
    return (
      <div className={cn("p-3 pointer-events-auto", className)}>
        {yearPicker}
        {monthButtons}
      </div>
    );
  }

  // Otherwise render the standard DayPicker
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3 pointer-events-auto", className)}
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
          "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground",
        day_outside:
          "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ..._props }) => <ChevronLeft className="h-4 w-4" />,
        IconRight: ({ ..._props }) => <ChevronRight className="h-4 w-4" />,
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
