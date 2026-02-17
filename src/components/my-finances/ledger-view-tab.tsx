import { memo, useState, useEffect, useMemo } from 'react';
import {
  useGetAllLedgers,
  type Ledger,
} from '@/services/accounting/ledgers/useGetAllLedgers';
import {
  useGetAllVouchers,
  type Voucher,
  type VoucherLedgerRef,
} from '@/services/accounting/vouchers/useGetAllVouchers';
import { formatDate } from '@/lib/helpers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  SearchSelector,
  type Option,
} from '@/components/forms/search-selector';
import { Skeleton } from '@/components/ui/skeleton';

/* ------------------------------------------------------------------ */
/* Helpers */
/* ------------------------------------------------------------------ */

function getLedgerName(ledgerRef: VoucherLedgerRef): string {
  return ledgerRef.name;
}

interface LedgerEntry {
  date: string;
  amount: number;
  narration?: string | null;
  debitLedger: VoucherLedgerRef;
  creditLedger: VoucherLedgerRef;
}

function getLedgerEntries(
  selectedLedgerId: string | null,
  ledgers: Ledger[],
  vouchers: Voucher[]
): {
  debitEntries: LedgerEntry[];
  creditEntries: LedgerEntry[];
  ledger: Ledger | null;
} {
  if (!selectedLedgerId) {
    return { debitEntries: [], creditEntries: [], ledger: null };
  }

  const ledger = ledgers.find((l) => l._id === selectedLedgerId);
  if (!ledger) {
    return { debitEntries: [], creditEntries: [], ledger: null };
  }

  const debitEntries: LedgerEntry[] = [];
  const creditEntries: LedgerEntry[] = [];

  vouchers.forEach((voucher) => {
    if (voucher.debitLedger._id === selectedLedgerId) {
      debitEntries.push({
        date: voucher.date,
        amount: voucher.amount,
        narration: voucher.narration,
        debitLedger: voucher.debitLedger,
        creditLedger: voucher.creditLedger,
      });
    }
    if (voucher.creditLedger._id === selectedLedgerId) {
      creditEntries.push({
        date: voucher.date,
        amount: voucher.amount,
        narration: voucher.narration,
        debitLedger: voucher.debitLedger,
        creditLedger: voucher.creditLedger,
      });
    }
  });

  return { debitEntries, creditEntries, ledger };
}

function computeEntriesWithBalance(
  allEntries: Array<{
    date: string;
    amount: number;
    narration?: string | null;
    debitLedger: VoucherLedgerRef;
    creditLedger: VoucherLedgerRef;
    isDebit: boolean;
    type: 'D' | 'C';
  }>,
  ledgerType: Ledger['type'],
  openingBalance: number
): Array<{
  date: string;
  amount: number;
  narration?: string | null;
  debitLedger: VoucherLedgerRef;
  creditLedger: VoucherLedgerRef;
  isDebit: boolean;
  type: 'D' | 'C';
  runningBalance: number;
}> {
  let running = openingBalance;
  return allEntries.map((entry) => {
    if (entry.isDebit) {
      if (['Asset', 'Expense'].includes(ledgerType)) {
        running += entry.amount;
      } else {
        running -= entry.amount;
      }
    } else {
      if (['Liability', 'Income', 'Equity'].includes(ledgerType)) {
        running += entry.amount;
      } else {
        running -= entry.amount;
      }
    }
    return { ...entry, runningBalance: running };
  });
}

