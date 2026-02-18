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

export interface FarmerQuantityRow {
  farmerName: string;
  quantity: number;
  percentage: number;
}

export interface FarmerQuantityTableProps {
  rows: FarmerQuantityRow[];
  quantityType: QuantityType;
  /** e.g. "Goli" or "All sizes" */
  sizeLabel?: string;
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
}: FarmerQuantityTableProps) {
  if (rows.length === 0) {
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
              <TableHead className="font-custom text-right font-medium">
                Quantity (bags)
              </TableHead>
              <TableHead className="font-custom text-right font-medium">
                Share
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
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
