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

interface SimpleDatePickerProps {
  value?: Date;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
}

function formatDate(date: Date | undefined): string {
  if (!date) {
    return "";
  }
  // Format as DD.MM.YYYY
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
}

function isValidDate(date: Date | undefined): boolean {
  if (!date) {
    return false;
  }
  return !isNaN(date.getTime());
}

export const SimpleDatePicker: React.FC<SimpleDatePickerProps> = ({
  value,
  onChange,
  placeholder = "DD.MM.YYYY or click calendar",
}) => {
  const [open, setOpen] = React.useState(false);
  const [month, setMonth] = React.useState<Date | undefined>(value);
  const [inputValue, setInputValue] = React.useState(formatDate(value));

  React.useEffect(() => {
    setInputValue(formatDate(value));
    if (value) {
      setMonth(value);
    }
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    setInputValue(input);

    // Try to parse DD.MM.YYYY format
    const dateMatch = input.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
    if (dateMatch) {
      const [, day, month, year] = dateMatch;
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
              setInputValue(formatDate(date));
              setOpen(false);
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};
