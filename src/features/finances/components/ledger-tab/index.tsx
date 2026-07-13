import { getRouteApi } from '@tanstack/react-router';
import { useMemo, useState } from 'react';
import { BookOpen, Plus, RefreshCw, Search, X } from 'lucide-react';

import { DatePickerInput } from '@/components/date-picker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Item, ItemActions, ItemContent, ItemMedia, ItemTitle } from '@/components/ui/item';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useLedgers } from '@/features/finances/api/use-ledgers';
import type { LedgerFilters, LedgerType } from '@/features/finances/types';
import { buildDateRangeFilters } from '@/features/finances/utils/date-filters';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { cn } from '@/lib/utils';

import { AddLedgerDialog } from './add-ledger-dialog';
import { LEDGER_TYPES } from './constants/ledger-options';
import { createLedgerColumns } from './columns';
import { DataTable } from './data-table';
import { DeleteLedgerDialog } from './delete-ledger-dialog';
import { EditLedgerDialog } from './edit-ledger-dialog';
import { LedgersError } from './ledgers-error';
import { LedgersSkeleton } from './ledgers-skeleton';
import type { Ledger } from './types';

const SEARCH_DEBOUNCE_MS = 300;

const financesRouteApi = getRouteApi('/_authenticated/finances/');

const LedgerTab = () => {
  const { period } = financesRouteApi.useSearch();
  const [search, setSearch] = useState('');
  const [addLedgerOpen, setAddLedgerOpen] = useState(false);
  const [editLedgerOpen, setEditLedgerOpen] = useState(false);
  const [ledgerToEdit, setLedgerToEdit] = useState<Ledger | null>(null);
  const [deleteLedgerOpen, setDeleteLedgerOpen] = useState(false);
  const [ledgerToDelete, setLedgerToDelete] = useState<Ledger | null>(null);
  const [fromDate, setFromDate] = useState<Date | undefined>();
  const [toDate, setToDate] = useState<Date | undefined>();
  const [typeDraft, setTypeDraft] = useState<LedgerType | ''>('');
  const [appliedFilters, setAppliedFilters] = useState<LedgerFilters>({});

  const debouncedSearch = useDebouncedValue(search, SEARCH_DEBOUNCE_MS);

  const queryFilters = useMemo<LedgerFilters>(() => {
    const trimmedSearch = debouncedSearch.trim();

    return {
      ...appliedFilters,
      ...(trimmedSearch ? { search: trimmedSearch } : {}),
    };
  }, [appliedFilters, debouncedSearch]);

  const { ledgers, isLoading, isFetching, isError, error, refetch } = useLedgers(queryFilters);

  const ledgerColumns = useMemo(
    () =>
      createLedgerColumns({
        period,
        onEdit: (ledger) => {
          setLedgerToEdit(ledger);
          setEditLedgerOpen(true);
        },
        onDelete: (ledger) => {
          setLedgerToDelete(ledger);
          setDeleteLedgerOpen(true);
        },
      }),
    [period],
  );

  const handleApplyFilters = () => {
    setAppliedFilters({
      ...buildDateRangeFilters(fromDate, toDate),
      ...(typeDraft ? { type: typeDraft } : {}),
    });
  };

  const handleResetFilters = () => {
    setFromDate(undefined);
    setToDate(undefined);
    setTypeDraft('');
    setAppliedFilters({});
  };

  const showInitialSkeleton = isLoading && ledgers.length === 0;
  const hasDraftFilters = Boolean(fromDate || toDate || typeDraft);
  const hasAppliedFilters = Boolean(
    appliedFilters.from || appliedFilters.to || appliedFilters.type,
  );

  return (
    <div className="flex w-full min-w-0 flex-col gap-4">
      <Item variant="outline" size="sm">
        <ItemMedia variant="icon">
          <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
            <BookOpen className="text-primary h-5 w-5" />
          </div>
        </ItemMedia>

        <ItemContent>
          <ItemTitle>
            {ledgers.length} ledger
            {ledgers.length === 1 ? '' : 's'}
          </ItemTitle>
        </ItemContent>

        <ItemActions>
          <Button
            variant="outline"
            size="sm"
            type="button"
            onClick={() => void refetch()}
            disabled={isFetching}
          >
            <RefreshCw className={cn('mr-2 h-4 w-4', isFetching && 'animate-spin')} />
            Refresh
          </Button>
        </ItemActions>
      </Item>

      <div className="bg-card text-card-foreground flex flex-col gap-3 rounded-xl border p-3 shadow-sm sm:gap-4 sm:p-4">
        <div className="relative w-full">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder="Search ledgers…"
            className="w-full pl-10"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <div className="border-border/60 flex flex-col gap-3 border-t pt-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
            <div className="grid min-w-0 grid-cols-2 gap-2 sm:flex sm:items-center">
              <DatePickerInput
                id="ledgers-from"
                placeholder="From"
                value={fromDate}
                onChange={setFromDate}
                className="min-w-0 sm:w-38"
              />

              <DatePickerInput
                id="ledgers-to"
                placeholder="To"
                value={toDate}
                onChange={setToDate}
                className="min-w-0 sm:w-38"
              />
            </div>

            <div className="min-w-0 sm:w-46">
              <Select
                value={typeDraft || 'all'}
                onValueChange={(value) =>
                  setTypeDraft(value === 'all' ? '' : (value as LedgerType))
                }
              >
                <SelectTrigger id="ledgers-type-filter" className="w-full">
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  {LEDGER_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                size="sm"
                className="min-w-18"
                onClick={handleApplyFilters}
                disabled={!hasDraftFilters && !hasAppliedFilters}
              >
                Apply
              </Button>
              {(hasDraftFilters || hasAppliedFilters) && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground"
                  onClick={handleResetFilters}
                >
                  <X className="h-4 w-4 sm:mr-1" />
                  <span className="hidden sm:inline">Reset</span>
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:flex sm:shrink-0 sm:flex-row">
            <Button
              type="button"
              className="min-w-0 px-2.5 sm:px-3"
              onClick={() => setAddLedgerOpen(true)}
            >
              <Plus className="h-4 w-4 shrink-0 sm:mr-2" />
              <span className="truncate">Add Ledger</span>
            </Button>
          </div>
        </div>
      </div>

      {showInitialSkeleton ? (
        <LedgersSkeleton />
      ) : isError ? (
        <LedgersError error={error} onRetry={() => void refetch()} isRetrying={isFetching} />
      ) : (
        <DataTable columns={ledgerColumns} data={ledgers} />
      )}

      <AddLedgerDialog open={addLedgerOpen} onOpenChange={setAddLedgerOpen} />

      {ledgerToEdit && (
        <EditLedgerDialog
          open={editLedgerOpen}
          onOpenChange={setEditLedgerOpen}
          ledger={ledgerToEdit}
        />
      )}

      {ledgerToDelete && (
        <DeleteLedgerDialog
          open={deleteLedgerOpen}
          onOpenChange={setDeleteLedgerOpen}
          ledger={ledgerToDelete}
        />
      )}
    </div>
  );
};

export default LedgerTab;