function formatAmount(value: number): string {
  return value.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/* ------------------------------------------------------------------ */
/* Component */
/* ------------------------------------------------------------------ */

export interface LedgerViewTabProps {
  initialFarmerStorageLinkId?: string;
  initialFarmerName?: string;
}

const LedgerViewTab = memo(function LedgerViewTab({
  initialFarmerStorageLinkId,
  initialFarmerName,
}: LedgerViewTabProps = {}) {
  const [selectedLedgerId, setSelectedLedgerId] = useState<string>('');
  const [hasAppliedInitial, setHasAppliedInitial] = useState(false);

  const { data: ledgers = [], isLoading: ledgersLoading } = useGetAllLedgers();
  const { data: vouchers = [], isLoading: vouchersLoading } =
    useGetAllVouchers();

  useEffect(() => {
    const handleViewLedger = (event: Event) => {
      const customEvent = event as CustomEvent<string>;
      const ledgerId = customEvent.detail;
      if (ledgerId && typeof ledgerId === 'string') {
        setSelectedLedgerId(ledgerId);
      }
    };

    window.addEventListener('viewLedger', handleViewLedger);
    return () => window.removeEventListener('viewLedger', handleViewLedger);
  }, []);

  useEffect(() => {
    if (hasAppliedInitial || ledgers.length === 0) return;
    if (!initialFarmerStorageLinkId && !initialFarmerName) return;

    const match =
      initialFarmerStorageLinkId
        ? ledgers.find(
            (l) => l.farmerStorageLinkId === initialFarmerStorageLinkId
          )
        : initialFarmerName
          ? ledgers.find(
              (l) =>
                l.name === initialFarmerName ||
                l.name.toLowerCase() === initialFarmerName.toLowerCase()
            )
          : null;

    if (match) {
      setSelectedLedgerId(match._id);
    }
    setHasAppliedInitial(true);
  }, [
    ledgers,
    initialFarmerStorageLinkId,
    initialFarmerName,
    hasAppliedInitial,
  ]);

  const ledgerOptions: Option<string>[] = useMemo(
    () =>
      ledgers.map((l) => ({
        value: l._id,
        label: `${l.name} (${l.type})`,
        searchableText: `${l.name} ${l.type}`,
      })),
    [ledgers]
  );

  const derived = useMemo(() => {
    const {
      debitEntries: debits,
      creditEntries: credits,
      ledger: l,
    } = getLedgerEntries(selectedLedgerId || null, ledgers, vouchers);
    if (!l) {
      return {
        ledger: null as Ledger | null,
        balance: 0,
        isDebitBalance: false,
        entriesWithBalance: [] as ReturnType<typeof computeEntriesWithBalance>,
        openingBalance: 0,
        hasOpeningBalance: false,
        hasNoData: true,
      };
    }
    const allEntries = [
      ...debits.map((e) => ({ ...e, isDebit: true, type: 'D' as const })),
      ...credits.map((e) => ({ ...e, isDebit: false, type: 'C' as const })),
    ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const entriesWithBalance = computeEntriesWithBalance(
      allEntries,
      l.type,
      l.openingBalance ?? 0
    );
    const balance =
      l.name === 'Stock in Hand' &&
      l.category === 'Stock in Hand' &&
      l.closingBalance != null
        ? l.closingBalance
        : (l.balance ?? l.closingBalance ?? 0);
    const isDebitBalance = ['Asset', 'Expense'].includes(l.type)
      ? balance >= 0
      : balance < 0;
    const openingBalance = l.openingBalance ?? 0;
    return {
      ledger: l,
      balance,
      isDebitBalance,
      entriesWithBalance,
      openingBalance,
      hasOpeningBalance: openingBalance !== 0,
      hasNoData: allEntries.length === 0 && openingBalance === 0,
    };
  }, [selectedLedgerId, ledgers, vouchers]);

  const isLoading = ledgersLoading || vouchersLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card className="border-border/50">
          <CardHeader>
            <Skeleton className="h-5 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-10 w-full max-w-md" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!selectedLedgerId) {
    return (
      <div className="space-y-6">
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="font-custom text-xl font-semibold">
              Select Ledger to View
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SearchSelector<string>
              options={ledgerOptions}
              placeholder="Select a Ledger"
              value={selectedLedgerId}
              onSelect={(v) => setSelectedLedgerId(v || '')}
              className="w-full max-w-md"
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!derived.ledger) return null;

  const {
    ledger,
    balance,
    isDebitBalance,
    entriesWithBalance,
    openingBalance,
    hasOpeningBalance,
    hasNoData,
  } = derived;

  return (
    <div className="space-y-6">
      {/* Ledger selector */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="font-custom text-xl font-semibold">
            Select Ledger to View
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SearchSelector<string>
            options={ledgerOptions}
            placeholder="Select a Ledger"
            value={selectedLedgerId}
            onSelect={(v) => setSelectedLedgerId(v || '')}
            className="w-full max-w-md"
          />
        </CardContent>
      </Card>

      {/* Statement card */}
      <Card className="border-border/50 overflow-hidden">
        {/* Header – primary theme */}
        <div className="bg-primary text-primary-foreground px-4 py-4 sm:px-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-custom text-xl font-bold">
                Statement of Account
              </h2>
              <h3 className="font-custom mt-1 text-lg font-semibold">
                {ledger.name}
              </h3>
            </div>
            <div className="font-custom text-sm opacity-90">
              Period: {formatDate(new Date())}
            </div>
          </div>
        </div>

        {/* Account summary bar – muted/primary for emphasis */}
        <div className="bg-muted border-border flex flex-wrap items-center justify-between gap-2 border-b px-4 py-3 sm:px-6">
          <span className="font-custom font-semibold">
            {ledger.name} [{ledger.type}]
          </span>
          <span className="font-custom text-lg font-bold tabular-nums">
            {formatAmount(Math.abs(balance))} {isDebitBalance ? 'Dr' : 'Cr'}
          </span>
        </div>

        {/* Account details */}
        <div className="border-border border-t">
          <div className="bg-muted/60 border-border border-b px-4 py-2">
            <h4 className="font-custom font-semibold underline">
              A/c: {ledger.name}
            </h4>
          </div>

          <Table className="border-collapse">
            <TableHeader>
              <TableRow className="border-border bg-muted hover:bg-muted">
                <TableHead className="font-custom border-border border px-4 py-2 font-bold">
                  Date
                </TableHead>
                <TableHead className="font-custom border-border w-10 border px-4 py-2 text-center font-bold">
                  B
                </TableHead>
                <TableHead className="font-custom border-border border px-4 py-2 font-bold">
                  Narration
                </TableHead>
                <TableHead className="font-custom border-border border px-4 py-2 text-right font-bold">
                  Debit
                </TableHead>
                <TableHead className="font-custom border-border border px-4 py-2 text-right font-bold">
                  Credit
                </TableHead>
                <TableHead className="font-custom border-border border px-4 py-2 text-right font-bold">
                  Balance
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {hasOpeningBalance && (
                <TableRow className="border-border">
                  <TableCell className="font-custom border-border border px-4 py-2">
                    {formatDate(
                      new Date(new Date().toISOString().split('T')[0]!)
                    )}
                  </TableCell>
                  <TableCell className="font-custom border-border border px-4 py-2 text-center">
                    OB
                  </TableCell>
                  <TableCell className="font-custom border-border border px-4 py-2">
                    Opening Balance
                  </TableCell>
                  <TableCell className="font-custom border-border border px-4 py-2 text-right tabular-nums">
                    {openingBalance > 0 &&
                    ['Asset', 'Expense'].includes(ledger.type)
                      ? formatAmount(openingBalance)
                      : ''}
                  </TableCell>
                  <TableCell className="font-custom border-border border px-4 py-2 text-right tabular-nums">
                    {openingBalance > 0 &&
                    ['Liability', 'Income', 'Equity'].includes(ledger.type)
                      ? formatAmount(openingBalance)
                      : openingBalance < 0 &&
                          ['Asset', 'Expense'].includes(ledger.type)
                        ? formatAmount(Math.abs(openingBalance))
                        : ''}
                  </TableCell>
                  <TableCell className="font-custom border-border border px-4 py-2 text-right font-medium tabular-nums">
                    {formatAmount(Math.abs(openingBalance))}{' '}
                    {openingBalance >= 0 ? 'Dr' : 'Cr'}
                  </TableCell>
                </TableRow>
              )}

              {entriesWithBalance.map((entry, idx) => {
                const entryBalance = entry.runningBalance;
                const entryIsDebit = ['Asset', 'Expense'].includes(ledger.type)
                  ? entryBalance >= 0
                  : entryBalance < 0;
                return (
                  <TableRow key={idx} className="border-border">
                    <TableCell className="font-custom border-border border px-4 py-2">
                      {formatDate(new Date(entry.date))}
                    </TableCell>
                    <TableCell className="font-custom border-border border px-4 py-2 text-center">
                      {entry.type}
                    </TableCell>
                    <TableCell className="font-custom border-border border px-4 py-2">
                      {entry.narration ||
                        `${entry.isDebit ? 'To' : 'By'} ${getLedgerName(
                          entry.isDebit ? entry.creditLedger : entry.debitLedger
                        )}`}
                    </TableCell>
                    <TableCell className="font-custom border-border border px-4 py-2 text-right tabular-nums">
                      {entry.isDebit ? formatAmount(entry.amount) : ''}
                    </TableCell>
                    <TableCell className="font-custom border-border border px-4 py-2 text-right tabular-nums">
                      {!entry.isDebit ? formatAmount(entry.amount) : ''}
                    </TableCell>
                    <TableCell className="font-custom border-border border px-4 py-2 text-right font-medium tabular-nums">
                      {formatAmount(Math.abs(entryBalance))}{' '}
                      {entryIsDebit ? 'Dr' : 'Cr'}
                    </TableCell>
                  </TableRow>
                );
              })}

              {hasNoData && (
                <TableRow className="border-border">
                  <TableCell
                    colSpan={6}
                    className="font-custom border-border text-muted-foreground border py-8 text-center"
                  >
                    No transactions found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Closing balance summary */}
        <div className="bg-muted/50 border-border border-t px-4 py-4 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-custom text-lg font-semibold">
              Closing Balance:
            </span>
            <span className="font-custom text-primary text-xl font-bold tabular-nums">
              ₹ {formatAmount(Math.abs(balance))} {isDebitBalance ? 'Dr' : 'Cr'}
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
});

export default LedgerViewTab;
