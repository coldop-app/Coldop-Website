import { useMemo, useState } from 'react';
import { Plus, Receipt, RefreshCw, Search, Wallet, X } from 'lucide-react';

import { DatePickerInput } from '@/components/date-picker';
import {
  filterAndSortOptions,
  SearchableOptionCombobox,
} from '@/components/searchable-option-combobox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Item, ItemActions, ItemContent, ItemMedia, ItemTitle } from '@/components/ui/item';
import { useLedgers } from '@/features/finances/api/use-ledgers';
import { useVouchers } from '@/features/finances/api/use-vouchers';
import type { VoucherFilters } from '@/features/finances/types';
import { buildDateRangeFilters } from '@/features/finances/utils/date-filters';
import { isCashOrBankLedger, mapLedgersToComboboxOptions } from '@/features/finances/utils/ledger-options';
import { cn } from '@/lib/utils';

import { AddVoucherDialog } from './add-voucher-dialog';
import { createVoucherColumns } from './columns';
import { DataTable } from './data-table';
import { DeleteVoucherDialog } from './delete-voucher-dialog';
import { EditVoucherDialog } from './edit-voucher-dialog';
import type { Voucher } from './types';
import { VouchersError } from './vouchers-error';
import { VouchersSkeleton } from './vouchers-skeleton';

type ComboboxUiState = {
  search: string;
  open: boolean;
};

type VoucherDialogMode = 'add' | 'general-expense';

const emptyComboboxState = (): ComboboxUiState => ({
  search: '',
  open: false,
});

