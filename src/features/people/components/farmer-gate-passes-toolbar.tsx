import { useState } from 'react';
import { Search } from 'lucide-react';

import { DatePickerInput } from '@/components/date-picker';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DAYBOOK_SEARCH_BY_OPTIONS,
  getSearchPlaceholder,
  type DaybookSearchBy,
  type DaybookSortBy,
  type DaybookType,
} from '@/features/daybook/search';
import { formatDateParam, parseDateParam } from '@/features/people/search';

type FarmerGatePassesToolbarProps = {
  searchQuery: string;
  searchBy: DaybookSearchBy;
  onSearchQueryChange: (value: string) => void;
  onSearchByChange: (value: DaybookSearchBy) => void;
  appliedFrom?: string;
  appliedTo?: string;
  onApplyDates: (from?: string, to?: string) => void;
  onResetDates: () => void;
  type: DaybookType;
  sortBy: DaybookSortBy;
  onTypeChange: (value: DaybookType) => void;
  onSortChange: (value: DaybookSortBy) => void;
};

type FarmerGatePassDateFiltersProps = {
  from?: string;
  to?: string;
  onApply: (from?: string, to?: string) => void;
  onReset: () => void;
};

function FarmerGatePassDateFilters({ from, to, onApply, onReset }: FarmerGatePassDateFiltersProps) {
  const [fromDate, setFromDate] = useState<Date | undefined>(() => parseDateParam(from));
  const [toDate, setToDate] = useState<Date | undefined>(() => parseDateParam(to));

  const hasDraftDates = Boolean(fromDate || toDate);
  const hasAppliedDates = Boolean(from || to);

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
      <div className="grid min-w-0 grid-cols-2 gap-2 sm:flex sm:items-center">
        <DatePickerInput
          id="farmer-gate-passes-from"
          placeholder="From date"
          value={fromDate}
          onChange={setFromDate}
          className="min-w-0 sm:w-36"
        />

        <DatePickerInput
          id="farmer-gate-passes-to"
          placeholder="To date"
          value={toDate}
          onChange={setToDate}
          className="min-w-0 sm:w-36"
        />
      </div>

      <div className="flex gap-2">
        <Button
          type="button"
          size="sm"
          className="min-h-9 flex-1 sm:flex-none"
          onClick={() =>
            onApply(
              fromDate ? formatDateParam(fromDate) : undefined,
              toDate ? formatDateParam(toDate) : undefined,
            )
          }
          disabled={!hasDraftDates && !hasAppliedDates}
        >
          Apply dates
        </Button>
        {(hasDraftDates || hasAppliedDates) && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="min-h-9 flex-1 sm:flex-none"
            onClick={onReset}
          >
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}

function formatAppliedDateLabel(value?: string): string | null {
  if (!value) return null;

  const date = parseDateParam(value);
  if (!date) return value;

  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export function FarmerGatePassesToolbar({
  searchQuery,
  searchBy,
  onSearchQueryChange,
  onSearchByChange,
  appliedFrom,
  appliedTo,
  onApplyDates,
  onResetDates,
  type,
  sortBy,
  onTypeChange,
  onSortChange,
}: FarmerGatePassesToolbarProps) {
  const fromLabel = formatAppliedDateLabel(appliedFrom);
  const toLabel = formatAppliedDateLabel(appliedTo);
  const hasActiveDates = Boolean(fromLabel || toLabel);

  return (
    <div className="border-border bg-card text-card-foreground overflow-hidden rounded-xl border shadow-sm">
      <div className="p-3 sm:p-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="min-w-0 sm:w-44 sm:shrink-0">
            <Select value={searchBy} onValueChange={onSearchByChange}>
              <SelectTrigger className="w-full min-w-0">
                <SelectValue placeholder="Search by" />
              </SelectTrigger>

              <SelectContent>
                {DAYBOOK_SEARCH_BY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="relative min-w-0 flex-1">
            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />

            <Input
              placeholder={getSearchPlaceholder(searchBy)}
              className="w-full pl-10"
              inputMode="search"
              value={searchQuery}
              onChange={(event) => onSearchQueryChange(event.target.value)}
            />
          </div>
        </div>
      </div>

      <Separator />

      <div className="bg-muted/20 space-y-3 p-3 sm:space-y-4 sm:p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1">
            <FarmerGatePassDateFilters
              key={`${appliedFrom ?? ''}-${appliedTo ?? ''}`}
              from={appliedFrom}
              to={appliedTo}
              onApply={onApplyDates}
              onReset={onResetDates}
            />
          </div>

          <div className="grid min-w-0 grid-cols-2 gap-2 sm:w-auto sm:grid-cols-2 lg:shrink-0">
            <Select value={sortBy} onValueChange={onSortChange}>
              <SelectTrigger className="w-full min-w-0">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="latest">Newest first</SelectItem>
                <SelectItem value="oldest">Oldest first</SelectItem>
              </SelectContent>
            </Select>

            <Select value={type} onValueChange={onTypeChange}>
              <SelectTrigger className="w-full min-w-0">
                <SelectValue placeholder="Type" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                <SelectItem value="incoming">Incoming</SelectItem>
                <SelectItem value="outgoing">Outgoing</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {hasActiveDates ? (
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-muted-foreground text-xs">Active range:</span>
            {fromLabel ? (
              <Badge variant="outline" className="font-normal tabular-nums">
                From {fromLabel}
              </Badge>
            ) : null}
            {toLabel ? (
              <Badge variant="outline" className="font-normal tabular-nums">
                To {toLabel}
              </Badge>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function FarmerGatePassesToolbarSkeleton() {
  return (
    <div className="border-border bg-card overflow-hidden rounded-xl border shadow-sm">
      <div className="p-3 sm:p-4">
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="bg-muted h-9 w-full rounded-md sm:w-44" />
          <div className="bg-muted h-9 min-w-0 flex-1 rounded-md" />
        </div>
      </div>

      <Separator />

      <div className="bg-muted/20 p-3 sm:p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:justify-between">
          <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:flex-wrap">
            <div className="grid grid-cols-2 gap-2 sm:flex">
              <div className="bg-muted h-9 w-full rounded-md sm:w-36" />
              <div className="bg-muted h-9 w-full rounded-md sm:w-36" />
            </div>
            <div className="flex gap-2">
              <div className="bg-muted h-9 flex-1 rounded-md sm:w-24 sm:flex-none" />
              <div className="bg-muted h-9 flex-1 rounded-md sm:w-20 sm:flex-none" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:w-72">
            <div className="bg-muted h-9 rounded-md" />
            <div className="bg-muted h-9 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
}
