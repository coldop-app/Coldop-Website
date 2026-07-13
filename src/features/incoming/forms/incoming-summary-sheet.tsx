import type { ReactNode } from 'react';
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  Package2,
  Scale,
  User2,
  Warehouse,
  type LucideIcon,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import type { IncomingFormValues } from '@/features/incoming/types';
import { formatInr } from '@/features/finances/shared/format-currency';
import { cn } from '@/lib/utils';

export type IncomingSummaryValues = IncomingFormValues;

type IncomingSummarySheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  values: IncomingSummaryValues | null;
  farmerLabel: string;
  costPerBag?: number;
  showCommodity?: boolean;
  onBack: () => void;
  onSubmit: () => void;
  canSubmit: boolean;
  isSubmitting: boolean;
  submitLabel?: string;
};

function formatReviewDate(iso: string) {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('en-IN', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function DetailRow({
  label,
  value,
  icon: Icon,
  valueClassName,
}: {
  label: string;
  value: ReactNode;
  icon?: LucideIcon;
  valueClassName?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5">
      <span className="text-muted-foreground flex shrink-0 items-center gap-1.5 text-xs">
        {Icon && <Icon className="size-3.5 shrink-0" />}
        {label}
      </span>
      <span className={cn('text-foreground text-right text-sm font-medium', valueClassName)}>
        {value ?? '—'}
      </span>
    </div>
  );
}

function SectionLabel({ icon: Icon, children }: { icon: LucideIcon; children: ReactNode }) {
  return (
    <div className="mb-1 flex items-center gap-2">
      <span className="bg-primary/10 text-primary flex size-6 shrink-0 items-center justify-center rounded-md">
        <Icon className="size-3.5" />
      </span>
      <span className="text-foreground/70 text-[11px] font-bold tracking-widest uppercase">
        {children}
      </span>
    </div>
  );
}

function SummaryCard({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'divide-border/40 border-border/50 bg-card divide-y rounded-xl border px-4',
        className,
      )}
    >
      {children}
    </div>
  );
}

function activeQuantityRows(quantities: IncomingSummaryValues['quantities']) {
  return quantities.filter((row) => (row.qty ?? 0) > 0);
}

function formatLocationCell(value: string) {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : '—';
}

