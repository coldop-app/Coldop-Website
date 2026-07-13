import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import type {
  DaybookEntry,
  IncomingDaybookEntry,
  OutgoingDaybookEntry,
} from '@/features/daybook/types';
import { FarmerStockSummaryCellBreakdownDialog } from '@/features/people/components/farmer-stock-summary-cell-breakdown-dialog';
import {
  buildStockSummaryCellBreakdown,
  type StockFilterTab,
  type StockQuantityMode,
  type StockSummaryMatrix,
} from '@/features/people/utils/build-farmer-stock-summary';

import {
  getCellClassName,
  getFooterClassName,
  getHeadClassName,
  stockSummaryAccentBgClass,
  stockSummaryAccentHoverClass,
  stockSummaryAccentTextClass,
  TABLE_GRID_CLASS,
} from './farmer-stock-summary-table-styles';

const bagCountFormatter = new Intl.NumberFormat('en-IN');

type SelectedCell = {
  variety: string;
  size: string;
  total: number;
};

type FarmerStockSummaryTableProps = {
  matrix: StockSummaryMatrix;
  passes: IncomingDaybookEntry[];
  outgoingPasses?: OutgoingDaybookEntry[];
  allEntries?: DaybookEntry[];
  stockFilterTab: StockFilterTab;
  quantityMode: StockQuantityMode;
};

export function FarmerStockSummaryTable({
  matrix,
  passes,
  outgoingPasses,
  allEntries,
  stockFilterTab,
  quantityMode,
}: FarmerStockSummaryTableProps) {
  const [isHeaderScrolled, setIsHeaderScrolled] = useState(false);
  const [selectedCell, setSelectedCell] = useState<SelectedCell | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { sizeColumns, rows, footerBySize, grandTotal } = matrix;
  const hasRows = rows.length > 0;
  const accentTextClass = stockSummaryAccentTextClass(quantityMode);
  const accentBgClass = stockSummaryAccentBgClass(quantityMode);
  const accentHoverClass = stockSummaryAccentHoverClass(quantityMode);

  const breakdownLines = useMemo(() => {
    if (!selectedCell) return [];

    return buildStockSummaryCellBreakdown({
      passes,
      outgoingPasses,
      allEntries,
      stockFilterTab,
      quantityMode,
      variety: selectedCell.variety,
      size: selectedCell.size,
    });
  }, [allEntries, outgoingPasses, passes, quantityMode, selectedCell, stockFilterTab]);

  const handleTableScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    setIsHeaderScrolled(el.scrollTop > 0);
  }, []);

  useEffect(() => {
    setSelectedCell(null);
  }, [quantityMode, stockFilterTab]);

  useEffect(() => {
    handleTableScroll();
  }, [handleTableScroll, rows.length]);

  const handleCellClick = (variety: string, size: string, total: number) => {
    if (total <= 0) return;
    setSelectedCell({ variety, size, total });
  };

  if (!hasRows) {
    return (
      <div className="border-border text-muted-foreground flex min-h-32 items-center justify-center rounded-lg border px-4 text-sm">
        No stock found for this filter.
      </div>
    );
  }

  return (
    <>
      <div className="border-border min-w-0 overflow-hidden rounded-lg border">
        <div
          ref={scrollContainerRef}
          onScroll={handleTableScroll}
          className="max-h-[min(70vh,42rem)] overflow-auto **:data-[slot=table-container]:overflow-visible"
        >
          <Table className={TABLE_GRID_CLASS}>
            <TableHeader
              className={cn(
                'sticky top-0 z-10 [&_tr]:border-0 [&_tr]:hover:bg-transparent',
                isHeaderScrolled && 'shadow-border/80 shadow-[0_1px_0_0]',
              )}
            >
              <TableRow className="border-0">
                <TableHead className={getHeadClassName({ sticky: true }, isHeaderScrolled)}>
                  Varieties
                </TableHead>

                {sizeColumns.map((size) => (
                  <TableHead
                    key={size}
                    className={getHeadClassName(
                      { numeric: true, align: 'right' },
                      isHeaderScrolled,
                    )}
                  >
                    {size}
                  </TableHead>
                ))}

                <TableHead
                  className={getHeadClassName({ numeric: true, align: 'right' }, isHeaderScrolled)}
                >
                  Total
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody className="[&_tr:last-child]:border-0">
              {rows.map((row) => (
                <TableRow key={row.variety} className="even:bg-muted/20 hover:bg-muted/40 border-0">
                  <TableCell className={getCellClassName({ sticky: true })} title={row.variety}>
                    <span className="block max-w-40 truncate font-medium sm:max-w-none">
                      {row.variety}
                    </span>
                  </TableCell>

                  {sizeColumns.map((size) => {
                    const value = row.bySize[size] ?? 0;
                    const isClickable = value > 0;

                    return (
                      <TableCell
                        key={`${row.variety}-${size}`}
                        className={cn(
                          getCellClassName({
                            numeric: true,
                            align: 'right',
                          }),
                          value === 0 && 'text-muted-foreground font-normal',
                          isClickable &&
                            cn(
                              'focus-visible:ring-ring/30 cursor-pointer transition-colors focus-visible:ring-2 focus-visible:outline-none',
                              accentHoverClass,
                            ),
                        )}
                        tabIndex={isClickable ? 0 : undefined}
                        role={isClickable ? 'button' : undefined}
                        aria-label={
                          isClickable
                            ? `View breakdown for ${row.variety}, ${size}, ${bagCountFormatter.format(value)} bags`
                            : undefined
                        }
                        onClick={
                          isClickable ? () => handleCellClick(row.variety, size, value) : undefined
                        }
                        onKeyDown={
                          isClickable
                            ? (event) => {
                                if (event.key === 'Enter' || event.key === ' ') {
                                  event.preventDefault();
                                  handleCellClick(row.variety, size, value);
                                }
                              }
                            : undefined
                        }
                      >
                        {bagCountFormatter.format(value)}
                      </TableCell>
                    );
                  })}

                  <TableCell
                    className={cn(
                      getCellClassName({
                        numeric: true,
                        align: 'right',
                      }),
                      accentTextClass,
                    )}
                  >
                    {bagCountFormatter.format(row.total)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>

            <TableFooter className="bg-muted/30 [&_tr]:border-0">
              <TableRow className="border-0 hover:bg-transparent">
                <TableCell className={getFooterClassName({ sticky: true })}>Bag Total</TableCell>

                {sizeColumns.map((size) => (
                  <TableCell
                    key={`footer-${size}`}
                    className={getFooterClassName({
                      numeric: true,
                      align: 'right',
                    })}
                  >
                    {bagCountFormatter.format(footerBySize[size] ?? 0)}
                  </TableCell>
                ))}

                <TableCell
                  className={cn(
                    getFooterClassName({ numeric: true, align: 'right' }),
                    accentBgClass,
                    accentTextClass,
                  )}
                >
                  {bagCountFormatter.format(grandTotal)}
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </div>
      </div>

      {selectedCell ? (
        <FarmerStockSummaryCellBreakdownDialog
          open={Boolean(selectedCell)}
          onOpenChange={(open) => {
            if (!open) setSelectedCell(null);
          }}
          variety={selectedCell.variety}
          size={selectedCell.size}
          total={selectedCell.total}
          lines={breakdownLines}
          quantityMode={quantityMode}
        />
      ) : null}
    </>
  );
}
