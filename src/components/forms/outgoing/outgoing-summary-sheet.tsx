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
import { FileText, Calendar, Package, Loader2, Truck } from 'lucide-react';
import type { CreateOutgoingGatePassBody } from '@/services/outgoing-gate-pass/useCreateOutgoingGatePass';

/* -------------------------------------------------------------------------- */
/*                                  Helpers                                   */
/* -------------------------------------------------------------------------- */

/** Format allocation location (chamber, floor, row) for display. */
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

/** Format ISO or dd.mm.yyyy to "Jan 18, 2026" */
function formatDateLong(dateStr: string): string {
  if (!dateStr?.trim()) return '—';
  const trimmed = dateStr.trim();
  if (trimmed.includes('-')) {
    const d = new Date(trimmed);
    return Number.isNaN(d.getTime())
      ? trimmed
      : d.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
  }
  const [day, month, year] = trimmed.split('.').map(Number);
  if (!day || !month || !year) return trimmed;
  const d = new Date(year, month - 1, day);
  return Number.isNaN(d.getTime())
    ? trimmed
    : d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
}

export interface OutgoingSummarySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pendingPayload: CreateOutgoingGatePassBody | null;
  isSubmitting: boolean;
  onConfirm: () => void;
}

/* -------------------------------------------------------------------------- */
/*                           Compact Meta Row UI                              */
/* -------------------------------------------------------------------------- */

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

/* -------------------------------------------------------------------------- */
/*                                Main Sheet                                  */
/* -------------------------------------------------------------------------- */

export const OutgoingSummarySheet = memo(function OutgoingSummarySheet({
  open,
  onOpenChange,
  pendingPayload,
  isSubmitting,
  onConfirm,
}: OutgoingSummarySheetProps) {
  const totalBags =
    pendingPayload?.incomingGatePasses.reduce(
      (sum, entry) =>
        sum + entry.allocations.reduce((a, b) => a + b.quantityToAllocate, 0),
      0
    ) ?? 0;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col border-0 p-0 sm:max-w-lg"
      >
        <div className="bg-background flex min-h-0 flex-1 flex-col">
          <SheetHeader className="border-border px-4 py-4 sm:px-6">
            <SheetTitle className="font-custom text-foreground text-lg font-bold sm:text-xl">
              Outgoing Gate Pass Summary
            </SheetTitle>
            <SheetDescription className="font-custom text-muted-foreground text-sm">
              Review before creating outgoing gate pass
            </SheetDescription>
          </SheetHeader>

          {pendingPayload ? (
            <>
              <div className="border-border flex flex-wrap gap-x-6 gap-y-3 border-b px-4 py-3 sm:px-6">
                <SummaryMetaRow
                  label="Voucher"
                  value={`#${pendingPayload.gatePassNo}`}
                  icon={FileText}
                />
                <SummaryMetaRow
                  label="Date"
                  value={formatDateLong(pendingPayload.date)}
                  icon={Calendar}
                />
                <SummaryMetaRow
                  label="Varieties"
                  value={
                    [
                      ...new Set(
                        pendingPayload.incomingGatePasses
                          .map((e) => e.variety?.trim())
                          .filter(Boolean)
                      ),
                    ].join(', ') || '—'
                  }
                  icon={Package}
                />
                <SummaryMetaRow
                  label="From → To"
                  value={
                    pendingPayload.from?.trim() || pendingPayload.to?.trim()
                      ? `${pendingPayload.from?.trim() ?? '—'} → ${pendingPayload.to?.trim() ?? '—'}`
                      : '—'
                  }
                  icon={Truck}
                />
                <span className="font-custom text-primary text-sm font-semibold">
                  {totalBags} bag{totalBags !== 1 ? 's' : ''}
                </span>
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-6">
                <div className="border-border bg-muted/80 mb-6 overflow-hidden rounded-xl border shadow-lg">
                  <h3 className="font-custom text-foreground mt-3 mb-2 px-4 text-sm font-semibold">
                    Incoming gate passes
                  </h3>
                  {pendingPayload.incomingGatePasses.map((entry, idx) => {
                    const entryBags = entry.allocations.reduce(
                      (a, b) => a + b.quantityToAllocate,
                      0
                    );
                    return (
                      <div
                        key={entry.incomingGatePassId}
                        className="border-border/80 bg-muted/80 mx-4 mb-4 overflow-hidden rounded-lg"
                      >
                        <div className="border-border/80 flex flex-wrap items-start justify-between gap-4 border-b px-3 py-3 sm:px-4">
                          <div>
                            <p className="font-custom text-foreground text-base font-bold">
                              Incoming voucher #{idx + 1}
                              {entry.variety?.trim() && (
                                <span className="text-muted-foreground font-custom ml-2 font-normal">
                                  ({entry.variety.trim()})
                                </span>
                              )}
                            </p>
                            <p className="text-muted-foreground font-custom mt-0.5 text-xs">
                              {entryBags} bag
                              {entryBags !== 1 ? 's' : ''} allocated
                            </p>
                          </div>
                        </div>
                        <div className="px-3 py-2 sm:px-4">
                          <table className="font-custom w-full border-collapse text-sm">
                            <thead>
                              <tr>
                                <th className="border-border/80 text-muted-foreground border-b py-2 pr-3 text-left text-[10px] font-medium tracking-wide uppercase">
                                  Size
                                </th>
                                <th className="border-border/80 text-muted-foreground border-b px-2 py-2 text-left text-[10px] font-medium tracking-wide uppercase">
                                  Extraction location
                                </th>
                                <th className="border-border/80 text-muted-foreground border-b px-2 py-2 text-right text-[10px] font-medium tracking-wide uppercase">
                                  Allocated
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {entry.allocations.map((alloc, allocIdx) => (
                                <tr key={`${alloc.size}-${allocIdx}`}>
                                  <td className="border-border/80 text-foreground border-b py-2 pr-3 font-medium">
                                    {alloc.size}
                                  </td>
                                  <td className="border-border/80 text-foreground border-b px-2 py-2">
                                    {formatExtractionLocation(
                                      alloc.location ?? {}
                                    )}
                                  </td>
                                  <td className="text-primary border-border/80 border-b px-2 py-2 text-right font-medium">
                                    {Number(alloc.quantityToAllocate).toFixed(
                                      1
                                    )}
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
                        {pendingPayload.remarks}
                      </p>
                    </div>
                  )}
                </div>

                <div className="bg-muted/80 mt-5 rounded-xl px-4 py-4 shadow-lg sm:px-5">
                  <div className="flex items-center justify-between">
                    <span className="font-custom text-foreground text-base font-bold sm:text-lg">
                      Grand Total
                    </span>
                    <span className="font-custom text-primary text-xl font-bold sm:text-2xl">
                      {totalBags} bag{totalBags !== 1 ? 's' : ''}
                    </span>
                  </div>
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
                    Cancel
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
                        Creating...
                      </span>
                    ) : (
                      'Create Outgoing Gate Pass'
                    )}
                  </Button>
                </div>
              </SheetFooter>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center px-4 py-8">
              <p className="text-muted-foreground font-custom text-center text-sm">
                No summary available. Use Review to build the outgoing order.
              </p>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
});
