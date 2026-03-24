import { memo } from 'react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  ArrowRightLeft,
  Calendar,
  Loader2,
  Package,
  Users,
} from 'lucide-react';
import type { CreateTransferStockGatePassBody } from '@/services/transfer-stock/useCreateTransferStockGatePass';

function formatExtractionLocation(loc: {
  chamber?: string;
  floor?: string;
  row?: string;
}): string {
  if (!loc) return '—';
  const parts = [loc.chamber, loc.floor, loc.row]
    .map((s) => (s ?? '').trim())
    .filter(Boolean);
  return parts.length ? parts.join(' - ') : '—';
}

function formatDateLong(dateStr: string): string {
  if (!dateStr?.trim()) return '—';
  const trimmed = dateStr.trim();
  if (trimmed.includes('T') || /^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
    const d = new Date(trimmed);
    return Number.isNaN(d.getTime())
      ? trimmed
      : d.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const [y, m, day] = trimmed.split('-').map(Number);
    const d = new Date(y, m - 1, day);
    return Number.isNaN(d.getTime())
      ? trimmed
      : d.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
  }
  const [dPart, mo, y] = trimmed.split('.').map(Number);
  if (!dPart || !mo || !y) return trimmed;
  const d = new Date(y, mo - 1, dPart);
  return Number.isNaN(d.getTime())
    ? trimmed
    : d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
}

const SummaryMetaRow = memo(function SummaryMetaRow({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  icon?: React.ElementType;
}) {
  return (
    <div className="flex items-center gap-3">
      {Icon && (
        <Icon className="text-muted-foreground h-4 w-4 shrink-0" aria-hidden />
      )}
      <div className="min-w-0">
        <p className="text-muted-foreground font-custom text-[11px] font-medium tracking-wide uppercase">
          {label}
        </p>
        <p className="font-custom text-foreground truncate text-sm font-medium">
          {value}
        </p>
      </div>
    </div>
  );
});

export interface TransferStockSummarySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pendingPayload: CreateTransferStockGatePassBody | null;
  /** Variety label per incoming gate pass id (from source farmer passes). */
  varietyByPassId?: Record<string, string>;
  fromFarmerLabel: string;
  toFarmerLabel: string;
  isSubmitting: boolean;
  onConfirm: () => void;
}

