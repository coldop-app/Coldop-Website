import type { RefObject } from 'react';

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
} from '@/components/ui/combobox';
import { InputGroup } from '@/components/ui/input-group';
import { cn } from '@/lib/utils';

export type ComboboxOption = {
  id: string;
  label: string;
};

export type SearchableOptionComboboxProps = {
  id: string;
  name: string;
  value: string;
  onValueChange: (value: string) => void;
  onBlur: () => void;
  isInvalid: boolean;
  placeholder: string;
  popupSearchPlaceholder?: string;
  emptyMessage: string;
  options: ComboboxOption[];
  sortedOptions: ComboboxOption[];
  search: string;
  setSearch: (value: string) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
  portalContainer?: RefObject<HTMLElement | null>;
  disabled?: boolean;
};

// eslint-disable-next-line react-refresh/only-export-components
export function filterAndSortOptions(query: string, options: ComboboxOption[]): ComboboxOption[] {
  const normalized = query.trim().toLowerCase();

  if (!normalized) {
    return options;
  }

  const filtered = options.filter((option) => option.label.toLowerCase().includes(normalized));

  return filtered.sort((a, b) => {
    const aStarts = a.label.toLowerCase().startsWith(normalized);
    const bStarts = b.label.toLowerCase().startsWith(normalized);
    if (aStarts && !bStarts) return -1;
    if (!aStarts && bStarts) return 1;
    return a.label.localeCompare(b.label);
  });
}

export function SearchableOptionCombobox({
  id,
  name,
  value,
  onValueChange,
  onBlur,
  isInvalid,
  placeholder,
  popupSearchPlaceholder,
  emptyMessage,
  options,
  sortedOptions,
  search,
  setSearch,
  open,
  setOpen,
  portalContainer,
  disabled = false,
}: SearchableOptionComboboxProps) {
  const selected = options.find((option) => option.id === value) ?? null;
  const popupPlaceholder = popupSearchPlaceholder ?? placeholder;

  return (
    <Combobox
      items={sortedOptions}
      itemToStringValue={(option) => option.label}
      value={selected}
      inputValue={search}
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (nextOpen) {
          setSearch('');
        }
      }}
      disabled={disabled}
      autoHighlight={'always' as unknown as boolean}
      onInputValueChange={(inputValue) => {
        setSearch(inputValue);
      }}
      onValueChange={(val) => {
        onValueChange(val ? val.id : '');
        setSearch('');
        setOpen(false);
      }}
    >
      <InputGroup className="w-full">
        <ComboboxTrigger
          id={id}
          name={name}
          aria-invalid={isInvalid}
          onBlur={onBlur}
          disabled={disabled}
          className={cn(
            'focus-visible:border-ring focus-visible:ring-ring/30 flex h-9 min-h-9 w-full min-w-0 flex-1 cursor-default items-center justify-between gap-2 rounded-4xl border border-transparent bg-transparent px-3 py-0 text-left text-sm font-normal shadow-none focus-visible:ring-3',
            !selected && 'text-muted-foreground',
          )}
        >
          <span className="min-w-0 flex-1 truncate">{selected?.label ?? placeholder}</span>
        </ComboboxTrigger>
      </InputGroup>
      <ComboboxContent container={portalContainer}>
        <ComboboxInput
          showTrigger={false}
          placeholder={popupPlaceholder}
          aria-label={popupPlaceholder}
        />
        <ComboboxEmpty>{emptyMessage}</ComboboxEmpty>
        <ComboboxList>
          {(option) => (
            <ComboboxItem key={option.id} value={option}>
              {option.label}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
