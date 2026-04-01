import * as React from 'react';
import { CalendarIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/helpers';

/** Accepts dd.mm.yyyy or YYYY-MM-DD; returns local calendar date or undefined. */
function parseFlexibleDate(str: string): Date | undefined {
  const trimmed = str.trim();
  if (!trimmed) return undefined;

  const iso = trimmed.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (iso) {
    const year = Number(iso[1]);
    const month = Number(iso[2]);
    const day = Number(iso[3]);
    if (!year || !month || !day) return undefined;
    const parsed = new Date(year, month - 1, day);
    if (
      parsed.getFullYear() !== year ||
      parsed.getMonth() !== month - 1 ||
      parsed.getDate() !== day
    ) {
      return undefined;
    }
    return parsed;
  }

  const parts = trimmed.split('.').map(Number);
  if (parts.length !== 3) return undefined;
  const [day, month, year] = parts;
  if (!day || !month || !year) return undefined;
  const parsed = new Date(year, month - 1, day);
  if (
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month - 1 ||
    parsed.getDate() !== day
  ) {
    return undefined;
  }
  return parsed;
}

interface DatePickerProps {
  value?: string; // dd.mm.yyyy (or YYYY-MM-DD from parent — normalized on change)
  onChange?: (value: string) => void; // Always dd.mm.yyyy
  label?: string; // Optional label override
  id?: string; // Optional id override
  /** When true, input and container take full width (e.g. for mobile stacks) */
  fullWidth?: boolean;
  /** Optional class name for the label (e.g. to match form FieldLabel style) */
  labelClassName?: string;
  /**
   * When set, the text input is read-only and opening the calendar invokes this
   * instead of the popover (e.g. payment-restricted flows).
   */
  onBlockedInteraction?: () => void;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  label = 'Select Order Date',
  id = 'date',
  fullWidth = false,
  labelClassName,
  onBlockedInteraction,
}) => {
  const [open, setOpen] = React.useState(false);

  // Default to today's date
  const today = new Date();
  const defaultDateString = formatDate(today);

  // Use controlled value if provided, otherwise use default
  const dateString = value ?? defaultDateString;

  const [date, setDate] = React.useState<Date | undefined>(() =>
    parseFlexibleDate(dateString)
  );
  const [inputValue, setInputValue] = React.useState(() => {
    const p = parseFlexibleDate(dateString);
    return p ? formatDate(p) : dateString;
  });

  // Sync internal state when controlled value changes
  React.useEffect(() => {
    if (value !== undefined) {
      const parsed = parseFlexibleDate(value);
      if (parsed) {
        setInputValue(formatDate(parsed));
        setDate(parsed);
      } else {
        setInputValue(value);
      }
    }
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onBlockedInteraction) return;
    const newValue = e.target.value;
    setInputValue(newValue);
    const parsed = parseFlexibleDate(newValue);
    if (parsed) {
      setDate(parsed);
      onChange?.(formatDate(parsed));
    }
  };

  const handleInputBlur = () => {
    const parsed = parseFlexibleDate(inputValue);
    if (parsed) {
      const formatted = formatDate(parsed);
      setInputValue(formatted);
      setDate(parsed);
      onChange?.(formatted);
      return;
    }
    if (value !== undefined) {
      const p = parseFlexibleDate(value);
      setInputValue(p ? formatDate(p) : value);
      return;
    }
    const fallback = date ?? parseFlexibleDate(defaultDateString);
    if (fallback) {
      const formatted = formatDate(fallback);
      setInputValue(formatted);
      setDate(fallback);
      onChange?.(formatted);
    }
  };

  const handleSelect = (selectedDate?: Date) => {
    if (selectedDate) {
      setDate(selectedDate);
      const formatted = formatDate(selectedDate);
      setInputValue(formatted);
      onChange?.(formatted);
      setOpen(false);
    }
  };

  return (
    <div className={cn('space-y-3', fullWidth && 'w-full')}>
      <Label
        htmlFor={id}
        className={cn(
          'font-custom block text-sm font-medium leading-snug',
          labelClassName
        )}
      >
        {label}
      </Label>
      <div className={cn('flex items-center gap-3', fullWidth && 'w-full')}>
        {/* Manual input field */}
        <input
          id={id}
          type="text"
          placeholder="dd.mm.yyyy or yyyy-mm-dd"
          value={inputValue}
          readOnly={!!onBlockedInteraction}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          className={cn(
            'border-input bg-background rounded-md border px-4 py-2.5 text-sm shadow-sm transition-colors',
            'focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
            fullWidth ? 'min-w-0 flex-1 w-full' : 'w-44'
          )}
        />
        {/* Calendar popover */}
        <Popover
          open={onBlockedInteraction ? false : open}
          onOpenChange={(next) => {
            if (next && onBlockedInteraction) {
              onBlockedInteraction();
              return;
            }
            setOpen(next);
          }}
        >
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-10 w-10"
              aria-label="Open calendar"
            >
              <CalendarIcon className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            side="bottom"
            className="w-auto overflow-hidden p-0"
            align="start"
            sideOffset={10}
          >
            <Calendar
              mode="single"
              selected={date}
              onSelect={handleSelect}
              captionLayout="dropdown"
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};