const VoucherTab = () => {
  const [search, setSearch] = useState('');
  const [voucherDialogMode, setVoucherDialogMode] = useState<VoucherDialogMode | null>(null);
  const [editVoucherOpen, setEditVoucherOpen] = useState(false);
  const [voucherToEdit, setVoucherToEdit] = useState<Voucher | null>(null);
  const [deleteVoucherOpen, setDeleteVoucherOpen] = useState(false);
  const [voucherToDelete, setVoucherToDelete] = useState<Voucher | null>(null);
  const [fromDate, setFromDate] = useState<Date | undefined>();
  const [toDate, setToDate] = useState<Date | undefined>();
  const [ledgerIdDraft, setLedgerIdDraft] = useState('');
  const [ledgerCombobox, setLedgerCombobox] = useState(emptyComboboxState);
  const [appliedFilters, setAppliedFilters] = useState<VoucherFilters>({});

  const { ledgers } = useLedgers();
  const { vouchers, isLoading, isFetching, isError, error, refetch } = useVouchers(appliedFilters);

  const ledgerFilterOptions = useMemo(() => mapLedgersToComboboxOptions(ledgers), [ledgers]);

  const generalExpenseDebitOptions = useMemo(
    () => mapLedgersToComboboxOptions(ledgers.filter((ledger) => ledger.type === 'Expense')),
    [ledgers],
  );

  const generalExpenseCreditOptions = useMemo(
    () => mapLedgersToComboboxOptions(ledgers.filter(isCashOrBankLedger)),
    [ledgers],
  );

  const sortedLedgerOptions = useMemo(
    () => filterAndSortOptions(ledgerCombobox.search, ledgerFilterOptions),
    [ledgerCombobox.search, ledgerFilterOptions],
  );

  const isGeneralExpenseDialog = voucherDialogMode === 'general-expense';
  const voucherDialogDebitOptions = isGeneralExpenseDialog
    ? generalExpenseDebitOptions
    : ledgerFilterOptions;
  const voucherDialogCreditOptions = isGeneralExpenseDialog
    ? generalExpenseCreditOptions
    : ledgerFilterOptions;

  const voucherColumns = useMemo(
    () =>
      createVoucherColumns({
        onEdit: (voucher) => {
          setVoucherToEdit(voucher);
          setEditVoucherOpen(true);
        },
        onDelete: (voucher) => {
          setVoucherToDelete(voucher);
          setDeleteVoucherOpen(true);
        },
      }),
    [],
  );

  const handleEditVoucherOpenChange = (open: boolean) => {
    setEditVoucherOpen(open);
    if (!open) {
      setVoucherToEdit(null);
    }
  };

  const handleDeleteVoucherOpenChange = (open: boolean) => {
    setDeleteVoucherOpen(open);
    if (!open) {
      setVoucherToDelete(null);
    }
  };

  const handleApplyFilters = () => {
    setAppliedFilters({
      ...buildDateRangeFilters(fromDate, toDate),
      ...(ledgerIdDraft ? { ledgerId: ledgerIdDraft } : {}),
    });
  };

  const handleResetFilters = () => {
    setFromDate(undefined);
    setToDate(undefined);
    setLedgerIdDraft('');
    setLedgerCombobox(emptyComboboxState());
    setAppliedFilters({});
  };

  const showInitialSkeleton = isLoading && vouchers.length === 0;
  const hasDraftFilters = Boolean(fromDate || toDate || ledgerIdDraft);
  const hasAppliedFilters = Boolean(
    appliedFilters.from || appliedFilters.to || appliedFilters.ledgerId,
  );

  return (
    <div className="flex w-full min-w-0 flex-col gap-4">
      <Item variant="outline" size="sm">
        <ItemMedia variant="icon">
          <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
            <Receipt className="text-primary h-5 w-5" />
          </div>
        </ItemMedia>

        <ItemContent>
          <ItemTitle>
            {vouchers.length} voucher
            {vouchers.length === 1 ? '' : 's'}
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
            placeholder="Search vouchers…"
            className="w-full pl-10"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <div className="border-border/60 flex flex-col gap-3 border-t pt-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
            <div className="grid min-w-0 grid-cols-2 gap-2 sm:flex sm:items-center">
              <DatePickerInput
                id="vouchers-from"
                placeholder="From"
                value={fromDate}
                onChange={setFromDate}
                className="min-w-0 sm:w-38"
              />

              <DatePickerInput
                id="vouchers-to"
                placeholder="To"
                value={toDate}
                onChange={setToDate}
                className="min-w-0 sm:w-38"
              />
            </div>

            <div className="min-w-0 sm:w-46">
              <SearchableOptionCombobox
                id="vouchers-ledger-filter"
                name="ledgerFilter"
                value={ledgerIdDraft}
                onValueChange={setLedgerIdDraft}
                onBlur={() => {}}
                isInvalid={false}
                placeholder="All ledgers"
                emptyMessage={
                  ledgerFilterOptions.length === 0 ? 'No ledgers available.' : 'No ledgers found.'
                }
                options={ledgerFilterOptions}
                sortedOptions={sortedLedgerOptions}
                search={ledgerCombobox.search}
                setSearch={(search) => setLedgerCombobox((current) => ({ ...current, search }))}
                open={ledgerCombobox.open}
                setOpen={(open) => setLedgerCombobox((current) => ({ ...current, open }))}
              />
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

          <div className="grid grid-cols-2 gap-2 sm:flex sm:shrink-0 sm:flex-row">
            <Button
              type="button"
              className="min-w-0 px-2.5 sm:px-3"
              onClick={() => setVoucherDialogMode('add')}
            >
              <Plus className="h-4 w-4 shrink-0 sm:mr-2" />
              <span className="truncate">Add New</span>
            </Button>

            <Button
              type="button"
              variant="secondary"
              className="min-w-0 px-2.5 sm:px-3"
              onClick={() => setVoucherDialogMode('general-expense')}
            >
              <Wallet className="h-4 w-4 shrink-0 sm:mr-2" />
              <span className="truncate">General Expense</span>
            </Button>
          </div>
        </div>
      </div>

      {showInitialSkeleton ? (
        <VouchersSkeleton />
      ) : isError ? (
        <VouchersError error={error} onRetry={() => void refetch()} isRetrying={isFetching} />
      ) : (
        <DataTable columns={voucherColumns} data={vouchers} search={search} />
      )}

      <AddVoucherDialog
        open={voucherDialogMode !== null}
        onOpenChange={(open) => {
          if (!open) {
            setVoucherDialogMode(null);
          }
        }}
        debitLedgerOptions={voucherDialogDebitOptions}
        creditLedgerOptions={voucherDialogCreditOptions}
        title={isGeneralExpenseDialog ? 'General Expense' : 'Add Voucher'}
        description={
          isGeneralExpenseDialog
            ? 'Record an expense paid from cash or bank.'
            : 'Record a debit and credit entry with amount and narration.'
        }
        submitLabel={isGeneralExpenseDialog ? 'Add Expense' : 'Add Voucher'}
      />

      {voucherToEdit ? (
        <EditVoucherDialog
          key={voucherToEdit.id}
          open={editVoucherOpen}
          onOpenChange={handleEditVoucherOpenChange}
          voucher={voucherToEdit}
          ledgerOptions={ledgerFilterOptions}
        />
      ) : null}

      {voucherToDelete ? (
        <DeleteVoucherDialog
          key={voucherToDelete.id}
          open={deleteVoucherOpen}
          onOpenChange={handleDeleteVoucherOpenChange}
          voucher={voucherToDelete}
        />
      ) : null}
    </div>
  );
};

export default VoucherTab;
