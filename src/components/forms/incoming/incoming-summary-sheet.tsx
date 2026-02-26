import { memo } from 'react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';

import {
  FileText,
  Calendar,
  Package,
  User,
  Truck,
  Loader2,
} from 'lucide-react';

import { shouldShowSpecialFields } from '@/lib/special-fields';
import { useStore } from '@/stores/store';

/* -------------------------------------------------------------------------- */
/*                                   Types                                    */
/* -------------------------------------------------------------------------- */

export interface LocationEntry {
  chamber: string;
  floor: string;
  row: string;
}

export interface IncomingSummaryFormValues {
  date: string;
  manualParchiNumber?: string;
  farmerStorageLinkId: string;
  variety: string;
  truckNumber?: string;
  sizeQuantities: Record<string, number>;
  extraQuantityRows?: Array<{ id: string; size: string; quantity: number }>;
  locationBySize: Record<string, LocationEntry>;
  remarks?: string;
  manualGatePassNumber?: number;
  customMarka?: string;
  stockFilter?: string;
}

export interface QuantityRow {
  sizeName: string;
  quantity: number;
  location: LocationEntry | undefined;
}

export interface IncomingSummarySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  voucherNumberDisplay: string | null;
  farmerDisplayName: string;
  variety: string;
  formValues: IncomingSummaryFormValues;
  /** Ordered rows for the quantities table (fixed sizes + extra size rows) */
  quantityRows: QuantityRow[];
  sizeOrder: string[];
  totalRent: number | null;
  isPending: boolean;
  isLoadingVoucher: boolean;
  gatePassNo: number;
  onSubmit: () => void;
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
        <p className="text-muted-foreground text-[11px] font-medium tracking-wide uppercase">
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
/*                              Table row cells                               */
/* -------------------------------------------------------------------------- */

function formatLocation(loc: LocationEntry | undefined): string {
  if (!loc) return '—';
  const ch = loc.chamber?.trim() || '';
  const fl = loc.floor?.trim() || '';
  const r = loc.row?.trim() || '';
  if (!ch && !fl && !r) return '—';
  return [ch, fl, r].filter(Boolean).join('-');
}

const RowCells = memo(function RowCells({
  size,
  quantity,
  location,
}: {
  size: string;
  quantity: number;
  location: LocationEntry | undefined;
}) {
  return (
    <>
      <div className="font-custom text-foreground border-border/80 border-b py-2.5 font-medium">
        {size}
      </div>
      <div className="font-custom text-primary border-border/80 border-b py-2.5 text-right font-medium">
        {quantity}
      </div>
      <div className="font-custom text-foreground border-border/80 border-b py-2.5 font-medium">
        {formatLocation(location)}
      </div>
    </>
  );
});

/* -------------------------------------------------------------------------- */
/*                                Main Sheet                                  */
/* -------------------------------------------------------------------------- */

