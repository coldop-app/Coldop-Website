import { useMemo } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { DaybookEntry } from '@/services/store-admin/functions/useGetDaybook';

export interface BreakdownEntry {
  size: string;
  location: string;
  quantity: number;
  voucherNumber: number;
}

export interface CellClickData {
  variety: string;
  column: string;
  value: number;
  rowIndex: number;
  isTotal: boolean;
}

export type StockTabMode = 'current' | 'initial' | 'outgoing';

/** Build breakdown entries for a variety (and optional size) from incoming RECEIPT gate passes. */
function getBreakdownEntries(
  incomingEntries: DaybookEntry[],
  variety: string,
  size: string | null,
  tabType: StockTabMode
): BreakdownEntry[] {
  const entries: BreakdownEntry[] = [];
  for (const entry of incomingEntries) {
    if (entry.type !== 'RECEIPT' || !entry.bagSizes?.length) continue;
    const entryVariety = entry.variety ?? 'Unknown';
    if (entryVariety !== variety) continue;
    const voucherNumber = entry.gatePassNo ?? 0;
    for (const bag of entry.bagSizes) {
      if (size != null && bag.name !== size) continue;
      const loc = bag.location;
      const location = loc
        ? `${loc.chamber ?? ''}/${loc.floor ?? ''}/${loc.row ?? ''}`.replace(
            /\/+/g,
            '/'
          )
        : '—';
      let quantity = 0;
      if (tabType === 'current') {
        quantity = bag.currentQuantity ?? 0;
      } else if (tabType === 'initial') {
        quantity = bag.initialQuantity ?? 0;
      } else {
        quantity = Math.max(
          0,
          (bag.initialQuantity ?? 0) - (bag.currentQuantity ?? 0)
        );
      }
      if (quantity > 0) {
        entries.push({
          size: bag.name,
          location,
          quantity,
          voucherNumber,
        });
      }
    }
  }
  return entries.sort((a, b) => a.voucherNumber - b.voucherNumber);
}

export interface FarmerStockBreakdownDialogProps {
  cellClickData: CellClickData | null;
  onClose: () => void;
  incomingEntries: DaybookEntry[];
  tabType: StockTabMode;
  getTitle: () => string;
}

export function FarmerStockBreakdownDialog({
  cellClickData,
  onClose,
  incomingEntries,
  tabType,
  getTitle,
}: FarmerStockBreakdownDialogProps) {
  const breakdownEntries = useMemo(() => {
    if (!cellClickData) return [];
    const { variety, column, isTotal } = cellClickData;
    const allVarieties = [
      ...new Set(
        incomingEntries
          .filter((e) => e.type === 'RECEIPT')
          .map((e) => e.variety ?? 'Unknown')
      ),
    ].sort();
    if (column === 'variety' || (isTotal && column === 'variety')) {
      if (variety === 'Total' || isTotal) {
        const all: BreakdownEntry[] = [];
        for (const v of allVarieties) {
          all.push(...getBreakdownEntries(incomingEntries, v, null, tabType));
        }
        return all.sort((a, b) => a.voucherNumber - b.voucherNumber);
      }
      return getBreakdownEntries(incomingEntries, variety, null, tabType);
    }
    if (isTotal && column !== 'total' && column !== 'variety') {
      const all: BreakdownEntry[] = [];
      for (const v of allVarieties) {
        all.push(...getBreakdownEntries(incomingEntries, v, column, tabType));
      }
      return all.sort((a, b) => a.voucherNumber - b.voucherNumber);
    }
    if (!isTotal && column !== 'total' && column !== 'variety') {
      return getBreakdownEntries(incomingEntries, variety, column, tabType);
    }
    if (!isTotal && column === 'total') {
      return getBreakdownEntries(incomingEntries, variety, null, tabType);
    }
    return [];
  }, [cellClickData, incomingEntries, tabType]);

  const totalQuantity = useMemo(
    () => breakdownEntries.reduce((sum, e) => sum + e.quantity, 0),
    [breakdownEntries]
  );

  if (!cellClickData) return null;

  return (
    <AlertDialog
      open={!!cellClickData}
      onOpenChange={(open) => !open && onClose()}
    >
      <AlertDialogContent className="flex h-[85vh] w-[95vw] max-w-3xl flex-col overflow-hidden p-0">
        <AlertDialogHeader className="shrink-0 border-b px-6 pt-6 pb-4">
          <AlertDialogTitle className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <span className="font-custom text-base break-words sm:text-lg">
              {getTitle()}
            </span>
            <span className="font-custom text-primary text-base font-semibold whitespace-nowrap sm:text-lg">
              Total: {totalQuantity.toLocaleString('en-IN')}
            </span>
          </AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogDescription asChild>
          <div className="flex-1 overflow-hidden px-6 py-4">
            {breakdownEntries.length === 0 ? (
              <p className="font-custom text-muted-foreground">
                No entries found for this selection.
              </p>
            ) : (
              <div className="-mx-2 h-full overflow-y-auto px-2">
                <div className="min-w-full rounded-md border">
                  <div className="overflow-x-auto">
                    <Table className="border-collapse">
                      <TableHeader>
                        <TableRow className="border-border bg-muted">
                          <TableHead className="font-custom border-border border px-2 font-bold whitespace-nowrap sm:px-4">
                            Size
                          </TableHead>
                          <TableHead className="font-custom border-border border px-2 text-center font-bold whitespace-nowrap sm:px-4">
                            Location
                          </TableHead>
                          <TableHead className="font-custom border-border border px-2 text-right font-bold whitespace-nowrap sm:px-4">
                            Quantity
                          </TableHead>
                          <TableHead className="font-custom border-border border px-2 text-right font-bold whitespace-nowrap sm:px-4">
                            <span className="sm:hidden">V. No.</span>
                            <span className="hidden sm:inline">
                              Voucher Number
                            </span>
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {breakdownEntries.map((entry, idx) => (
                          <TableRow
                            key={`${entry.voucherNumber}-${entry.location}-${entry.size}-${idx}`}
                            className="border-border"
                          >
                            <TableCell className="font-custom border-border border px-2 font-medium whitespace-nowrap sm:px-4">
                              {entry.size}
                            </TableCell>
                            <TableCell className="font-custom border-border border px-2 text-center whitespace-nowrap sm:px-4">
                              {entry.location}
                            </TableCell>
                            <TableCell className="font-custom text-primary border-border border px-2 text-right font-bold whitespace-nowrap sm:px-4">
                              {entry.quantity.toLocaleString('en-IN')}
                            </TableCell>
                            <TableCell className="font-custom border-border border px-2 text-right whitespace-nowrap sm:px-4">
                              {entry.voucherNumber}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </AlertDialogDescription>
        <AlertDialogFooter className="shrink-0 border-t px-6 py-4">
          <AlertDialogAction>OK</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
