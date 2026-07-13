import { useState } from 'react';
import { MapPin, Package2 } from 'lucide-react';
import { AllocationQuantitySummary } from '@/features/outgoing/forms/allocation-quantity-summary';
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
import type { AllocationSheetTarget } from '@/features/transfer-stock/forms/transfer-allocation-sheet';
import { formatLocationShort } from '@/features/transfer-stock/utils/gate-pass-matrix-utils';
import { numericInputProps } from '@/lib/form-utils';

type OutgoingAllocationSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  target: AllocationSheetTarget | null;
  initialQuantity: number;
  previouslyIssued: number;
  onApply: (key: string, quantity: number) => void;
  onClear: (key: string) => void;
};

function validateOutgoingQuantity(value: string, maxToIssue: number): string | null {
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
  if (parsed > maxToIssue) {
    return `Quantity cannot exceed ${maxToIssue.toLocaleString('en-IN')} bags.`;
  }
  return null;
}

export function OutgoingAllocationSheet({
  open,
  onOpenChange,
  target,
  initialQuantity,
  previouslyIssued,
  onApply,
  onClear,
}: OutgoingAllocationSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="flex max-h-[90dvh] flex-col gap-0 p-0 sm:mx-auto sm:max-w-md sm:rounded-t-xl"
      >
        <SheetHeader className="border-border/40 border-b px-5 py-4 text-left">
          <SheetTitle className="font-heading text-base font-semibold">
            Edit outgoing quantity
          </SheetTitle>
          <SheetDescription className="text-xs">
            Adjust how many bags to issue from this slot.
          </SheetDescription>
        </SheetHeader>

        {target && open ? (
          <OutgoingAllocationSheetBody
            key={target.allocationKey}
            target={target}
            initialQuantity={initialQuantity}
            previouslyIssued={previouslyIssued}
            onApply={onApply}
            onClear={onClear}
            onClose={() => onOpenChange(false)}
          />
        ) : null}

        {!target ? (
          <SheetFooter className="border-border/40 flex-row gap-2 border-t px-5 py-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </SheetFooter>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

function OutgoingAllocationSheetBody({
  target,
  initialQuantity,
  previouslyIssued,
  onApply,
  onClear,
  onClose,
}: {
  target: AllocationSheetTarget;
  initialQuantity: number;
  previouslyIssued: number;
  onApply: (key: string, quantity: number) => void;
  onClear: (key: string) => void;
  onClose: () => void;
}) {
  const [quantityInput, setQuantityInput] = useState(() =>
    initialQuantity > 0 ? String(initialQuantity) : '',
  );
  const [quantityError, setQuantityError] = useState<string | null>(null);

  const maxToIssue = target.slot.currentQuantity + previouslyIssued;
  const issuingNow = Number.parseInt(quantityInput.trim(), 10);
  const parsedIssuingNow = quantityInput.trim() === '' || Number.isNaN(issuingNow) ? 0 : issuingNow;

  const handleQuantityChange = (value: string) => {
    setQuantityInput(value);
    if (quantityError) {
      setQuantityError(validateOutgoingQuantity(value, maxToIssue));
    }
  };

  const handleApply = () => {
    const error = validateOutgoingQuantity(quantityInput, maxToIssue);
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
                Gate pass{' '}
                <span className="font-mono tabular-nums">
                  #{target.pass.gatePassNo.toLocaleString('en-IN')}
                </span>
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
          </CardContent>
        </Card>

        <AllocationQuantitySummary
          previouslyIssued={previouslyIssued}
          maxToIssue={maxToIssue}
          issuingNow={parsedIssuingNow}
        />

        <Field data-invalid={quantityError ? true : undefined}>
          <FieldLabel htmlFor="outgoing-allocation-qty">Quantity to issue</FieldLabel>
          <Input
            {...numericInputProps}
            id="outgoing-allocation-qty"
            value={quantityInput}
            onChange={(e) => handleQuantityChange(e.target.value)}
            aria-invalid={quantityError ? true : undefined}
            className="tabular-nums"
            inputMode="numeric"
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
              Enter a value from 1 to {maxToIssue.toLocaleString('en-IN')}.
            </FieldDescription>
          )}
        </Field>
      </div>

      <SheetFooter className="border-border/40 flex-row gap-2 border-t px-5 py-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        {initialQuantity > 0 ? (
          <Button type="button" variant="destructive" onClick={handleClear}>
            Clear
          </Button>
        ) : null}
        <Button type="button" className="flex-1" onClick={handleApply}>
          Apply
        </Button>
      </SheetFooter>
    </>
  );
}
