import { Fragment, memo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { IncomingGatePassCell } from '@/components/forms/outgoing/incoming-gate-pass-cell';
import {
  allocationKey,
  getBagDetailsForSize,
  type IncomingGatePassDisplayGroup,
} from '@/components/forms/outgoing/outgoing-form-utils';

export interface OutgoingVouchersTableProps {
  displayGroups: IncomingGatePassDisplayGroup[];
  visibleSizes: string[];
  selectedOrders: Set<string>;
  onOrderToggle: (passId: string) => void;
  /** Cell key: allocationKey(passId, sizeName, bagIndex) -> quantity to remove */
  cellRemovedQuantities: Record<string, number>;
  onCellQuantityChange: (
    passId: string,
    sizeName: string,
    quantity: number,
    bagIndex?: number
  ) => void;
  onCellQuickRemove: (
    passId: string,
    sizeName: string,
    bagIndex?: number
  ) => void;
  isLoadingPasses: boolean;
  hasGradingData: boolean;
  hasFilteredData: boolean;
  hasActiveFilters: boolean;
}

export const OutgoingVouchersTable = memo(function OutgoingVouchersTable({
  displayGroups,
  visibleSizes,
  selectedOrders,
  onOrderToggle,
  cellRemovedQuantities,
  onCellQuantityChange,
  onCellQuickRemove,
  isLoadingPasses,
  hasGradingData,
  hasFilteredData,
  hasActiveFilters,
}: OutgoingVouchersTableProps) {
  const totalBySize = visibleSizes.map((size) =>
    displayGroups.reduce(
      (sum, group) =>
        sum +
        group.passes.reduce((rowSum, pass) => {
          const details = getBagDetailsForSize(pass, size);
          const cellSum = details.reduce(
            (s, d) =>
              s +
              (cellRemovedQuantities[
                allocationKey(pass._id, size, d.bagIndex)
              ] ?? 0),
            0
          );
          return rowSum + cellSum;
        }, 0),
      0
    )
  );
  const totalSelected = totalBySize.reduce((sum, q) => sum + q, 0);
  const showTotals = totalSelected > 0;

  return (
    <div className="border-border/40 rounded-md border pt-2">
      {!isLoadingPasses &&
        hasGradingData &&
        hasFilteredData &&
        visibleSizes.length > 0 && (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-custom text-foreground/80 w-[120px] font-medium">
                    R. Voucher
                  </TableHead>
                  {visibleSizes.map((size) => (
                    <TableHead
                      key={size}
                      className="font-custom text-foreground/80 font-medium"
                    >
                      {size}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayGroups.map((group) => (
                  <Fragment key={group.groupKey}>
                    <TableRow className="border-border/60 bg-muted/40 hover:bg-muted/40">
                      <TableCell
                        colSpan={visibleSizes.length + 1}
                        className="font-custom text-primary py-2.5 font-semibold"
                      >
                        {group.groupLabel}
                      </TableCell>
                    </TableRow>
                    {group.passes.map((pass) => (
                      <TableRow
                        key={pass._id}
                        className="border-border/40 hover:bg-transparent"
                      >
                        <TableCell className="py-3">
                          <div className="flex flex-col gap-0.5">
                            <div className="flex items-center gap-2.5">
                              <Checkbox
                                checked={selectedOrders.has(pass._id)}
                                onCheckedChange={() => onOrderToggle(pass._id)}
                                className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                              />
                              <span className="font-custom text-foreground/90 font-medium">
                                #{pass.gatePassNo}
                              </span>
                            </div>
                            {pass.truckNumber && (
                              <span className="font-custom text-muted-foreground pl-7 text-xs">
                                {pass.truckNumber}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        {visibleSizes.map((size) => {
                          const details = getBagDetailsForSize(pass, size);
                          if (details.length === 0) {
                            return (
                              <TableCell key={size} className="py-1">
                                <div className="bg-muted/30 border-border/40 h-[58px] w-[70px] rounded-md border" />
                              </TableCell>
                            );
                          }
                          return (
                            <TableCell key={size} className="py-1 align-top">
                              <div className="flex flex-col gap-1.5">
                                {details.map((detail) => {
                                  const cellKey = allocationKey(
                                    pass._id,
                                    size,
                                    detail.bagIndex
                                  );
                                  return (
                                    <IncomingGatePassCell
                                      key={cellKey}
                                      variety={pass.variety ?? ''}
                                      currentQuantity={detail.currentQuantity}
                                      initialQuantity={detail.initialQuantity}
                                      removedQuantity={
                                        cellRemovedQuantities[cellKey] ?? 0
                                      }
                                      onQuantityChange={(q) =>
                                        onCellQuantityChange(
                                          pass._id,
                                          size,
                                          q,
                                          detail.bagIndex
                                        )
                                      }
                                      onQuickRemove={() =>
                                        onCellQuickRemove(
                                          pass._id,
                                          size,
                                          detail.bagIndex
                                        )
                                      }
                                      disabled={detail.currentQuantity <= 0}
                                      location={detail.location}
                                      locationLabel={
                                        details.length > 1 && detail.location
                                          ? [
                                              detail.location.chamber,
                                              detail.location.floor,
                                              detail.location.row,
                                            ]
                                              .filter(Boolean)
                                              .join(' ')
                                          : undefined
                                      }
                                    />
                                  );
                                })}
                              </div>
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ))}
                  </Fragment>
                ))}
              </TableBody>
              {showTotals && (
                <TableFooter>
                  <TableRow className="border-border/60 bg-muted/50 hover:bg-muted/50 font-custom">
                    <TableCell className="text-foreground/90 py-2.5 font-semibold">
                      Total selected ({totalSelected.toFixed(1)})
                    </TableCell>
                    {visibleSizes.map((size, i) => (
                      <TableCell
                        key={size}
                        className="text-foreground/90 py-2.5 text-right font-medium"
                      >
                        {totalBySize[i]! > 0 ? totalBySize[i]!.toFixed(1) : '—'}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableFooter>
              )}
            </Table>
          </div>
        )}
      {!isLoadingPasses &&
        hasGradingData &&
        !hasFilteredData &&
        (hasActiveFilters ? (
          <p className="font-custom text-muted-foreground py-4 text-center text-sm">
            No vouchers or quantities available for the current filters. Try a
            different variety or location.
          </p>
        ) : (
          <p className="font-custom text-muted-foreground py-4 text-center text-sm">
            Select a variety from the filter above to see vouchers.
          </p>
        ))}
      {!isLoadingPasses &&
        hasGradingData &&
        hasFilteredData &&
        visibleSizes.length === 0 && (
          <p className="font-custom text-muted-foreground py-4 text-center text-sm">
            Select at least one bag size column (Columns menu) to view
            quantities.
          </p>
        )}
      {!isLoadingPasses && !hasGradingData && (
        <p className="font-custom text-muted-foreground py-4 text-center text-sm">
          No incoming gate pass vouchers for this farmer.
        </p>
      )}
      {isLoadingPasses && (
        <p className="font-custom text-muted-foreground py-4 text-center text-sm">
          Loading...
        </p>
      )}
    </div>
  );
});