function IncomingReviewSummary({
  values,
  farmerLabel,
  costPerBag,
  showCommodity = false,
}: {
  values: IncomingSummaryValues;
  farmerLabel: string;
  costPerBag?: number;
  showCommodity?: boolean;
}) {
  const rows = activeQuantityRows(values.quantities);
  const totalBags = rows.reduce((sum, row) => sum + (row.qty ?? 0), 0);
  const showTotalRent = typeof costPerBag === 'number';
  const totalRent = showTotalRent ? totalBags * costPerBag : 0;

  const hasPassMeta =
    values.gatePassNo > 0 || values.manualGatePassNumber != null || Boolean(values.stockFilter);

  return (
    <div className="space-y-7">
      <div className="border-border/50 from-primary/[0.07] via-card to-muted/25 overflow-hidden rounded-xl border bg-linear-to-br shadow-sm">
        <div className="flex flex-col gap-3.5 p-4">
          <div className="flex items-start gap-3.5">
            <span className="bg-primary/10 text-primary ring-primary/15 flex size-11 shrink-0 items-center justify-center rounded-xl ring-1 ring-inset">
              <Package2 className="size-5" aria-hidden />
            </span>
            <div className="min-w-0 flex-1 space-y-1">
              <h3
                className="font-heading text-foreground truncate text-base font-semibold tracking-tight"
                title={values.variety}
              >
                {values.variety}
              </h3>
              <p className="text-muted-foreground flex items-center gap-1.5 text-xs">
                <Calendar className="size-3.5 shrink-0 opacity-70" aria-hidden />
                <span>{formatReviewDate(values.date)}</span>
              </p>
            </div>
          </div>

          {hasPassMeta ? (
            <div className="border-border/35 flex flex-wrap items-center gap-2 border-t pt-3.5">
              {values.gatePassNo > 0 ? (
                <Badge
                  variant="outline"
                  className="border-primary/30 bg-primary/5 gap-1.5 px-2.5 font-normal"
                >
                  <span className="bg-primary size-1.5 shrink-0 rounded-full" aria-hidden />
                  <span className="text-foreground/80">IGP</span>
                  <span className="text-primary font-mono font-semibold tabular-nums">
                    #{values.gatePassNo.toLocaleString('en-IN')}
                  </span>
                </Badge>
              ) : null}
              {values.manualGatePassNumber != null && (
                <Badge variant="outline" className="bg-background/80 gap-1 px-2.5 font-normal">
                  <span className="text-muted-foreground">Manual</span>
                  <span className="text-foreground font-mono tabular-nums">
                    #{values.manualGatePassNumber.toLocaleString('en-IN')}
                  </span>
                </Badge>
              )}
              {values.stockFilter ? (
                <Badge
                  variant="secondary"
                  className="bg-background/60 max-w-full truncate px-2.5 font-normal"
                  title={values.stockFilter}
                >
                  {values.stockFilter}
                </Badge>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      <div className="space-y-2">
        <SectionLabel icon={User2}>Farmer</SectionLabel>
        <SummaryCard>
          <DetailRow label="Linked account" value={farmerLabel} icon={User2} />
        </SummaryCard>
      </div>

      <div className="space-y-2">
        <SectionLabel icon={Package2}>Crop details</SectionLabel>
        <SummaryCard>
          {showCommodity && values.commodity ? (
            <DetailRow label="Commodity" value={values.commodity} />
          ) : null}
          <DetailRow label="Variety" value={values.variety} />
          {values.stockFilter ? (
            <DetailRow label="Stock filter" value={values.stockFilter} />
          ) : null}
          {values.customMarka ? (
            <DetailRow label="Custom marka" value={values.customMarka} />
          ) : null}
          <DetailRow label="Date" value={formatReviewDate(values.date)} icon={Calendar} />
          {values.truckNumber.trim() ? (
            <DetailRow label="Truck number" value={values.truckNumber.trim()} />
          ) : null}
        </SummaryCard>
      </div>

      <div className="space-y-2">
        <SectionLabel icon={Scale}>Bag quantities</SectionLabel>
        {rows.length > 0 ? (
          <div className="border-border/50 overflow-x-auto rounded-xl border">
            <table className="w-full caption-bottom text-sm">
              <thead className="border-border/40 bg-muted/30 border-b">
                <tr className="text-left">
                  <th className="text-muted-foreground h-10 px-3 font-medium">Size</th>
                  <th className="text-muted-foreground h-10 px-3 text-right font-medium">Qty</th>
                  <th className="text-muted-foreground h-10 px-3 font-medium">Chamber</th>
                  <th className="text-muted-foreground h-10 px-3 font-medium">Floor</th>
                  <th className="text-muted-foreground h-10 px-3 font-medium">Row</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr
                    key={`${row.size}-${index}`}
                    className="border-border/40 border-b last:border-0"
                  >
                    <td className="px-3 py-2.5 font-medium">{row.size}</td>
                    <td className="px-3 py-2.5 text-right tabular-nums">
                      {(row.qty ?? 0).toLocaleString('en-IN')}
                    </td>
                    <td className="text-muted-foreground px-3 py-2.5 tabular-nums">
                      {formatLocationCell(row.chamber)}
                    </td>
                    <td className="text-muted-foreground px-3 py-2.5 tabular-nums">
                      {formatLocationCell(row.floor)}
                    </td>
                    <td className="text-muted-foreground px-3 py-2.5 tabular-nums">
                      {formatLocationCell(row.row)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="border-border/50 bg-muted/15 rounded-xl border border-dashed px-4 py-6 text-center">
            <p className="text-muted-foreground text-sm">No bag quantities entered.</p>
          </div>
        )}

        <SummaryCard className="mt-3">
          <DetailRow
            label="Total bags"
            value={totalBags.toLocaleString('en-IN')}
            icon={Warehouse}
            valueClassName="font-semibold tabular-nums"
          />
          {showTotalRent ? (
            <DetailRow
              label="Total rent"
              value={
                <>
                  <span className="block font-semibold tabular-nums">{formatInr(totalRent)}</span>
                  <span className="text-muted-foreground mt-0.5 block text-xs font-normal tabular-nums">
                    ({totalBags.toLocaleString('en-IN')} × {formatInr(costPerBag)})
                  </span>
                </>
              }
              icon={Scale}
            />
          ) : null}
        </SummaryCard>
      </div>

      {values.remarks.trim() ? (
        <div className="space-y-2">
          <SectionLabel icon={FileText}>Remarks</SectionLabel>
          <div className="border-border/50 bg-muted/15 rounded-xl border border-dashed px-4 py-3">
            <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-wrap italic">
              {values.remarks}
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function IncomingSummarySheet({
  open,
  onOpenChange,
  values,
  farmerLabel,
  costPerBag,
  showCommodity = false,
  onBack,
  onSubmit,
  canSubmit,
  isSubmitting,
  submitLabel = 'Confirm & submit',
}: IncomingSummarySheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex flex-col gap-0 p-0 data-[side=right]:w-full data-[side=right]:max-w-full sm:data-[side=right]:max-w-md"
      >
        <SheetHeader className="border-border/40 border-b px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center rounded-lg">
              <ClipboardCheck className="size-4" />
            </span>
            <div className="min-w-0 space-y-0.5">
              <SheetTitle className="text-base leading-none font-semibold">
                Review incoming pass
              </SheetTitle>
              <SheetDescription className="text-muted-foreground text-xs leading-snug">
                Verify all fields before confirming.
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          {values ? (
            <IncomingReviewSummary
              values={values}
              farmerLabel={farmerLabel}
              costPerBag={costPerBag}
              showCommodity={showCommodity}
            />
          ) : (
            <div className="border-border/50 bg-muted/20 flex min-h-48 flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-6 text-center">
              <Package2 className="text-muted-foreground/40 size-7" />
              <p className="text-sm font-medium">No summary available</p>
              <p className="text-muted-foreground text-xs">
                Complete the form and open review again.
              </p>
            </div>
          )}
        </div>

        <SheetFooter className="border-border/40 flex-row gap-2.5 border-t px-5 py-4">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground gap-1.5"
            onClick={onBack}
          >
            <ArrowLeft className="size-3.5" />
            Back
          </Button>
          <Button
            type="button"
            size="sm"
            className="flex-1 gap-1.5"
            disabled={!canSubmit || isSubmitting}
            onClick={onSubmit}
          >
            {isSubmitting ? (
              'Submitting…'
            ) : (
              <>
                <CheckCircle2 className="size-3.5" />
                {submitLabel}
              </>
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
