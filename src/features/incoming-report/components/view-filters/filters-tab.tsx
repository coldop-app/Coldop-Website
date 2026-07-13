import { useMemo, useState } from 'react';
import type { Column, ColumnFiltersState, RowData, Table } from '@tanstack/react-table';
import { ChevronDown, Search, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  getReportFilterValueKey,
  type SelectedValuesFilterValue,
} from '@/features/incoming-report/utils/report-filter-fns';

type FilterOption = {
  key: string;
  label: string;
  count: number;
  isBlank: boolean;
};

interface FiltersTabProps<TData extends RowData> {
  table: Table<TData>;
  draftColumnFilters: ColumnFiltersState;
  onDraftColumnFiltersChange: (filters: ColumnFiltersState) => void;
}

interface ColumnFilterSectionProps<TData extends RowData> {
  column: Column<TData, unknown>;
  isOpen: boolean;
  draftColumnFilters: ColumnFiltersState;
  searchQuery: string;
  onToggleOpen: () => void;
  onSearchChange: (value: string) => void;
  onDraftColumnFiltersChange: (filters: ColumnFiltersState) => void;
}

function getColumnLabel<TData extends RowData>(column: Column<TData, unknown>): string {
  return column.columnDef.meta?.filterLabel ?? column.id;
}

function getDraftSelectedKeys(
  columnId: string,
  draftColumnFilters: ColumnFiltersState,
): Set<string> | null {
  const filterValue = draftColumnFilters.find((filter) => filter.id === columnId)?.value;

  if (!Array.isArray(filterValue)) return null;

  return new Set(filterValue.map(String));
}

function setDraftFilterValue(
  draftColumnFilters: ColumnFiltersState,
  columnId: string,
  value: SelectedValuesFilterValue | null,
): ColumnFiltersState {
  const remainingFilters = draftColumnFilters.filter((filter) => filter.id !== columnId);

  if (value === null) return remainingFilters;

  return [...remainingFilters, { id: columnId, value }];
}

function getFilterSummary(selectedCount: number, totalCount: number): string {
  if (totalCount === 0) return 'No values';
  if (selectedCount === totalCount) return 'All';
  if (selectedCount === 0) return 'None';

  return `${selectedCount.toLocaleString('en-IN')} selected`;
}

