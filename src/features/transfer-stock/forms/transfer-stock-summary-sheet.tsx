import type { ReactNode } from 'react';
import {
  ArrowLeft,
  ArrowRightLeft,
  Calendar,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  Scale,
  User2,
  Warehouse,
  type LucideIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import type { TransferStockFormValues } from '@/features/transfer-stock/types';
import type { TransferStockItem } from '@/features/transfer-stock/types/storage-gate-pass';
import { cn } from '@/lib/utils';

export type TransferStockSummaryValues = TransferStockFormValues;

type TransferStockSummarySheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  values: TransferStockSummaryValues | null;
  fromFarmerLabel: string;
  toFarmerLabel: string;
  transferItems: TransferStockItem[];
  onBack: () => void;
  onSubmit: () => void;
  canSubmit: boolean;
  isSubmitting: boolean;
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

function TransferReviewSummary({
  values,
  fromFarmerLabel,
  toFarmerLabel,
  transferItems,
}: {
  values: TransferStockSummaryValues;
  fromFarmerLabel: string;
  toFarmerLabel: string;
  transferItems: TransferStockItem[];
}) {
  const totalBags = transferItems.reduce((sum, item) => sum + item.quantity, 0);
  return (
    <div className="space-y-7">
      <div className="border-border/40 bg-muted/30 flex items-center justify-between gap-3 rounded-xl border px-4 py-3.5">
        <div className="flex min-w-0 items-center gap-3">
          <span className="border-primary/20 bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-lg border">
            <ArrowRightLeft className="size-4" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold tracking-tight">Stock transfer</p>
            <p className="text-muted-foreground mt-0.5 flex items-center gap-1 text-[11px]">
              <Calendar className="size-3 shrink-0" />
              {formatReviewDate(values.date)}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <SectionLabel icon={User2}>Accounts</SectionLabel>
        <SummaryCard>
          <DetailRow label="From" value={fromFarmerLabel} icon={User2} />
          <DetailRow label="To" value={toFarmerLabel} icon={User2} valueClassName="text-primary" />
        </SummaryCard>
      </div>

      <div className="space-y-2">
        <SectionLabel icon={Calendar}>Transfer date</SectionLabel>
        <SummaryCard>
          <DetailRow label="Date" value={formatReviewDate(values.date)} icon={Calendar} />
          {values.stockFilter ? (
            <DetailRow label="Stock filter" value={values.stockFilter} />
          ) : null}
          {values.customMarka ? (
            <DetailRow label="Custom marka" value={values.customMarka} />
          ) : null}
          {values.amount.trim() ? (
            <DetailRow
              label="Amount"
              value={Number(values.amount).toLocaleString('en-IN', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
              valueClassName="tabular-nums"
            />
          ) : null}
        </SummaryCard>
      </div>

      <div className="space-y-2">
        <SectionLabel icon={Scale}>Allocations</SectionLabel>
        {transferItems.length > 0 ? (
          <div className="border-border/50 overflow-x-auto rounded-xl border">
            <table className="w-full caption-bottom text-sm">
              <thead className="border-border/40 bg-muted/30 border-b">
                <tr className="text-left">
                  <th className="text-muted-foreground h-10 px-3 font-medium">Voucher</th>
                  <th className="text-muted-foreground h-10 px-3 font-medium">Size</th>
                  <th className="text-muted-foreground h-10 px-3 font-medium">Location</th>
                  <th className="text-muted-foreground h-10 px-3 text-right font-medium">Qty</th>
                </tr>
              </thead>
              <tbody>
                {transferItems.map((item, index) => (
                  <tr
                    key={`${item.storageGatePassId}-${item.bagSize}-${item.bagIndex}-${index}`}
                    className="border-border/40 border-b last:border-0"
                  >
                    <td className="px-3 py-2.5 font-mono text-sm tabular-nums">
                      #{item.gatePassNo}
                    </td>
                    <td className="px-3 py-2.5 font-medium">{item.bagSize}</td>
                    <td className="text-muted-foreground px-3 py-2.5 text-xs">
                      Ch {item.location.chamber} · F {item.location.floor} · R {item.location.row}
                    </td>
                    <td className="px-3 py-2.5 text-right font-medium tabular-nums">
                      {item.quantity.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="border-border/50 bg-muted/15 rounded-xl border border-dashed px-4 py-6 text-center">
            <p className="text-muted-foreground text-sm">No allocations selected.</p>
          </div>
        )}
        <SummaryCard className="mt-3">
          <DetailRow
            label="Total bags"
            value={totalBags.toLocaleString('en-IN')}
            icon={Warehouse}
            valueClassName="font-semibold tabular-nums"
          />
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

export function TransferStockSummarySheet({
  open,
  onOpenChange,
  values,
  fromFarmerLabel,
  toFarmerLabel,
  transferItems,
  onBack,
  onSubmit,
  canSubmit,
  isSubmitting,
}: TransferStockSummarySheetProps) {
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
                Review transfer
              </SheetTitle>
              <SheetDescription className="text-muted-foreground text-xs leading-snug">
                Verify source, destination, and date before confirming.
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          {values ? (
            <TransferReviewSummary
              values={values}
              fromFarmerLabel={fromFarmerLabel}
              toFarmerLabel={toFarmerLabel}
              transferItems={transferItems}
            />
          ) : (
            <div className="border-border/50 bg-muted/20 flex min-h-48 flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-6 text-center">
              <ArrowRightLeft className="text-muted-foreground/40 size-7" />
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
                Confirm &amp; submit
              </>
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
