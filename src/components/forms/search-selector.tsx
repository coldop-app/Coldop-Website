import * as React from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

export interface Option<T extends string> {
  label: string;
  value: T;
  searchableText?: string;
  renderLabel?: React.ReactNode;
}

export interface SearchSelectorProps<T extends string> {
  options: Option<T>[];
  placeholder?: string;
  searchPlaceholder?: string;
  onSelect?: (value: T | '') => void;
  className?: string;
  buttonClassName?: string;
  id?: string;
  disabled?: boolean;
  emptyMessage?: string;
  loading?: boolean;
  loadingMessage?: string;
  /** Initial value when uncontrolled */
  defaultValue?: T | '';
  /** When set, component is controlled: display and selection follow this value */
  value?: T | '';
}

export function SearchSelector<T extends string>({
  options,
  placeholder = 'Select option...',
  searchPlaceholder = 'Search...',
  onSelect,
  className,
  buttonClassName,
  id,
  disabled = false,
  emptyMessage = 'No results found.',
  loading = false,
  loadingMessage = 'Loading...',
  defaultValue = '',
  value: controlledValue,
}: SearchSelectorProps<T>) {
  const [open, setOpen] = React.useState(false);
  const [uncontrolledValue, setUncontrolledValue] = React.useState<T | ''>(
    defaultValue
  );

  const isControlled = controlledValue !== undefined;
  const displayValue = isControlled ? controlledValue : uncontrolledValue;

  React.useEffect(() => {
    if (!isControlled && defaultValue !== undefined) {
      setUncontrolledValue(defaultValue);
    }
  }, [isControlled, defaultValue]);

  const selectedOption = options.find((opt) => opt.value === displayValue);

  const handleSelect = (currentValue: T) => {
    const newValue = currentValue === displayValue ? '' : currentValue;
    if (!isControlled) setUncontrolledValue(newValue);
    onSelect?.(newValue);
    setOpen(false);
  };

  const isEmpty = !loading && options.length === 0;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn('w-[200px] justify-between', buttonClassName)}
          disabled={disabled}
        >
          {selectedOption ? selectedOption.label : placeholder}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className={cn(
          'w-(--radix-popover-trigger-width) min-w-[200px] p-0',
          className
        )}
        side="bottom"
        align="start"
        sideOffset={10}
        avoidCollisions={false}
        collisionPadding={0}
      >
        <Command>
          <CommandInput placeholder={searchPlaceholder} className="h-9" />
          <CommandList>
            {loading && (
              <CommandEmpty>
                <span className="text-muted-foreground text-xs">
                  {loadingMessage}
                </span>
              </CommandEmpty>
            )}

            {isEmpty && (
              <CommandEmpty>
                <span className="text-muted-foreground text-xs">
                  {emptyMessage}
                </span>
              </CommandEmpty>
            )}

            {!loading && options.length > 0 && (
              <CommandGroup>
                {options.map((opt) => {
                  const searchValue = opt.searchableText || opt.value;
                  return (
                    <CommandItem
                      key={opt.value}
                      value={searchValue}
                      onSelect={() => handleSelect(opt.value)}
                    >
                      {opt.renderLabel || opt.label}
                      <Check
                        className={cn(
                          'ml-auto',
                          displayValue === opt.value
                            ? 'opacity-100'
                            : 'opacity-0'
                        )}
                      />
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