function ColumnFilterSection<TData extends RowData>({
  column,
  isOpen,
  draftColumnFilters,
  searchQuery,
  onToggleOpen,
  onSearchChange,
  onDraftColumnFiltersChange,
}: ColumnFilterSectionProps<TData>) {
  const columnLabel = getColumnLabel(column);
  const normalizedSearch = searchQuery.trim().toLowerCase();
  const selectedKeys = getDraftSelectedKeys(column.id, draftColumnFilters);
  const formatter = column.columnDef.meta?.filterValueFormatter;
  const options: FilterOption[] = Array.from(column.getFacetedUniqueValues().entries())
    .map(([value, count]) => {
      const rawLabel = formatter?.(value) ?? String(value ?? '');
      const isBlank = value == null || value === '' || rawLabel === '';

      return {
        key: getReportFilterValueKey(value),
        label: isBlank ? 'Blank' : rawLabel,
        count,
        isBlank,
      };
    })
    .sort((a, b) =>
      a.label.localeCompare(b.label, 'en-IN', {
        numeric: true,
        sensitivity: 'base',
      }),
    );
  const optionKeys = options.map((option) => option.key);
  const selectedCount =
    selectedKeys == null
      ? options.length
      : options.filter((option) => selectedKeys.has(option.key)).length;
  const visibleOptions =
    normalizedSearch.length === 0
      ? options
      : options.filter((option) => option.label.toLowerCase().includes(normalizedSearch));
  const allVisibleValuesSelected = options.length > 0 && selectedCount === options.length;
  const summary = getFilterSummary(selectedCount, options.length);

  const commitSelection = (nextSelectedKeys: Set<string>) => {
    const nextValue = optionKeys.filter((key) => nextSelectedKeys.has(key));

    onDraftColumnFiltersChange(
      setDraftFilterValue(
        draftColumnFilters,
        column.id,
        nextValue.length === optionKeys.length ? null : nextValue,
      ),
    );
  };

  const handleOptionChange = (optionKey: string, checked: boolean) => {
    const nextSelectedKeys = new Set(selectedKeys ?? optionKeys);

    if (checked) {
      nextSelectedKeys.add(optionKey);
    } else {
      nextSelectedKeys.delete(optionKey);
    }

    commitSelection(nextSelectedKeys);
  };

  const handleSelectAll = () => {
    onDraftColumnFiltersChange(setDraftFilterValue(draftColumnFilters, column.id, null));
  };

  const handleDeselectAll = () => {
    onDraftColumnFiltersChange(setDraftFilterValue(draftColumnFilters, column.id, []));
  };

  return (
    <section className="border-border bg-card overflow-hidden rounded-xl border">
      <button
        type="button"
        className="hover:bg-muted/40 focus-visible:ring-ring/30 flex min-h-14 w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors focus-visible:ring-2 focus-visible:outline-none"
        aria-expanded={isOpen}
        onClick={onToggleOpen}
      >
        <span className="min-w-0">
          <span className="text-foreground block truncate text-sm font-semibold">
            {columnLabel}
          </span>
        </span>
        <span className="flex shrink-0 items-center gap-2">
          <span className="text-muted-foreground text-xs font-medium">{summary}</span>
          <ChevronDown
            className={cn(
              'text-muted-foreground size-4 transition-transform',
              isOpen && 'rotate-180',
            )}
            aria-hidden
          />
        </span>
      </button>

      {isOpen ? (
        <div className="border-border border-t">
          <div className="border-border relative border-b">
            <Search
              className="text-muted-foreground pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2"
              aria-hidden
            />
            <Input
              type="search"
              value={searchQuery}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder={`Search ${columnLabel.toLowerCase()}...`}
              className="bg-background h-11 rounded-none border-0 pr-10 pl-10 focus-visible:ring-0"
              aria-label={`Search ${columnLabel} filter values`}
            />
            {searchQuery ? (
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                className="absolute top-1/2 right-3 -translate-y-1/2"
                aria-label={`Clear ${columnLabel} search`}
                onClick={() => onSearchChange('')}
              >
                <X className="size-3.5" aria-hidden />
              </Button>
            ) : null}
          </div>

          <div className="max-h-72 overflow-y-auto py-1">
            {visibleOptions.length > 0 ? (
              visibleOptions.map((option, index) => {
                const optionId = `${column.id}-filter-${index}`;
                const checked = selectedKeys == null || selectedKeys.has(option.key);

                return (
                  <label
                    key={`${option.key}-${index}`}
                    htmlFor={optionId}
                    className="text-foreground hover:bg-muted/40 flex min-h-11 cursor-pointer items-center gap-3 px-4 py-2 text-sm transition-colors"
                  >
                    <Checkbox
                      id={optionId}
                      checked={checked}
                      onCheckedChange={(value) => handleOptionChange(option.key, value === true)}
                      aria-label={`${checked ? 'Remove' : 'Add'} ${option.label} ${columnLabel} filter`}
                    />
                    <span
                      className={cn(
                        'min-w-0 flex-1 truncate',
                        option.isBlank && 'text-muted-foreground',
                      )}
                      title={option.label}
                    >
                      {option.label}
                    </span>
                    <span className="text-muted-foreground shrink-0 text-xs tabular-nums">
                      {option.count.toLocaleString('en-IN')}
                    </span>
                  </label>
                );
              })
            ) : (
              <p className="text-muted-foreground px-4 py-6 text-center text-sm">
                No values match this search.
              </p>
            )}
          </div>

          <div className="border-border bg-muted/20 flex items-center justify-between gap-3 border-t px-4 py-3">
            <p className="text-muted-foreground min-w-0 truncate text-sm">
              <span className="tabular-nums">
                {selectedCount.toLocaleString('en-IN')} of {options.length.toLocaleString('en-IN')}
              </span>{' '}
              selected
            </p>
            {allVisibleValuesSelected ? (
              <Button
                type="button"
                variant="link"
                size="sm"
                className="text-primary h-auto shrink-0 px-0"
                disabled={options.length === 0}
                onClick={handleDeselectAll}
              >
                Deselect all
              </Button>
            ) : (
              <Button
                type="button"
                variant="link"
                size="sm"
                className="text-primary h-auto shrink-0 px-0"
                disabled={options.length === 0}
                onClick={handleSelectAll}
              >
                Select all
              </Button>
            )}
          </div>
        </div>
      ) : null}
    </section>
  );
}

const FiltersTab = <TData extends RowData>({
  table,
  draftColumnFilters,
  onDraftColumnFiltersChange,
}: FiltersTabProps<TData>) => {
  const filterableColumns = useMemo(
    () => table.getAllLeafColumns().filter((column) => column.getCanFilter()),
    [table],
  );
  const [openColumnId, setOpenColumnId] = useState<string | null>(filterableColumns[0]?.id ?? null);
  const [searchQueries, setSearchQueries] = useState<Record<string, string>>({});

  if (filterableColumns.length === 0) {
    return (
      <div className="border-border bg-muted/20 rounded-xl border border-dashed px-4 py-8 text-center">
        <p className="text-foreground text-sm font-medium">No filterable columns</p>
        <p className="text-muted-foreground mt-1 text-sm">
          This incoming report does not expose any column filters yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 pt-4">
      <div className="space-y-1">
        <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
          Column filters
        </p>
        <p className="text-muted-foreground text-sm">
          Choose the incoming report values to keep in each column, then apply changes.
        </p>
      </div>

      <div className="space-y-2">
        {filterableColumns.map((column) => (
          <ColumnFilterSection
            key={column.id}
            column={column}
            isOpen={openColumnId === column.id}
            draftColumnFilters={draftColumnFilters}
            searchQuery={searchQueries[column.id] ?? ''}
            onToggleOpen={() =>
              setOpenColumnId((current) => (current === column.id ? null : column.id))
            }
            onSearchChange={(value) =>
              setSearchQueries((current) => ({
                ...current,
                [column.id]: value,
              }))
            }
            onDraftColumnFiltersChange={onDraftColumnFiltersChange}
          />
        ))}
      </div>
    </div>
  );
};

export default FiltersTab;
