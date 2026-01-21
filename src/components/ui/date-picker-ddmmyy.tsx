import * as React from "react";
import { CalendarIcon } from "lucide-react";
import { Button } from "./button";
import { Calendar } from "./calendar";
import { Input } from "./input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./popover";

interface DatePickerDDMMYYProps {
  value?: Date;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
}

function formatDateDDMMYY(date: Date | undefined): string {
  if (!date) {
    return "";
  }
  // Format as DD.MM.YY
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear().toString().slice(-2);
  return `${day}.${month}.${year}`;
}

function isValidDate(date: Date | undefined): boolean {
  if (!date) {
    return false;
  }
  return !isNaN(date.getTime());
}

export const DatePickerDDMMYY: React.FC<DatePickerDDMMYYProps> = ({
  value,
  onChange,
  placeholder = "DD.MM.YY or click calendar",
}) => {
  const [open, setOpen] = React.useState(false);
  const [month, setMonth] = React.useState<Date | undefined>(value);
  const [inputValue, setInputValue] = React.useState(formatDateDDMMYY(value));

  React.useEffect(() => {
    setInputValue(formatDateDDMMYY(value));
    if (value) {
      setMonth(value);
    }
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    setInputValue(input);

    // Try to parse DD.MM.YY format
    const dateMatchYY = input.match(/^(\d{2})\.(\d{2})\.(\d{2})$/);
    if (dateMatchYY) {
      const [, day, month, year] = dateMatchYY;
      // Convert 2-digit year to 4-digit (assuming 2000-2099)
      const fullYear = parseInt(year) < 50 ? 2000 + parseInt(year) : 1900 + parseInt(year);
      const date = new Date(fullYear, parseInt(month) - 1, parseInt(day));
      if (isValidDate(date)) {
        onChange(date);
        setMonth(date);
        return;
      }
    }

    // Also try to parse DD.MM.YYYY format for backward compatibility
    const dateMatchYYYY = input.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
    if (dateMatchYYYY) {
      const [, day, month, year] = dateMatchYYYY;
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      if (isValidDate(date)) {
        onChange(date);
        setMonth(date);
        return;
      }
    }

    // If input is cleared, set to undefined
    if (input === "") {
      onChange(undefined);
    }
  };

  return (
    <div className="relative flex gap-2">
      <Input
        value={inputValue}
        placeholder={placeholder}
        className="bg-background pr-10"
        onChange={handleInputChange}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setOpen(true);
          }
        }}
      />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            className="absolute top-1/2 right-2 size-6 -translate-y-1/2"
          >
            <CalendarIcon className="size-3.5" />
            <span className="sr-only">Select date</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto overflow-hidden p-0 z-[10001]"
          align="end"
          alignOffset={-8}
          sideOffset={10}
        >
          <Calendar
            mode="single"
            selected={value}
            captionLayout="dropdown"
            month={month}
            onMonthChange={setMonth}
            onSelect={(date) => {
              onChange(date);
              setInputValue(formatDateDDMMYY(date));
              setOpen(false);
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};
