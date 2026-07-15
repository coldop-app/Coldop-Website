import {
  Fragment,
  useCallback,
  useMemo,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { ClipboardList, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  TransferAllocationSheet,
  type AllocationSheetTarget,
} from '@/features/transfer-stock/forms/transfer-allocation-sheet';
import { OutgoingAllocationSheet } from '@/features/outgoing/forms/outgoing-allocation-sheet';
import type { VarietyFilterMode } from '@/features/transfer-stock/hooks/use-transfer-gate-pass-matrix';
import type {
  DatePassGroup,
  StorageGatePass,
} from '@/features/transfer-stock/types/storage-gate-pass';
import {
  allocationKey,
  formatLocationShort,
  getBagSlotsForSize,
  getSlotStockLevel,
  isSlotUnavailable,
  slotStockLevelButtonClasses,
  slotUnavailableButtonClasses,
  type BagSlotDetail,
} from '@/features/transfer-stock/utils/gate-pass-matrix-utils';
import { usePreferencesStore } from '@/features/auth/store/use-preferences-store';
import { getStorageGatePassLotNo } from '@/features/transfer-stock/utils/gate-pass-matrix-utils';
import { cn } from '@/lib/utils';

/** Checkbox + gate pass + manual gate pass + variety/lot columns before size lanes. */
const FIXED_COLUMN_COUNT = 4;

/** Keep sticky `left` offsets in sync with these widths — mismatches cause overlap. */
const STICKY_COLS = {
  checkbox: { width: '2.75rem', left: '0' },
  gatePassNo: { width: '3rem', left: '2.75rem' },
  manualGatePassNo: { width: '3.5rem', left: '5.75rem' },
  varietyLot: { width: '8rem', left: '9.25rem' },
} as const;

const SIZE_LANE_MIN_WIDTH = '7.5rem';
const FIXED_COLUMNS_WIDTH = '17.25rem';

type StickyColumn = keyof typeof STICKY_COLS;

function sizeLaneClasses(_columnIndex: number, variant: 'head' | 'cell') {
  return cn(
    'border-l border-border/60 min-w-[7.5rem] px-4',
    variant === 'head' ? 'bg-muted text-center' : 'bg-background',
  );
}

/**
 * Sticky identity columns only from `md` up.
 * On mobile they overlap size lanes (sticky width vs collapsed layout); horizontal scroll is enough.
 */
function stickyHeadClass(options?: { edge?: boolean }) {
  return cn(
    'bg-muted px-2 py-2 align-bottom md:sticky md:z-20 md:left-[var(--sticky-left)]',
    options?.edge && 'border-r border-border/60 md:shadow-[2px_0_8px_-4px_rgba(0,0,0,0.12)]',
  );
}

function stickyCellClass(options?: { edge?: boolean }) {
  return cn(
    'bg-background px-2 transition-colors md:sticky md:z-10 md:left-[var(--sticky-left)]',
    'group-hover/row:bg-muted/40 group-data-[selected=true]/row:bg-primary/[0.06]',
    options?.edge && 'border-r border-border/60 md:shadow-[2px_0_8px_-4px_rgba(0,0,0,0.12)]',
  );
}

function columnWidthStyle(column: StickyColumn): CSSProperties {
  const { width, left } = STICKY_COLS[column];
  return {
    width,
    minWidth: width,
    maxWidth: width,
    // CSS custom property consumed by md:left-[var(--sticky-left)]
    ['--sticky-left' as string]: left,
  };
}

function ColumnHeader({ children, title }: { children: ReactNode; title?: string }) {
  return (
    <span
      className="text-muted-foreground block text-center text-[11px] leading-tight font-medium tracking-wide whitespace-normal"
      title={title}
    >
      {children}
    </span>
  );
}

function LotNoDisplay({ lotNo }: { lotNo: string }) {
  if (lotNo === '—') return null;

  const slashIndex = lotNo.indexOf('/');
  if (slashIndex === -1) {
    return (
      <span className="text-muted-foreground truncate font-mono text-xs tabular-nums">{lotNo}</span>
    );
  }

  const identifier = lotNo.slice(0, slashIndex);
  const total = lotNo.slice(slashIndex + 1);
  const identifierNum = Number(identifier);
  const totalNum = Number(total);

  return (
    <span className="text-muted-foreground font-mono text-xs tabular-nums">
      {Number.isNaN(identifierNum) ? identifier : identifierNum.toLocaleString('en-IN')}
      <span className="text-muted-foreground/70">
        {' / '}
        {Number.isNaN(totalNum) ? total : totalNum.toLocaleString('en-IN')}
      </span>
    </span>
  );
}

function GatePassNoCell({ pass }: { pass: StorageGatePass }) {
  return (
    <span className="text-foreground font-mono text-sm font-medium tabular-nums">
      <span className="text-muted-foreground/60">#</span>
      {pass.gatePassNo.toLocaleString('en-IN')}
    </span>
  );
}

function ManualGatePassNoCell({ pass }: { pass: StorageGatePass }) {
  const manual =
    pass.manualParchiNumber?.trim() ||
    (pass.manualGatePassNumber != null ? String(pass.manualGatePassNumber) : '');

  if (!manual) {
    return <span className="text-muted-foreground/50 text-sm">—</span>;
  }

  return (
    <span
      className="text-foreground/90 block truncate font-mono text-sm tabular-nums"
      title={manual}
    >
      {manual}
    </span>
  );
}

function VarietyLotCell({ pass }: { pass: StorageGatePass }) {
  const preferences = usePreferencesStore((state) => state.preferences);
  const lotNo = useMemo(() => getStorageGatePassLotNo(pass, preferences), [pass, preferences]);
  const variety = pass.variety?.trim();

  return (
    <div className="flex min-w-0 flex-col gap-1">
      {variety ? (
        <span className="text-foreground line-clamp-2 text-sm leading-snug" title={variety}>
          {variety}
        </span>
      ) : (
        <span className="text-muted-foreground/50 text-sm">—</span>
      )}
      {lotNo !== '—' ? <LotNoDisplay lotNo={lotNo} /> : null}
    </div>
  );
}

function EmptySeat() {
  return (
    <Button
      type="button"
      variant="outline"
      disabled
      tabIndex={-1}
      className="h-11 min-w-[7.5rem] border-dashed opacity-100"
      aria-hidden
    />
  );
}

function SelectedQuantityBadge({ quantity }: { quantity: number }) {
  return (
    <Badge
      className="border-background pointer-events-none absolute top-0 right-0 z-10 h-5 min-w-7 translate-x-1/2 -translate-y-1/2 border px-1.5 tabular-nums shadow-sm"
      aria-hidden
    >
      {quantity.toLocaleString('en-IN')}
    </Badge>
  );
}

function SlotButton({
  pass,
  sizeName,
  slot,
  selectedQty,
  previouslyIssued = 0,
  allocationMode = 'create',
  onClick,
}: {
  pass: StorageGatePass;
  sizeName: string;
  slot: BagSlotDetail;
  selectedQty: number;
  previouslyIssued?: number;
  allocationMode?: 'create' | 'edit';
  onClick: () => void;
}) {
  const isSelected = selectedQty > 0;
  const currentQty = slot.currentQuantity;
  const initialQty = slot.initialQuantity;
  const isUnavailable =
    allocationMode === 'edit'
      ? isSlotUnavailable(currentQty) && previouslyIssued <= 0
      : isSlotUnavailable(currentQty);
  const stockLevel = getSlotStockLevel(currentQty, initialQty);
  const showSelectedBadge = isSelected && !isUnavailable;

  return (
    <Button
      type="button"
      variant="outline"
      disabled={isUnavailable}
      onClick={onClick}
      className={cn(
        'relative h-auto min-h-11 min-w-[7.5rem] flex-col items-stretch justify-start gap-0.5 rounded-md px-2 py-1.5 text-left font-normal',
        isUnavailable
          ? slotUnavailableButtonClasses()
          : slotStockLevelButtonClasses(stockLevel, isSelected),
        showSelectedBadge &&
          'border-primary bg-primary/5 ring-primary/30 hover:bg-primary/5 ring-2',
      )}
      aria-label={
        isUnavailable
          ? `${pass.variety}, ${sizeName}, ${formatLocationShort(slot)}, no stock remaining`
          : `${pass.variety}, ${sizeName}, ${formatLocationShort(slot)}, ${isSelected ? `${selectedQty} of ${currentQty} selected` : `${currentQty} of ${initialQty} bags`}`
      }
    >
      {showSelectedBadge ? <SelectedQuantityBadge quantity={selectedQty} /> : null}
      <span
        className={cn(
          'flex items-center gap-0.5 text-xs',
          isUnavailable ? 'text-muted-foreground/75' : 'text-muted-foreground',
        )}
      >
        <MapPin className="size-3 shrink-0" aria-hidden />
        <span className="truncate">{formatLocationShort(slot)}</span>
      </span>
      <span
        className={cn(
          'w-full text-right text-sm font-medium tabular-nums',
          isUnavailable ? 'text-muted-foreground/80' : 'text-foreground',
        )}
      >
        {currentQty.toLocaleString('en-IN')}
        <span className={isUnavailable ? 'text-muted-foreground/60' : 'text-muted-foreground'}>
          {' / '}
          {initialQty.toLocaleString('en-IN')}
        </span>
      </span>
    </Button>
  );
}

function GatePassSizeCell({
  pass,
  sizeName,
  allocations,
  baselineAllocations,
  allocationMode = 'create',
  onSlotClick,
}: {
  pass: StorageGatePass;
  sizeName: string;
  allocations: Record<string, number>;
  baselineAllocations?: Record<string, number>;
  allocationMode?: 'create' | 'edit';
  onSlotClick: (pass: StorageGatePass, sizeName: string, slot: BagSlotDetail) => void;
}) {
  const slots = getBagSlotsForSize(pass, sizeName);

  if (slots.length === 0) {
    return <EmptySeat />;
  }

  return (
    <div className="flex min-w-[7.5rem] flex-col gap-2 overflow-visible pt-1">
      {slots.map((slot) => {
        const key = allocationKey(pass._id, sizeName, slot.bagIndex);
        const selectedQty = allocations[key] ?? 0;
        const previouslyIssued = baselineAllocations?.[key] ?? 0;
        return (
          <SlotButton
            key={key}
            pass={pass}
            sizeName={sizeName}
            slot={slot}
            selectedQty={selectedQty}
            previouslyIssued={previouslyIssued}
            allocationMode={allocationMode}
            onClick={() => onSlotClick(pass, sizeName, slot)}
          />
        );
      })}
    </div>
  );
}

type TransferGatePassMatrixProps = {
  displayGroups: DatePassGroup[];
  visibleSizes: string[];
  selectedPassIds: Set<string>;
  onPassToggle: (passId: string) => void;
  allocations: Record<string, number>;
  onAllocationChange: (key: string, quantity: number) => void;
  onAllocationClear: (key: string) => void;
  hasFilteredData?: boolean;
  hasActiveFilters?: boolean;
  varietyFilterMode?: VarietyFilterMode;
  allocationMode?: 'create' | 'edit';
  baselineAllocations?: Record<string, number>;
};

export function TransferGatePassMatrix({
  displayGroups,
  visibleSizes,
  selectedPassIds,
  onPassToggle,
  allocations,
  onAllocationChange,
  onAllocationClear,
  hasFilteredData = true,
  hasActiveFilters = false,
  varietyFilterMode = 'single-required',
  allocationMode = 'create',
  baselineAllocations = {},
}: TransferGatePassMatrixProps) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetTarget, setSheetTarget] = useState<AllocationSheetTarget | null>(null);

  const columnCount = FIXED_COLUMN_COUNT + visibleSizes.length;

  const handleSlotClick = useCallback(
    (pass: StorageGatePass, sizeName: string, slot: BagSlotDetail) => {
      const key = allocationKey(pass._id, sizeName, slot.bagIndex);
      const previouslyIssued = baselineAllocations[key] ?? 0;
      const blocked =
        allocationMode === 'edit'
          ? isSlotUnavailable(slot.currentQuantity) && previouslyIssued <= 0
          : isSlotUnavailable(slot.currentQuantity);

      if (blocked) return;

      setSheetTarget({
        pass,
        sizeName,
        slot,
        allocationKey: key,
        currentQuantity: slot.currentQuantity,
      });
      setSheetOpen(true);
    },
    [allocationMode, baselineAllocations],
  );

  const sheetInitialQty = sheetTarget ? (allocations[sheetTarget.allocationKey] ?? 0) : 0;
  const sheetPreviouslyIssued = sheetTarget
    ? (baselineAllocations[sheetTarget.allocationKey] ?? 0)
    : 0;

  if (!hasFilteredData) {
    return (
      <Card size="sm" className="ring-border/60 overflow-hidden py-0 shadow-sm">
        <CardContent className="px-0 py-0">
          <Empty className="border-0 py-12">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <ClipboardList />
              </EmptyMedia>
              <EmptyTitle>
                {hasActiveFilters ? 'No matching gate passes' : 'No gate passes to show'}
              </EmptyTitle>
              <EmptyDescription>
                {hasActiveFilters
                  ? 'Try different filters or clear the search.'
                  : varietyFilterMode === 'multi-optional'
                    ? 'No gate passes match the current filters, or check back when stock is available.'
                    : 'Choose a variety to display gate passes, or check back when stock is available.'}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card size="sm" className="ring-border/60 min-w-0 overflow-hidden py-0 shadow-sm">
        <CardContent className="min-w-0 overflow-hidden px-0 py-0">
          <div className="w-full min-w-0 overflow-x-auto overscroll-x-contain **:data-[slot=table-container]:overflow-visible">
            <Table
              className="w-max min-w-full border-separate border-spacing-0"
              style={{
                minWidth: `calc(${FIXED_COLUMNS_WIDTH} + (${visibleSizes.length} * ${SIZE_LANE_MIN_WIDTH}))`,
              }}
            >
              <colgroup>
                <col style={{ width: STICKY_COLS.checkbox.width }} />
                <col style={{ width: STICKY_COLS.gatePassNo.width }} />
                <col style={{ width: STICKY_COLS.manualGatePassNo.width }} />
                <col style={{ width: STICKY_COLS.varietyLot.width }} />
                {visibleSizes.map((sizeName) => (
                  <col
                    key={sizeName}
                    style={{ width: SIZE_LANE_MIN_WIDTH, minWidth: SIZE_LANE_MIN_WIDTH }}
                  />
                ))}
              </colgroup>
              <TableHeader className="border-border/60 bg-muted sticky top-0 z-30 border-b [&_tr]:hover:bg-transparent">
                <TableRow>
                  <TableHead
                    className={cn('h-11', stickyHeadClass())}
                    style={columnWidthStyle('checkbox')}
                  >
                    <span className="sr-only">Select voucher</span>
                  </TableHead>
                  <TableHead
                    className={cn('h-11', stickyHeadClass())}
                    style={columnWidthStyle('gatePassNo')}
                  >
                    <ColumnHeader title="Gate pass no.">gp</ColumnHeader>
                  </TableHead>
                  <TableHead
                    className={cn('h-11', stickyHeadClass())}
                    style={columnWidthStyle('manualGatePassNo')}
                  >
                    <ColumnHeader title="Manual gate pass no.">manual</ColumnHeader>
                  </TableHead>
                  <TableHead
                    className={cn('h-11', stickyHeadClass({ edge: true }))}
                    style={columnWidthStyle('varietyLot')}
                  >
                    <ColumnHeader title="Variety & lot no.">variety</ColumnHeader>
                  </TableHead>
                  {visibleSizes.map((sizeName, index) => (
                    <TableHead
                      key={sizeName}
                      className={cn(
                        'text-muted-foreground h-11 px-3',
                        sizeLaneClasses(FIXED_COLUMN_COUNT + index, 'head'),
                      )}
                    >
                      <span className="text-foreground block w-full text-center text-xs font-medium whitespace-nowrap">
                        {sizeName}
                      </span>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayGroups.map((group) => (
                  <Fragment key={group.dateKey}>
                    <TableRow className="hover:bg-transparent">
                      <TableCell
                        colSpan={columnCount}
                        className="border-border/40 bg-muted/30 border-b px-4 py-2"
                      >
                        <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                          {group.dateLabel}
                        </span>
                      </TableCell>
                    </TableRow>
                    {group.passes.map((pass) => (
                      <TableRow
                        key={pass._id}
                        className="group/row border-border/40 hover:bg-muted/20 border-b transition-colors"
                        data-selected={selectedPassIds.has(pass._id) || undefined}
                      >
                        <TableCell
                          className={cn('py-3 align-top', stickyCellClass())}
                          style={columnWidthStyle('checkbox')}
                        >
                          <Checkbox
                            checked={selectedPassIds.has(pass._id)}
                            onCheckedChange={() => onPassToggle(pass._id)}
                            aria-label={`Select gate pass ${pass.gatePassNo}`}
                          />
                        </TableCell>
                        <TableCell
                          className={cn('py-3 align-top', stickyCellClass())}
                          style={columnWidthStyle('gatePassNo')}
                        >
                          <GatePassNoCell pass={pass} />
                        </TableCell>
                        <TableCell
                          className={cn('py-3 align-top', stickyCellClass())}
                          style={columnWidthStyle('manualGatePassNo')}
                        >
                          <ManualGatePassNoCell pass={pass} />
                        </TableCell>
                        <TableCell
                          className={cn('py-3 align-top', stickyCellClass({ edge: true }))}
                          style={columnWidthStyle('varietyLot')}
                        >
                          <VarietyLotCell pass={pass} />
                        </TableCell>
                        {visibleSizes.map((sizeName, index) => (
                          <TableCell
                            key={sizeName}
                            className={cn(
                              'overflow-visible py-3 align-top',
                              sizeLaneClasses(FIXED_COLUMN_COUNT + index, 'cell'),
                            )}
                          >
                            <GatePassSizeCell
                              pass={pass}
                              sizeName={sizeName}
                              allocations={allocations}
                              baselineAllocations={baselineAllocations}
                              allocationMode={allocationMode}
                              onSlotClick={handleSlotClick}
                            />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </Fragment>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {allocationMode === 'edit' ? (
        <OutgoingAllocationSheet
          open={sheetOpen}
          onOpenChange={setSheetOpen}
          target={sheetTarget}
          initialQuantity={sheetInitialQty}
          previouslyIssued={sheetPreviouslyIssued}
          onApply={onAllocationChange}
          onClear={onAllocationClear}
        />
      ) : (
        <TransferAllocationSheet
          open={sheetOpen}
          onOpenChange={setSheetOpen}
          target={sheetTarget}
          initialQuantity={sheetInitialQty}
          onApply={onAllocationChange}
          onClear={onAllocationClear}
        />
      )}
    </>
  );
}
