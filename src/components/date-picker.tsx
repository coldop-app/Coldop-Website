import * as React from 'react';
import { CalendarIcon } from 'lucide-react';

import { Calendar } from '@/components/ui/calendar';
import { Field, FieldLabel } from '@/components/ui/field';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/input-group';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

function formatDate(date: Date | undefined) {
  if (!date) {
    return '';
  }

  return date.toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

function isValidDate(date: Date | undefined) {
  if (!date) {
    return false;
  }
  return !Number.isNaN(date.getTime());
}

export type DatePickerInputProps = {
  id?: string;
  label?: string;
  placeholder?: string;
  value?: Date;
  defaultValue?: Date;
  onChange?: (date: Date | undefined) => void;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  'aria-invalid'?: boolean;
};

export function DatePickerInput({
  id: idProp,
  label,
  placeholder = 'Pick a date',
  value: valueProp,
  defaultValue,
  onChange,
  onBlur,
  className,
  disabled,
  required,
  'aria-invalid': ariaInvalid,
}: DatePickerInputProps) {
  const generatedId = React.useId();
  const id = idProp ?? generatedId;
  const isControlled = onChange !== undefined;

  const [open, setOpen] = React.useState(false);
  const [internalDate, setInternalDate] = React.useState<Date | undefined>(defaultValue);
  const date = isControlled ? valueProp : internalDate;

  const [month, setMonth] = React.useState<Date | undefined>(date);
  const [inputValue, setInputValue] = React.useState(formatDate(date));

  const setDate = React.useCallback(
    (next: Date | undefined) => {
      if (!isControlled) {
        setInternalDate(next);
      }
      onChange?.(next);
    },
    [isControlled, onChange],
  );

  const [prevDate, setPrevDate] = React.useState(date);
  if (date !== prevDate) {
    setPrevDate(date);
    setInputValue(formatDate(date));
    if (date) {
      setMonth(date);
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextValue = e.target.value;
    setInputValue(nextValue);

    if (!nextValue.trim()) {
      setDate(undefined);
      return;
    }

    const parsed = new Date(nextValue);
    if (isValidDate(parsed)) {
      setDate(parsed);
      setMonth(parsed);
    }
  };

  const handleCalendarSelect = (selected: Date | undefined) => {
    setDate(selected);
    setInputValue(formatDate(selected));
    setOpen(false);
  };

  const field = (
    <InputGroup>
      <InputGroupInput
        id={id}
        name={id}
        value={inputValue}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        aria-invalid={ariaInvalid}
        onChange={handleInputChange}
        onBlur={onBlur}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            setOpen(true);
          }
        }}
      />
      <InputGroupAddon align="inline-end">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <InputGroupButton
              type="button"
              variant="ghost"
              size="icon-xs"
              disabled={disabled}
              aria-label="Select date"
            >
              <CalendarIcon />
              <span className="sr-only">Select date</span>
            </InputGroupButton>
          </PopoverTrigger>
          <PopoverContent
            className="w-auto overflow-hidden p-0"
            align="end"
            alignOffset={-8}
            sideOffset={10}
          >
            <Calendar
              mode="single"
              selected={date}
              month={month}
              onMonthChange={setMonth}
              onSelect={handleCalendarSelect}
            />
          </PopoverContent>
        </Popover>
      </InputGroupAddon>
    </InputGroup>
  );

  if (!label) {
    return <div className={cn('w-full', className)}>{field}</div>;
  }

  return (
    <Field className={cn('w-full', className)}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      {field}
    </Field>
  );
}