export const IncomingSummarySheet = memo(function IncomingSummarySheet({
  open,
  onOpenChange,
  voucherNumberDisplay,
  farmerDisplayName,
  variety,
  formValues,
  quantityRows,
  totalRent,
  isPending,
  isLoadingVoucher,
  gatePassNo,
  onSubmit,
}: IncomingSummarySheetProps) {
  const admin = useStore((s) => s.admin);
  const showSpecialFields = shouldShowSpecialFields(admin?.mobileNumber);

  const totalBags = quantityRows.reduce(
    (sum, row) => sum + (row.quantity ?? 0),
    0
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col border-0 p-0 sm:max-w-lg"
      >
        {/* ------------------------------------------------------------------ */}
        {/* Content area (theme-aware light/dark)                               */}
        {/* ------------------------------------------------------------------ */}

        <div className="bg-background flex min-h-0 flex-1 flex-col">
          {/* Header */}
          <SheetHeader className="border-border px-4 py-4 sm:px-6">
            <SheetTitle className="font-custom text-foreground text-lg font-bold sm:text-xl">
              Incoming Gate Pass Summary
            </SheetTitle>
            <SheetDescription className="font-custom text-muted-foreground text-sm">
              Review before creating the incoming gate pass
            </SheetDescription>
          </SheetHeader>

          {/* Meta: Voucher, Date (compact) */}
          <div className="border-border flex flex-wrap gap-x-6 gap-y-3 border-b px-4 py-3 sm:px-6">
            {voucherNumberDisplay && (
              <SummaryMetaRow
                label="Voucher"
                value={voucherNumberDisplay}
                icon={FileText}
              />
            )}
            <SummaryMetaRow
              label="Date"
              value={formValues.date}
              icon={Calendar}
            />
          </div>

          {/* Farmer & Variety */}
          <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-6">
            <h2 className="font-custom text-foreground mb-4 text-xl font-bold sm:text-2xl">
              Order Details
            </h2>

            <div className="space-y-4">
              {/* Farmer */}
              <div className="bg-muted/80 rounded-xl shadow-lg">
                <div className="border-border/80 flex flex-wrap items-center gap-3 border-b px-4 py-3 sm:px-5">
                  <span className="font-custom bg-muted text-foreground inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold">
                    <User
                      className="text-muted-foreground h-3.5 w-3.5"
                      aria-hidden
                    />
                    {farmerDisplayName}
                  </span>
                </div>
              </div>

              {/* Variety + Truck + Manual Parchi */}
              <div className="bg-muted/80 rounded-xl shadow-lg">
                <div className="border-border/80 flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3 sm:px-5">
                  <span className="font-custom bg-muted text-foreground inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold">
                    <Package
                      className="text-muted-foreground h-3.5 w-3.5"
                      aria-hidden
                    />
                    Variety: {variety}
                  </span>
                </div>
                <div className="border-border/80 flex flex-wrap gap-x-6 gap-y-2 border-b px-4 py-3 sm:px-5">
                  {formValues.truckNumber?.trim() && (
                    <SummaryMetaRow
                      label="Truck"
                      value={formValues.truckNumber}
                      icon={Truck}
                    />
                  )}
                  {formValues.manualParchiNumber?.trim() && (
                    <SummaryMetaRow
                      label="Manual Parchi"
                      value={formValues.manualParchiNumber}
                    />
                  )}
                  {showSpecialFields && formValues.stockFilter?.trim() && (
                    <SummaryMetaRow
                      label="Stock Filter"
                      value={formValues.stockFilter}
                    />
                  )}
                  {showSpecialFields && formValues.customMarka?.trim() && (
                    <SummaryMetaRow
                      label="Custom Marka"
                      value={formValues.customMarka}
                    />
                  )}
                </div>
              </div>

              {/* Table: Size | Quantity | Location */}
              <div className="bg-muted/80 rounded-xl shadow-lg">
                <div className="border-border/80 border-b px-4 py-3 sm:px-5">
                  <span className="font-custom text-foreground text-base font-semibold">
                    Quantities & Location
                  </span>
                </div>
                <div className="px-4 py-3 sm:px-5">
                  <div className="grid grid-cols-[1fr_minmax(4rem,auto)_1fr] gap-x-4 gap-y-0 text-sm">
                    <div className="font-custom text-muted-foreground border-border/80 border-b py-2.5 font-medium tracking-wide uppercase">
                      Size
                    </div>
                    <div className="font-custom text-muted-foreground border-border/80 border-b py-2.5 text-right font-medium tracking-wide uppercase">
                      Qty
                    </div>
                    <div className="font-custom text-muted-foreground border-border/80 border-b py-2.5 font-medium tracking-wide uppercase">
                      Location
                    </div>
                    {quantityRows.length > 0 ? (
                      quantityRows.map((row, idx) => (
                        <RowCells
                          key={`${row.sizeName}-${idx}`}
                          size={row.sizeName}
                          quantity={row.quantity}
                          location={row.location}
                        />
                      ))
                    ) : (
                      <>
                        <div className="font-custom text-muted-foreground border-border/80 border-b py-2.5">
                          —
                        </div>
                        <div className="font-custom text-primary border-border/80 border-b py-2.5 text-right font-medium">
                          0
                        </div>
                        <div className="font-custom text-muted-foreground border-border/80 border-b py-2.5">
                          —
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Grand Total + Total Rent */}
              <div className="bg-muted/80 rounded-xl px-4 py-4 shadow-lg sm:px-5">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="font-custom text-foreground text-base font-bold sm:text-lg">
                      Grand Total (Bags)
                    </span>
                    <span className="font-custom text-primary text-xl font-bold sm:text-2xl">
                      {totalBags}
                    </span>
                  </div>
                  {totalRent != null && totalRent > 0 && (
                    <div className="border-border/80 flex items-center justify-between border-t pt-3">
                      <span className="font-custom text-foreground text-base font-semibold">
                        Total Rent
                      </span>
                      <span className="font-custom text-primary text-lg font-bold">
                        ₹{totalRent.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {formValues.remarks?.trim() && (
                <div className="bg-muted/60 rounded-lg px-4 py-3 sm:px-5">
                  <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                    Remarks
                  </p>
                  <p className="font-custom text-foreground mt-1 text-sm">
                    {formValues.remarks}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ------------------------------------------------------------------ */}
          {/* Footer                                                             */}
          {/* ------------------------------------------------------------------ */}

          <SheetFooter className="border-border bg-muted/50 border-t px-4 py-4 sm:px-6">
            <div className="flex w-full flex-col gap-3 sm:flex-row">
              <Button
                type="button"
                variant="outline"
                className="font-custom border-border text-foreground hover:bg-muted hover:text-foreground w-full bg-transparent sm:w-auto"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="lg"
                className="font-custom w-full font-bold sm:flex-1"
                onClick={onSubmit}
                disabled={isPending || isLoadingVoucher || !gatePassNo}
              >
                {isPending ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                    Creating...
                  </span>
                ) : (
                  'Create Incoming Gate Pass'
                )}
              </Button>
            </div>
          </SheetFooter>
        </div>
      </SheetContent>
    </Sheet>
  );
});
