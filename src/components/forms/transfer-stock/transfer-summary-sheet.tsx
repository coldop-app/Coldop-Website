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
import { Calendar, Loader2, Truck } from 'lucide-react';
import type { CreateTransferStockBody } from '@/services/transfer-stock/useCreateTransferStock';

export interface TransferSummarySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pendingPayload: CreateTransferStockBody | null;
  isSubmitting: boolean;
  onConfirm: () => void;
  fromFarmerLabel?: string;
  toFarmerLabel?: string;
}

export const TransferSummarySheet = memo(function TransferSummarySheet({
  open,
  onOpenChange,
  pendingPayload,
  isSubmitting,
  onConfirm,
  fromFarmerLabel,
  toFarmerLabel,
}: TransferSummarySheetProps) {
  const totalBags =
    pendingPayload?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

  const formattedDate =
    pendingPayload?.date && pendingPayload.date.includes('-')
      ? (() => {
          const d = new Date(pendingPayload.date);
          return Number.isNaN(d.getTime())
            ? pendingPayload.date
            : d.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              });
        })()
      : pendingPayload?.date ?? '—';

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col border-0 p-0 sm:max-w-lg"
      >
        <div className="bg-background flex min-h-0 flex-1 flex-col">
          <SheetHeader className="border-border px-4 py-4 sm:px-6">
            <SheetTitle className="font-custom text-foreground text-lg font-bold sm:text-xl">
              Transfer Stock Summary
            </SheetTitle>
            <SheetDescription className="font-custom text-muted-foreground text-sm">
              Review before creating transfer stock gate pass
            </SheetDescription>
          </SheetHeader>

          {pendingPayload ? (
            <>
              <div className="border-border flex flex-wrap gap-x-6 gap-y-3 border-b px-4 py-3 sm:px-6">
                <div className="flex items-center gap-3">
                  <Truck className="text-muted-foreground h-4 w-4 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-muted-foreground font-custom text-[11px] font-medium tracking-wide uppercase">
                      From → To
                    </p>
                    <p className="font-custom text-foreground truncate text-sm font-medium">
                      {(fromFarmerLabel || '—') + ' → ' + (toFarmerLabel || '—')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="text-muted-foreground h-4 w-4 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-muted-foreground font-custom text-[11px] font-medium tracking-wide uppercase">
                      Date
                    </p>
                    <p className="font-custom text-foreground truncate text-sm font-medium">
                      {formattedDate}
                    </p>
                  </div>
                </div>
                <span className="font-custom text-primary text-sm font-semibold">
                  {totalBags} bag{totalBags !== 1 ? 's' : ''}
                </span>
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-6">
                <div className="border-border bg-muted/80 mb-6 overflow-hidden rounded-xl border shadow-lg">
                  <h3 className="font-custom text-foreground mt-3 mb-2 px-4 text-sm font-semibold">
                    Items to transfer
                  </h3>
                  <div className="px-3 py-2 sm:px-4">
                    <table className="font-custom w-full border-collapse text-sm">
                      <thead>
                        <tr>
                          <th className="border-border/80 text-muted-foreground border-b py-2 pr-3 text-left text-[10px] font-medium tracking-wide uppercase">
                            Incoming GP
                          </th>
                          <th className="border-border/80 text-muted-foreground border-b px-2 py-2 text-left text-[10px] font-medium tracking-wide uppercase">
                            Size
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
                        {pendingPayload.items.map((item, idx) => (
                          <tr key={`${item.incomingGatePassId}-${idx}`}>
                            <td className="border-border/80 text-foreground border-b py-2 pr-3 font-medium">
                              {item.incomingGatePassId.slice(-6)}
                            </td>
                            <td className="border-border/80 text-foreground border-b px-2 py-2">
                              {item.bagSize}
                            </td>
                            <td className="border-border/80 text-foreground border-b px-2 py-2">
                              {[item.location.chamber, item.location.floor, item.location.row]
                                .filter(Boolean)
                                .join(' - ') || '—'}
                            </td>
                            <td className="text-primary border-border/80 border-b px-2 py-2 text-right font-medium">
                              {item.quantity}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

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
                      'Create Transfer Stock'
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
