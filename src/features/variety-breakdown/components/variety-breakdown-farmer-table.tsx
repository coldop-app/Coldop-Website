import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatQuantity } from '@/features/daybook/utils/format';
import type { StockQuantityMode } from '@/features/people/utils/build-farmer-stock-summary';

import type { FarmerTableRow } from '../utils/build-farmer-distribution';

const QUANTITY_MODE_LABELS: Record<StockQuantityMode, string> = {
  current: 'Current quantity',
  initial: 'Initial quantity',
  outgoing: 'Outgoing quantity',
};

function formatShare(value: number): string {
  return `${value.toLocaleString('en-IN', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })}%`;
}

type VarietyBreakdownFarmerTableProps = {
  bagSize: string;
  quantityMode: StockQuantityMode;
  rows: FarmerTableRow[];
};

export function VarietyBreakdownFarmerTable({
  bagSize,
  quantityMode,
  rows,
}: VarietyBreakdownFarmerTableProps) {
  const total = rows.reduce((sum, row) => sum + row.bags, 0);

  return (
    <Card className="min-w-0">
      <CardHeader>
        <CardTitle className="font-heading text-base font-semibold">Farmer-wise quantity</CardTitle>
        <CardDescription>
          {bagSize} · {QUANTITY_MODE_LABELS[quantityMode]}
        </CardDescription>
      </CardHeader>

      <CardContent>
        {rows.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No farmer data for this bag size and view.
          </p>
        ) : (
          <div className="border-border overflow-hidden rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead className="text-muted-foreground h-10 px-3 font-medium">
                    Farmer
                  </TableHead>
                  <TableHead className="text-muted-foreground h-10 px-3 text-right font-medium">
                    {bagSize} (bags)
                  </TableHead>
                  <TableHead className="bg-primary/5 text-muted-foreground h-10 px-3 text-right font-medium">
                    Share
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.farmerName}>
                    <TableCell
                      className="text-foreground px-3 py-2.5 font-medium"
                      title={row.farmerName}
                    >
                      <span className="block truncate">{row.farmerName}</span>
                    </TableCell>
                    <TableCell className="text-foreground px-3 py-2.5 text-right font-medium tabular-nums">
                      {formatQuantity(row.bags)}
                    </TableCell>
                    <TableCell className="bg-primary/5 text-primary px-3 py-2.5 text-right font-medium tabular-nums">
                      {formatShare(row.share)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>

              <TableFooter className="bg-muted/30">
                <TableRow className="hover:bg-transparent">
                  <TableCell className="px-3 py-2.5 font-semibold">Total</TableCell>
                  <TableCell className="text-foreground px-3 py-2.5 text-right font-semibold tabular-nums">
                    {formatQuantity(total)}
                  </TableCell>
                  <TableCell className="bg-primary/10 text-primary px-3 py-2.5 text-right font-semibold tabular-nums">
                    100.0%
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
