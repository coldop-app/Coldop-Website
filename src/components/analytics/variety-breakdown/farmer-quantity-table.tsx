import { memo } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { QuantityType } from './types';

/** Row when a single size is selected */
export interface FarmerQuantityRow {
  farmerName: string;
  quantity: number;
  percentage: number;
}

/** Row when "All sizes" is selected: one column per bag size */
export interface FarmerQuantityRowAllSizes {
  farmerName: string;
  quantitiesBySize: Record<string, number>;
  total: number;
  percentage: number;
}

export interface FarmerQuantityTableProps {
  /** Single-size rows (when sizeColumns is not provided) */
  rows: FarmerQuantityRow[];
  quantityType: QuantityType;
  /** e.g. "Goli" or "All sizes" */
  sizeLabel?: string;
  /** When "All sizes" is selected: list of size labels to show as columns. Rows must be all-sizes format. */
  sizeColumns?: string[];
  /** When single size is selected: rows in all-sizes format (quantitiesBySize, total, percentage). Ignored if sizeColumns is set. */
  rowsAllSizes?: FarmerQuantityRowAllSizes[];
  /** When a single size tab is selected, use this as the quantity column heading (e.g. "5kg"). */
  quantityColumnLabel?: string;
}

const QUANTITY_COLUMN_LABEL: Record<QuantityType, string> = {
  current: 'Current quantity',
  initial: 'Initial quantity',
  outgoing: 'Outgoing quantity',
};

const FarmerQuantityTable = memo(function FarmerQuantityTable({
  rows,
  quantityType,
  sizeLabel,
  sizeColumns,
  rowsAllSizes,
  quantityColumnLabel,
}: FarmerQuantityTableProps) {
  const isAllSizes = Array.isArray(sizeColumns) && sizeColumns.length > 0 && Array.isArray(rowsAllSizes);
  const displayRows = isAllSizes ? rowsAllSizes : rows;

  if (displayRows.length === 0) {
    return (
      <Card className="border-border rounded-xl shadow-sm">
        <CardHeader className="pb-2">
          <h3 className="font-custom text-foreground text-base font-semibold sm:text-lg">
            Farmer-wise quantity
          </h3>
          {sizeLabel && (
            <p className="font-custom text-muted-foreground text-xs">
              {sizeLabel} · {QUANTITY_COLUMN_LABEL[quantityType]}
            </p>
          )}
        </CardHeader>
        <CardContent>
          <p className="font-custom text-muted-foreground text-sm">
            No farmers for this selection.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border rounded-xl shadow-sm">
      <CardHeader className="pb-2">
        <h3 className="font-custom text-foreground text-base font-semibold sm:text-lg">
          Farmer-wise quantity
        </h3>
        {sizeLabel && (
          <p className="font-custom text-muted-foreground text-xs">
            {sizeLabel} · {QUANTITY_COLUMN_LABEL[quantityType]}
          </p>
        )}
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-custom font-medium">Farmer</TableHead>
              {isAllSizes ? (
                <>
                  {sizeColumns!.map((size) => (
                    <TableHead
                      key={size}
                      className="font-custom text-right font-medium"
                    >
                      {size}
                    </TableHead>
                  ))}
                  <TableHead className="font-custom text-right font-medium">
                    Total
                  </TableHead>
                </>
              ) : (
                <TableHead className="font-custom text-right font-medium">
                  {quantityColumnLabel ?? 'Quantity (bags)'}
                </TableHead>
              )}
              <TableHead className="font-custom text-right font-medium">
                Share
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isAllSizes
              ? (rowsAllSizes!).map((row) => (
                  <TableRow key={row.farmerName}>
                    <TableCell className="font-custom">{row.farmerName}</TableCell>
                    {sizeColumns!.map((size) => (
                      <TableCell
                        key={size}
                        className="font-custom text-right tabular-nums"
                      >
                        {(row.quantitiesBySize[size] ?? 0).toLocaleString('en-IN')}
                      </TableCell>
                    ))}
                    <TableCell className="font-custom text-right tabular-nums font-medium">
                      {row.total.toLocaleString('en-IN')}
                    </TableCell>
                    <TableCell className="font-custom text-right tabular-nums text-muted-foreground">
                      {row.percentage.toFixed(1)}%
                    </TableCell>
                  </TableRow>
                ))
              : rows.map((row) => (
                  <TableRow key={row.farmerName}>
                    <TableCell className="font-custom">{row.farmerName}</TableCell>
                    <TableCell className="font-custom text-right tabular-nums">
                      {row.quantity.toLocaleString('en-IN')}
                    </TableCell>
                    <TableCell className="font-custom text-right tabular-nums text-muted-foreground">
                      {row.percentage.toFixed(1)}%
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
});

export default FarmerQuantityTable;
