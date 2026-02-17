import { memo, useCallback, useMemo } from 'react';
import { Package, MapPin, Hash, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  getEditAllocationRows,
  type EditAllocationRow,
} from '@/components/forms/outgoing/outgoing-form-utils';
import type { DaybookEntry } from '@/services/store-admin/functions/useGetDaybook';

export interface EditOutgoingAllocationsProps {
  editEntry: DaybookEntry | null | undefined;
  cellRemovedQuantities: Record<string, number>;
  setCellRemovedQuantities: React.Dispatch<
    React.SetStateAction<Record<string, number>>
  >;
}

export const EditOutgoingAllocations = memo(function EditOutgoingAllocations({
  editEntry,
  cellRemovedQuantities,
  setCellRemovedQuantities,
}: EditOutgoingAllocationsProps) {
  const rows = useMemo(
    () => getEditAllocationRows(editEntry, cellRemovedQuantities),
    [editEntry, cellRemovedQuantities]
  );

  const totalBags = useMemo(
    () => rows.reduce((sum, r) => sum + r.quantityIssued, 0),
    [rows]
  );

  const handleQuantityChange = useCallback(
    (allocationKeyValue: string, value: number) => {
      const qty = Math.max(0, Math.floor(Number(value)) || 0);
      setCellRemovedQuantities((prev) => {
        if (qty === 0) {
          const next = { ...prev };
          delete next[allocationKeyValue];
          return next;
        }
        return { ...prev, [allocationKeyValue]: qty };
      });
    },
    [setCellRemovedQuantities]
  );

  const handleRemove = useCallback(
    (allocationKeyValue: string) => {
      setCellRemovedQuantities((prev) => {
        const next = { ...prev };
        delete next[allocationKeyValue];
        return next;
      });
    },
    [setCellRemovedQuantities]
  );

  if (!editEntry) return null;

  return (
    <Card className="border-border/50 overflow-hidden shadow-sm">
      <CardHeader className="border-border/40 bg-muted/20 border-b pb-4">
        <CardTitle className="font-custom flex items-center gap-2 text-base font-semibold sm:text-lg">
          <Package className="text-primary h-5 w-5 shrink-0" />
          Issued quantities
        </CardTitle>
        <p className="text-muted-foreground font-custom mt-1 text-sm">
          Update quantities below. These are the bags currently allocated to
          this outgoing order.
        </p>
      </CardHeader>
      <CardContent className="p-0">
        {rows.length === 0 ? (
          <div className="text-muted-foreground font-custom border-border/40 flex flex-col items-center justify-center gap-2 border-t py-10 text-center text-sm">
            <Package className="h-10 w-10 opacity-50" />
            <p>No quantities allocated to this order yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-custom text-muted-foreground/90 w-[100px] font-medium">
                    <span className="flex items-center gap-1.5">
                      <Hash className="h-3.5 w-3.5" />
                      Ref
                    </span>
                  </TableHead>
                  <TableHead className="font-custom text-muted-foreground/90 font-medium">
                    <span className="flex items-center gap-1.5">
                      <Package className="h-3.5 w-3.5" />
                      Size
                    </span>
                  </TableHead>
                  <TableHead className="font-custom text-muted-foreground/90 hidden font-medium sm:table-cell">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5" />
                      Location
                    </span>
                  </TableHead>
                  <TableHead className="font-custom text-muted-foreground/90 w-[120px] text-right font-medium">
                    Quantity
                  </TableHead>
                  <TableHead className="w-[56px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <EditAllocationRowCell
                    key={row.key}
                    row={row}
                    onQuantityChange={handleQuantityChange}
                    onRemove={handleRemove}
                  />
                ))}
              </TableBody>
              <TableFooter>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableCell
                    colSpan={3}
                    className="font-custom text-foreground py-3 font-semibold"
                  >
                    Total bags
                  </TableCell>
                  <TableCell className="font-custom text-primary py-3 text-right font-semibold">
                    {totalBags.toLocaleString('en-IN')}
                  </TableCell>
                  <TableCell className="w-[56px]" />
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

interface EditAllocationRowCellProps {
  row: EditAllocationRow;
  onQuantityChange: (allocationKeyValue: string, value: number) => void;
  onRemove: (allocationKeyValue: string) => void;
}

const EditAllocationRowCell = memo(function EditAllocationRowCell({
  row,
  onQuantityChange,
  onRemove,
}: EditAllocationRowCellProps) {
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = e.target.value;
      const num = v === '' ? 0 : parseInt(v, 10);
      if (!Number.isNaN(num)) onQuantityChange(row.key, num);
    },
    [row.key, onQuantityChange]
  );

  return (
    <TableRow className="border-border/40 hover:bg-muted/20">
      <TableCell className="font-custom text-foreground/90 py-2.5 font-medium">
        #{row.gatePassNo}
      </TableCell>
      <TableCell className="font-custom text-foreground py-2.5">
        {row.size}
      </TableCell>
      <TableCell className="text-muted-foreground font-custom hidden py-2.5 text-sm sm:table-cell">
        {row.location}
      </TableCell>
      <TableCell className="py-2.5 text-right">
        <Input
          type="number"
          min={0}
          step={1}
          value={row.quantityIssued}
          onChange={handleInputChange}
          className="font-custom h-9 w-20 text-right tabular-nums"
          aria-label={`Quantity for ${row.size} from voucher #${row.gatePassNo}`}
        />
      </TableCell>
      <TableCell className="py-2.5">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive h-8 w-8"
          onClick={() => onRemove(row.key)}
          aria-label={`Remove ${row.size} from voucher #${row.gatePassNo}`}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
});
