import { useState } from 'react';
import { MapPin, Package2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import type { StorageGatePass } from '@/features/transfer-stock/types/storage-gate-pass';
import type { BagSlotDetail } from '@/features/transfer-stock/utils/gate-pass-matrix-utils';
import { formatLocationShort } from '@/features/transfer-stock/utils/gate-pass-matrix-utils';

export type AllocationSheetTarget = {
  pass: StorageGatePass;
  sizeName: string;
  slot: BagSlotDetail;
  allocationKey: string;
  currentQuantity: number;
};

type TransferAllocationSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  target: AllocationSheetTarget | null;
  initialQuantity: number;
  onApply: (key: string, quantity: number) => void;
  onClear: (key: string) => void;
};

function validateTransferQuantity(value: string, maxAvailable: number): string | null {
  const trimmed = value.trim();
  if (trimmed === '') {
    return 'Enter a quantity.';
  }

  const parsed = Number.parseInt(trimmed, 10);
  if (Number.isNaN(parsed) || !Number.isFinite(parsed)) {
    return 'Enter a valid quantity.';
  }
  if (parsed < 1) {
    return 'Quantity must be at least 1.';
  }
  if (parsed > maxAvailable) {
    return `Quantity cannot exceed ${maxAvailable.toLocaleString('en-IN')} available bags.`;
  }
  return null;
}

export function TransferAllocationSheet({
  open,
  onOpenChange,
  target,
  initialQuantity,
  onApply,
  onClear,
}: TransferAllocationSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="flex max-h-[90dvh] flex-col gap-0 p-0 sm:mx-auto sm:max-w-md sm:rounded-t-xl"
      >
        <SheetHeader className="border-border/40 border-b px-5 py-4 text-left">
          <SheetTitle className="font-heading text-base font-semibold">
            Transfer quantity
          </SheetTitle>
          <SheetDescription className="text-xs">
            Set how many bags to transfer from this slot.
          </SheetDescription>
        </SheetHeader>

        {target && open ? (
          <AllocationSheetBody
            key={target.allocationKey}
            target={target}
            initialQuantity={initialQuantity}
            onApply={onApply}
            onClear={onClear}
            onClose={() => onOpenChange(false)}
          />
        ) : null}

        {!target ? (
          <SheetFooter className="border-border/40 flex-row gap-2 border-t px-5 py-4">
            <Button
              type="button"
              variant="outline"
              className="h-11"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
          </SheetFooter>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

function AllocationSheetBody({
  target,
  initialQuantity,
  onApply,
  onClear,
  onClose,
}: {
  target: AllocationSheetTarget;
  initialQuantity: number;
  onApply: (key: string, quantity: number) => void;
  onClear: (key: string) => void;
  onClose: () => void;
}) {
  const [quantityInput, setQuantityInput] = useState(() =>
    initialQuantity > 0 ? String(initialQuantity) : '',
  );
  const [quantityError, setQuantityError] = useState<string | null>(null);

  const maxAvailable = target.slot.currentQuantity;

  const handleQuantityChange = (value: string) => {
    setQuantityInput(value);
    if (quantityError) {
      setQuantityError(validateTransferQuantity(value, maxAvailable));
    }
  };

  const handleApply = () => {
    const error = validateTransferQuantity(quantityInput, target.slot.currentQuantity);
    if (error) {
      setQuantityError(error);
      return;
    }
    const parsed = Number.parseInt(quantityInput.trim(), 10);
    onApply(target.allocationKey, parsed);
    onClose();
  };

  const handleClear = () => {
    onClear(target.allocationKey);
    onClose();
  };

  return (
    <>
      <div className="space-y-5 overflow-y-auto px-5 py-5">
        <Card size="sm" className="bg-muted/20 ring-border/50 py-4">
          <CardContent className="space-y-2 px-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Package2 className="text-primary size-4 shrink-0" />
              <span>
                Gate pass <span className="font-mono tabular-nums">#{target.pass.gatePassNo}</span>
              </span>
            </div>
            <p className="text-foreground text-sm">{target.pass.variety}</p>
            <p className="text-muted-foreground text-sm">
              Size: <span className="text-foreground font-medium">{target.sizeName}</span>
            </p>
            <p className="text-muted-foreground flex items-start gap-1.5 text-xs">
              <MapPin className="mt-0.5 size-3.5 shrink-0" />
              {formatLocationShort(target.slot)}
            </p>
            <p className="text-sm tabular-nums">
              Available:{' '}
              <span className="text-foreground font-medium">
                {target.slot.currentQuantity.toLocaleString('en-IN')} bags
              </span>
            </p>
          </CardContent>
        </Card>

        <Field data-invalid={quantityError ? true : undefined}>
          <FieldLabel htmlFor="transfer-allocation-qty">Quantity to transfer</FieldLabel>
          <Input
            id="transfer-allocation-qty"
            type="number"
            inputMode="numeric"
            min={1}
            max={target.slot.currentQuantity}
            value={quantityInput}
            onChange={(e) => handleQuantityChange(e.target.value)}
            aria-invalid={quantityError ? true : undefined}
            className="h-11 text-base tabular-nums"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleApply();
              }
            }}
          />
          {quantityError ? (
            <FieldError>{quantityError}</FieldError>
          ) : (
            <FieldDescription>
              Enter a value from 1 to {target.slot.currentQuantity.toLocaleString('en-IN')}.
            </FieldDescription>
          )}
        </Field>
      </div>

      <SheetFooter className="border-border/40 flex-row gap-2 border-t px-5 py-4">
        <Button type="button" variant="outline" className="h-11" onClick={onClose}>
          Cancel
        </Button>
        {initialQuantity > 0 ? (
          <Button type="button" variant="destructive" className="h-11" onClick={handleClear}>
            Clear
          </Button>
        ) : null}
        <Button type="button" className="h-11 flex-1" onClick={handleApply}>
          Apply
        </Button>
      </SheetFooter>
    </>
  );
}