export const TransferStockSummarySheet = memo(function TransferStockSummarySheet({
  open,
  onOpenChange,
  pendingPayload,
  varietyByPassId = {},
  fromFarmerLabel,
  toFarmerLabel,
  isSubmitting,
  onConfirm,
}: TransferStockSummarySheetProps) {
  const totalQuantity =
    pendingPayload?.items.reduce((sum, row) => sum + row.quantity, 0) ?? 0;

  const varietiesDisplay = pendingPayload?.items.length
    ? [
        ...new Set(
          pendingPayload.items
            .map((row) => varietyByPassId[row.incomingGatePassId]?.trim())
            .filter(Boolean)
        ),
      ].join(', ') || '—'
    : '—';

  const itemsByPassId = pendingPayload
    ? pendingPayload.items.reduce(
        (acc, row) => {
          if (!acc[row.incomingGatePassId]) acc[row.incomingGatePassId] = [];
          acc[row.incomingGatePassId].push(row);
          return acc;
        },
        {} as Record<
          string,
          NonNullable<CreateTransferStockGatePassBody['items']>
        >
      )
    : {};

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col border-0 p-0 sm:max-w-lg"
      >
        <div className="bg-background flex min-h-0 flex-1 flex-col">
          <SheetHeader className="border-border px-4 py-4 sm:px-6">
            <SheetTitle className="font-custom text-foreground text-lg font-bold sm:text-xl">
              Transfer stock summary
            </SheetTitle>
            <SheetDescription className="font-custom text-muted-foreground text-sm">
              Review allocations before creating the transfer gate pass
            </SheetDescription>
          </SheetHeader>

          {pendingPayload ? (
            <>
              <div className="border-border flex flex-wrap gap-x-6 gap-y-3 border-b px-4 py-3 sm:px-6">
                <SummaryMetaRow
                  label="Date"
                  value={formatDateLong(pendingPayload.date)}
                  icon={Calendar}
                />
                <SummaryMetaRow
                  label="Varieties"
                  value={varietiesDisplay}
                  icon={Package}
                />
                <SummaryMetaRow
                  label="From → To"
                  value={`${fromFarmerLabel} → ${toFarmerLabel}`}
                  icon={ArrowRightLeft}
                />
                <span className="font-custom text-primary text-sm font-semibold">
                  {totalQuantity.toFixed(1)} total qty
                </span>
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-6">
                <div className="border-border bg-muted/80 mb-6 overflow-hidden rounded-xl border shadow-lg">
                  <h3 className="font-custom text-foreground mt-3 mb-2 px-4 text-sm font-semibold">
                    Incoming gate passes (source)
                  </h3>
                  {Object.entries(itemsByPassId).map(([passId, rows], idx) => {
                    const entryQty = rows.reduce((a, b) => a + b.quantity, 0);
                    const variety = varietyByPassId[passId]?.trim();
                    return (
                      <div
                        key={passId}
                        className="border-border/80 bg-muted/80 mx-4 mb-4 overflow-hidden rounded-lg"
                      >
                        <div className="border-border/80 flex flex-wrap items-start justify-between gap-4 border-b px-3 py-3 sm:px-4">
                          <div>
                            <p className="font-custom text-foreground text-base font-bold">
                              Voucher {idx + 1}
                              {variety && (
                                <span className="text-muted-foreground font-custom ml-2 font-normal">
                                  ({variety})
                                </span>
                              )}
                            </p>
                            <p className="text-muted-foreground font-custom mt-0.5 text-xs">
                              {entryQty.toFixed(1)} qty allocated
                            </p>
                          </div>
                        </div>
                        <div className="px-3 py-2 sm:px-4">
                          <table className="font-custom w-full border-collapse text-sm">
                            <thead>
                              <tr>
                                <th className="border-border/80 text-muted-foreground border-b py-2 pr-3 text-left text-[10px] font-medium tracking-wide uppercase">
                                  Bag size
                                </th>
                                <th className="border-border/80 text-muted-foreground border-b px-2 py-2 text-left text-[10px] font-medium tracking-wide uppercase">
                                  Location
                                </th>
                                <th className="border-border/80 text-muted-foreground border-b px-2 py-2 text-right text-[10px] font-medium tracking-wide uppercase">
                                  Qty
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {rows.map((row, allocIdx) => (
                                <tr key={`${row.bagSize}-${allocIdx}`}>
                                  <td className="border-border/80 text-foreground border-b py-2 pr-3 font-medium">
                                    {row.bagSize}
                                  </td>
                                  <td className="border-border/80 text-foreground border-b px-2 py-2">
                                    {formatExtractionLocation(
                                      row.location ?? {}
                                    )}
                                  </td>
                                  <td className="text-primary border-border/80 border-b px-2 py-2 text-right font-medium">
                                    {Number(row.quantity).toFixed(1)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    );
                  })}

                  {pendingPayload.remarks?.trim() && (
                    <div className="bg-muted/60 mx-4 mb-4 rounded-lg px-3 py-2 sm:px-4">
                      <p className="text-muted-foreground text-[10px] font-medium tracking-wide uppercase">
                        Remarks
                      </p>
                      <p className="font-custom text-foreground mt-1 text-sm">
                        {pendingPayload.remarks.trim()}
                      </p>
                    </div>
                  )}
                </div>

                <div className="bg-muted/80 mt-5 rounded-xl px-4 py-4 shadow-lg sm:px-5">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-2">
                      <Users className="text-muted-foreground h-4 w-4 shrink-0" />
                      <span className="font-custom text-foreground text-sm font-medium">
                        To: {toFarmerLabel}
                      </span>
                    </div>
                    <span className="font-custom text-primary text-xl font-bold sm:text-2xl">
                      {totalQuantity.toFixed(1)}
                    </span>
                  </div>
                  <p className="text-muted-foreground font-custom mt-1 text-xs">
                    Grand total quantity transferred
                  </p>
                </div>
              </div>

              <SheetFooter className="border-border bg-muted/50 border-t px-4 py-4 sm:px-6">
                <div className="flex w-full flex-col gap-3 sm:flex-row">
                  <Button
                    type="button"
                    variant="outline"
                    className="font-custom border-border text-foreground hover:bg-muted hover:text-foreground w-full bg-transparent sm:w-auto"
                    onClick={() => onOpenChange(false)}
                    disabled={isSubmitting}
                  >
                    Back to form
                  </Button>
                  <Button
                    type="button"
                    size="lg"
                    className="font-custom w-full font-bold sm:flex-1"
                    onClick={onConfirm}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                        Creating…
                      </span>
                    ) : (
                      'Complete Transfer'
                    )}
                  </Button>
                </div>
              </SheetFooter>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center px-4 py-8">
              <p className="text-muted-foreground font-custom text-center text-sm">
                No summary available. Use Review to build the transfer.
              </p>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
});
