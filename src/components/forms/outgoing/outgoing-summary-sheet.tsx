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
      {Icon && <Icon className="h-4 w-4 shrink-0 text-zinc-400" aria-hidden />}
      <div className="min-w-0">
        <p className="font-custom text-[11px] font-medium tracking-wide text-zinc-400 uppercase">
          {label}
        </p>
        <p className="font-custom truncate text-sm font-medium text-white">
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
        <div className="flex min-h-0 flex-1 flex-col bg-zinc-900">
          <SheetHeader className="border-zinc-700/60 px-4 py-4 sm:px-6">
            <SheetTitle className="font-custom text-lg font-bold text-white sm:text-xl">
              Outgoing Gate Pass Summary
            </SheetTitle>
            <SheetDescription className="font-custom text-sm text-zinc-400">
              Review before creating outgoing gate pass
            </SheetDescription>
          </SheetHeader>

          {pendingPayload ? (
            <>
              <div className="flex flex-wrap gap-x-6 gap-y-3 border-b border-zinc-700/60 px-4 py-3 sm:px-6">
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
                <div className="mb-6 overflow-hidden rounded-xl border border-zinc-600/50 bg-zinc-800/60">
                  <h3 className="font-custom mt-3 mb-2 px-4 text-sm font-semibold text-zinc-300">
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
                        className="mx-4 mb-4 overflow-hidden rounded-lg bg-zinc-800/80"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-zinc-600/50 px-3 py-3 sm:px-4">
                          <div>
                            <p className="font-custom text-base font-bold text-white">
                              Incoming voucher #{idx + 1}
                              {entry.variety?.trim() && (
                                <span className="font-custom ml-2 font-normal text-zinc-400">
                                  ({entry.variety.trim()})
                                </span>
                              )}
                            </p>
                            <p className="font-custom mt-0.5 text-xs text-zinc-400">
                              {entryBags} bag
                              {entryBags !== 1 ? 's' : ''} allocated
                            </p>
                          </div>
                        </div>
                        <div className="px-3 py-2 sm:px-4">
                          <table className="font-custom w-full border-collapse text-sm">
                            <thead>
                              <tr>
                                <th className="border-b border-zinc-600/50 py-2 pr-3 text-left text-[10px] font-medium tracking-wide text-zinc-400 uppercase">
                                  Size
                                </th>
                                <th className="border-b border-zinc-600/50 px-2 py-2 text-right text-[10px] font-medium tracking-wide text-zinc-400 uppercase">
                                  Allocated
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {entry.allocations.map((alloc, allocIdx) => (
                                <tr key={`${alloc.size}-${allocIdx}`}>
                                  <td className="border-b border-zinc-600/40 py-2 pr-3 font-medium text-white">
                                    {alloc.size}
                                  </td>
                                  <td className="text-primary border-b border-zinc-600/40 px-2 py-2 text-right font-medium">
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
                    <div className="mx-4 mb-4 rounded-lg bg-zinc-800/60 px-3 py-2 sm:px-4">
                      <p className="font-custom text-[10px] font-medium tracking-wide text-zinc-400 uppercase">
                        Remarks
                      </p>
                      <p className="font-custom mt-1 text-xs text-zinc-300">
                        {pendingPayload.remarks}
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-5 rounded-xl bg-zinc-800/80 px-4 py-4 shadow-lg sm:px-5">
                  <div className="flex items-center justify-between">
                    <span className="font-custom text-base font-bold text-white sm:text-lg">
                      Grand Total
                    </span>
                    <span className="font-custom text-primary text-xl font-bold sm:text-2xl">
                      {totalBags} bag{totalBags !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              </div>

              <SheetFooter className="border-t border-zinc-700/60 bg-zinc-800/90 px-4 py-4 sm:px-6">
                <div className="flex w-full flex-col gap-3 sm:flex-row">
                  <Button
                    type="button"
                    variant="outline"
                    className="font-custom w-full border-zinc-600 bg-transparent text-zinc-200 hover:bg-zinc-700 hover:text-white sm:w-auto"
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
              <p className="font-custom text-center text-sm text-zinc-400">
                No summary available. Use Review to build the outgoing order.
              </p>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
});
