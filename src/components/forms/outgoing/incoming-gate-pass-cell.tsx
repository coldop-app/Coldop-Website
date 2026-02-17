import { memo, useState, useCallback } from 'react';
import { MapPin, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Item, ItemContent, ItemTitle } from '@/components/ui/item';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FieldLabel } from '@/components/ui/field';

export interface IncomingGatePassCellLocation {
  chamber?: string;
  floor?: string;
  row?: string;
}

export interface IncomingGatePassCellProps {
  variety: string;
  currentQuantity: number;
  initialQuantity: number;
  /** Quantity user has entered to remove; shown in badge when > 0 */
  removedQuantity: number;
  onQuantityChange: (quantity: number) => void;
  onQuickRemove: (e: React.MouseEvent) => void;
  disabled?: boolean;
  location?: IncomingGatePassCellLocation;
  /** Short label for this location when multiple cells for same size (e.g. "A 1 R1") */
  locationLabel?: string;
}

function getBorderByPercentage(
  initialQuantity: number,
  currentQuantity: number
): string {
  const percentage =
    initialQuantity > 0 ? (currentQuantity / initialQuantity) * 100 : 100;
  return percentage < 10
    ? 'border-destructive/50 border'
    : percentage < 100
      ? 'border-amber-500/50 border dark:border-amber-400/50'
      : '';
}

export const IncomingGatePassCell = memo(function IncomingGatePassCell({
  variety,
  currentQuantity,
  initialQuantity,
  removedQuantity,
  onQuantityChange,
  onQuickRemove,
  disabled,
  location,
  locationLabel,
}: IncomingGatePassCellProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const quantity = removedQuantity;
  const hasQuantity = quantity !== undefined && quantity > 0;
  const isActive = hasQuantity;

  const borderByPercentage = getBorderByPercentage(
    initialQuantity,
    currentQuantity
  );

  const handleClick = useCallback(() => {
    if (disabled) return;
    setInputValue(removedQuantity > 0 ? String(removedQuantity) : '');
    setDialogOpen(true);
  }, [disabled, removedQuantity]);

  const handleDialogOpenChange = useCallback((open: boolean) => {
    setDialogOpen(open);
    if (!open) setInputValue('');
  }, []);

  const maxQuantity = currentQuantity;

  const quantityError = (() => {
    const trimmed = inputValue.trim();
    if (!trimmed) return '';
    const parsed = parseFloat(trimmed);
    if (Number.isNaN(parsed)) return 'Please enter a valid number';
    if (parsed <= 0) return 'Quantity must be greater than 0';
    if (parsed > maxQuantity)
      return `Cannot exceed available quantity (${maxQuantity.toFixed(1)})`;
    return '';
  })();

  const handleApply = useCallback(() => {
    if (quantityError) return;
    const parsed = parseFloat(inputValue);
    const value = Number.isNaN(parsed)
      ? 0
      : Math.max(0, Math.min(currentQuantity, parsed));
    onQuantityChange(value);
    setDialogOpen(false);
    setInputValue('');
  }, [inputValue, currentQuantity, onQuantityChange, quantityError]);

  return (
    <>
      <Item
        variant="outline"
        size="sm"
        role="button"
        tabIndex={disabled ? -1 : 0}
        onClick={disabled ? undefined : handleClick}
        onKeyDown={(e) => {
          if (disabled) return;
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
          }
        }}
        className={cn(
          'hover:bg-muted/50 hover:border-muted-foreground/20 focus-visible:ring-primary relative cursor-pointer px-2 py-1.5 transition-all duration-200 outline-none hover:shadow-sm focus-visible:ring-2 focus-visible:ring-offset-2',
          isActive
            ? 'bg-primary/5 border-primary/30 shadow-sm'
            : 'bg-card/50 border-border/60',
          borderByPercentage,
          disabled &&
            'hover:border-border/60 pointer-events-none cursor-not-allowed opacity-60 hover:bg-transparent'
        )}
      >
        {hasQuantity && (
          <div className="group/badge ring-background font-custom bg-primary text-primary-foreground ring-background absolute -top-2 -right-2 z-10 flex min-h-7 min-w-[1.75rem] items-center justify-center rounded-full px-2 text-[11px] leading-none font-semibold shadow-lg ring-2 transition-all">
            {/* Quantity */}
            <span className="transition-opacity group-hover/badge:opacity-0">
              {typeof quantity === 'number' ? quantity.toFixed(1) : quantity}
            </span>

            {/* Remove Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onQuickRemove(e);
              }}
              className="hover:bg-primary/90 absolute inset-0 hidden items-center justify-center rounded-full transition-colors group-hover/badge:flex"
              aria-label="Remove quantity"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        <ItemContent className="gap-0.5">
          <ItemTitle className="font-custom text-foreground/90 truncate text-[11px] leading-tight font-medium">
            {locationLabel ? `${variety} (${locationLabel})` : variety}
          </ItemTitle>
          {location && (location.chamber || location.floor || location.row) && (
            <p className="font-custom text-muted-foreground/70 flex items-center gap-1 truncate text-[10px] leading-tight">
              <MapPin className="h-3 w-3 shrink-0" aria-hidden />
              Ch: {location.chamber ?? '—'} · F: {location.floor ?? '—'} · R:{' '}
              {location.row ?? '—'}
            </p>
          )}
          <div className="text-right">
            <p className="font-custom text-foreground text-sm leading-none font-semibold">
              {currentQuantity.toFixed(1)}
            </p>
            <p className="font-custom text-muted-foreground/70 text-[10px]">
              /{initialQuantity.toFixed(1)}
            </p>
          </div>
        </ItemContent>
      </Item>

      <Dialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
        <DialogContent
          className={cn(
            'font-custom',
            getBorderByPercentage(initialQuantity, currentQuantity)
          )}
        >
          <DialogHeader>
            <DialogTitle>Enter quantity</DialogTitle>
            <DialogDescription>
              {variety} — available: {currentQuantity.toFixed(1)} /{' '}
              {initialQuantity.toFixed(1)}
              {location &&
                (location.chamber || location.floor || location.row) && (
                  <span className="mt-1 flex items-center gap-1.5 text-xs">
                    <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
                    Ch: {location.chamber ?? '—'} · F: {location.floor ?? '—'}
                    {' · R: '}
                    {location.row ?? '—'}
                  </span>
                )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <div className="flex items-center justify-between">
              <FieldLabel className="font-custom">
                Quantity to remove
              </FieldLabel>
              {maxQuantity > 0 && (
                <span className="font-custom text-muted-foreground/70 text-xs">
                  Max: {maxQuantity.toFixed(1)}
                </span>
              )}
            </div>
            <Input
              type="number"
              min={0}
              max={maxQuantity}
              step={0.1}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  if (!quantityError) handleApply();
                }
              }}
              className={cn(
                'font-custom [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none',
                quantityError &&
                  'border-destructive focus-visible:ring-destructive/20'
              )}
              aria-invalid={!!quantityError}
              placeholder="0"
            />
            {quantityError && (
              <p className="font-custom text-destructive text-xs">
                {quantityError}
              </p>
            )}
          </div>
          <DialogFooter showCloseButton={false}>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleDialogOpenChange(false)}
              className="font-custom"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleApply}
              className="font-custom"
              disabled={
                !!quantityError ||
                !inputValue.trim() ||
                parseFloat(inputValue) <= 0
              }
            >
              Apply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
});
