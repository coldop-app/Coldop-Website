import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import type {
  StockQuantityMode,
  StockSummaryBreakdownLine,
} from '@/features/people/utils/build-farmer-stock-summary';

import {
  getCellClassName,
  getHeadClassName,
  stockSummaryAccentTextClass,
  TABLE_GRID_CLASS,
} from './farmer-stock-summary-table-styles';

const bagCountFormatter = new Intl.NumberFormat('en-IN');

type FarmerStockSummaryCellBreakdownDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  variety: string;
  size: string;
  total: number;
  lines: StockSummaryBreakdownLine[];
  quantityMode: StockQuantityMode;
};

export function FarmerStockSummaryCellBreakdownDialog({
  open,
  onOpenChange,
  variety,
  size,
  total,
  lines,
  quantityMode,
}: FarmerStockSummaryCellBreakdownDialogProps) {
  const accentTextClass = stockSummaryAccentTextClass(quantityMode);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[min(85vh,40rem)] flex-col gap-4 sm:max-w-xl">
        <DialogHeader className="gap-1 text-left">
          <DialogTitle className="font-heading text-base leading-snug font-semibold">
            <span className="text-foreground">Variety: {variety}</span>
            <span className="text-muted-foreground"> · </span>
            <span className="text-foreground">Size: {size}</span>
            <span className="text-muted-foreground"> · </span>
            <span className={cn('tabular-nums', accentTextClass)}>
              Total: {bagCountFormatter.format(total)}
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="border-border min-h-0 overflow-hidden rounded-lg border">
          <div className="max-h-[min(60vh,24rem)] overflow-auto **:data-[slot=table-container]:overflow-visible">
            <Table className={TABLE_GRID_CLASS}>
              <TableHeader className="bg-secondary sticky top-0 z-10 [&_tr]:border-0 [&_tr]:hover:bg-transparent">
                <TableRow className="border-0">
                  <TableHead className={getHeadClassName(undefined, false)}>Size</TableHead>
                  <TableHead className={getHeadClassName(undefined, false)}>Location</TableHead>
                  <TableHead className={getHeadClassName({ numeric: true, align: 'right' }, false)}>
                    Quantity
                  </TableHead>
                  {quantityMode === 'outgoing' ? (
                    <>
                      <TableHead
                        className={getHeadClassName({ numeric: true, align: 'right' }, false)}
                      >
                        Reference
                      </TableHead>
                      <TableHead
                        className={getHeadClassName({ numeric: true, align: 'right' }, false)}
                      >
                        Gate pass no.
                      </TableHead>
                      <TableHead className={getHeadClassName(undefined, false)}>
                        Manual gate pass no.
                      </TableHead>
                    </>
                  ) : (
                    <>
                      <TableHead
                        className={getHeadClassName({ numeric: true, align: 'right' }, false)}
                      >
                        Gate pass no.
                      </TableHead>
                      <TableHead className={getHeadClassName(undefined, false)}>
                        Manual parchi
                      </TableHead>
                    </>
                  )}
                </TableRow>
              </TableHeader>

              <TableBody className="[&_tr:last-child]:border-0">
                {lines.map((line, index) => (
                  <TableRow
                    key={`${line.gatePassNo}-${line.location}-${index}`}
                    className="even:bg-muted/20 border-0"
                  >
                    <TableCell className={getCellClassName(undefined)}>{line.size}</TableCell>
                    <TableCell
                      className={cn(getCellClassName(undefined), 'font-mono text-xs tabular-nums')}
                    >
                      {line.location}
                    </TableCell>
                    <TableCell className={cn(getCellClassName({ numeric: true, align: 'right' }))}>
                      {bagCountFormatter.format(line.quantity)}
                    </TableCell>
                    {quantityMode === 'outgoing' ? (
                      <>
                        <TableCell
                          className={cn(
                            getCellClassName({ numeric: true, align: 'right' }),
                            'font-mono tabular-nums',
                          )}
                        >
                          {line.reference ?? '—'}
                        </TableCell>
                        <TableCell
                          className={cn(
                            getCellClassName({ numeric: true, align: 'right' }),
                            'font-mono tabular-nums',
                          )}
                        >
                          {line.gatePassNo}
                        </TableCell>
                        <TableCell
                          className={cn(getCellClassName(undefined), 'font-mono tabular-nums')}
                        >
                          {line.manualGatePassNumber ?? '—'}
                        </TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell
                          className={cn(
                            getCellClassName({ numeric: true, align: 'right' }),
                            'font-mono tabular-nums',
                          )}
                        >
                          {line.gatePassNo}
                        </TableCell>
                        <TableCell
                          className={cn(getCellClassName(undefined), 'font-mono tabular-nums')}
                        >
                          {line.manualParchiNumber ?? '—'}
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
