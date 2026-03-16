import { memo, useState } from 'react';
import { format } from 'date-fns';

import { Card, CardHeader } from '@/components/ui/card';
import {
  Item,
  ItemActions,
  ItemHeader,
  ItemMedia,
  ItemTitle,
} from '@/components/ui/item';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';

import {
  ChevronDown,
  ChevronUp,
  MapPin,
  Package,
  RefreshCw,
  Repeat2,
  Truck,
  User,
} from 'lucide-react';

import {
  useGetTransferGatePasses,
  type TransferStockEntry,
  type TransferStockItem,
} from '@/services/transfer-stock/useGetTransferGatePasses';
import { DetailRow } from '@/components/daybook/detail-row';

function TransferStockSkeleton() {
  return (
    <div className="w-full space-y-4">
      {[...Array(3)].map((_, i) => (
        <Card
          key={i}
          className="border-border/40 overflow-hidden pt-0 shadow-sm"
        >
          <div className="w-full px-4 py-4 sm:px-5 sm:py-5">
            <CardHeader className="px-0 pt-0 pb-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-1.5 w-1.5 shrink-0 rounded-full" />
                    <Skeleton className="h-5 w-32" />
                  </div>
                  <Skeleton className="h-3.5 w-24" />
                </div>
                <div className="flex shrink-0 gap-2">
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
              </div>
            </CardHeader>

            <div className="mb-4 grid w-full grid-cols-2 gap-4 lg:grid-cols-4">
              {[...Array(4)].map((_, j) => (
                <div key={j} className="min-w-0 space-y-1">
                  <Skeleton className="h-3.5 w-14" />
                  <Skeleton className="h-4 w-full max-w-28" />
                </div>
              ))}
            </div>

            <div className="border-border/50 flex w-full items-center justify-between border-t pt-4">
              <Skeleton className="h-8 w-20" />
              <div className="flex gap-2">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-8 w-8 rounded-md" />
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

function formatLocationSummary(items: TransferStockItem[]): string {
  if (items.length === 0) return 'No items';

  const totalBags = items.reduce((sum, item) => sum + item.quantity, 0);
  const uniqueChambers = new Set(items.map((item) => item.location.chamber));

  return `${totalBags} bags · ${uniqueChambers.size} chamber${
    uniqueChambers.size === 1 ? '' : 's'
  }`;
}

function TransferStockCard({ entry }: { entry: TransferStockEntry }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const createdDate = format(new Date(entry.date), 'dd MMM yyyy');
  const createdTime = format(new Date(entry.createdAt), 'hh:mm a');

  const itemSummary = formatLocationSummary(entry.items);
  const totalBags = entry.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Card className="border-border/40 hover:border-primary/30 overflow-hidden pt-0 shadow-sm transition-all duration-200 hover:shadow-md">
      <div className="w-full px-4 py-4 sm:px-5 sm:py-5">
        <CardHeader className="px-0 pt-0 pb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex min-w-0 items-center gap-2">
                <div className="bg-primary h-1.5 w-1.5 shrink-0 rounded-full" />
                <h3 className="text-foreground font-custom text-base font-bold tracking-tight">
                  Transfer GP{' '}
                  <span className="text-primary">#{entry.gatePassNo}</span>
                </h3>
              </div>
              <p className="text-muted-foreground mt-2 text-xs">
                {createdDate} · {createdTime}
              </p>
            </div>

            <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
              {entry.createdIncomingGatePassId && (
                <Badge
                  variant="default"
                  className="bg-primary px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-primary-foreground"
                >
                  New IGP #{entry.createdIncomingGatePassId.gatePassNo}
                </Badge>
              )}
              <Badge
                variant="secondary"
                className="px-2.5 py-1 text-[10px] font-medium"
              >
                {totalBags.toLocaleString('en-IN')} bags
              </Badge>
            </div>
          </div>
        </CardHeader>

        <div className="mb-4 grid w-full grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          <DetailRow
            label="From farmer"
            value={entry.fromFarmerStorageLinkId.name}
            icon={User}
          />
          <DetailRow
            label="From account"
            value={`#${entry.fromFarmerStorageLinkId.accountNumber}`}
          />
          <DetailRow
            label="To farmer"
            value={entry.toFarmerStorageLinkId.name}
            icon={User}
          />
          <DetailRow
            label="To account"
            value={`#${entry.toFarmerStorageLinkId.accountNumber}`}
          />
          <DetailRow
            label="Items"
            value={itemSummary}
            icon={Package}
          />
        </div>

        <div className="border-border/50 flex w-full items-center justify-between border-t pt-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded((p) => !p)}
            className="hover:bg-accent h-8 px-3 text-xs"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="mr-1.5 h-3.5 w-3.5" />
                Less
              </>
            ) : (
              <>
                <ChevronDown className="mr-1.5 h-3.5 w-3.5" />
                More
              </>
            )}
          </Button>

          <div className="flex shrink-0 flex-wrap items-center gap-3 text-right">
            {entry.truckNumber && (
              <p className="text-muted-foreground flex items-center gap-1 text-xs">
                <Truck className="h-3 w-3" />
                {entry.truckNumber}
              </p>
            )}
            <p className="text-muted-foreground text-xs sm:text-sm">
              {entry.createdIncomingGatePassId
                ? `Created new incoming GP #${entry.createdIncomingGatePassId.gatePassNo}`
                : 'No new incoming gate pass created'}
            </p>
          </div>
        </div>

        {isExpanded && (
          <>
            <Separator className="my-5" />
            <div className="w-full space-y-5">
              <section className="w-full">
                <h4 className="text-muted-foreground/70 mb-3 text-xs font-semibold tracking-wider uppercase">
                  Farmer Details
                </h4>
                <div className="bg-muted/30 grid w-full grid-cols-1 gap-3 rounded-lg p-4 sm:grid-cols-2 lg:grid-cols-3">
                  <DetailRow
                    label="From farmer"
                    value={entry.fromFarmerStorageLinkId.name}
                  />
                  <DetailRow
                    label="From mobile"
                    value={entry.fromFarmerStorageLinkId.mobileNumber}
                  />
                  <DetailRow
                    label="From address"
                    value={entry.fromFarmerStorageLinkId.address}
                    icon={MapPin}
                  />
                  <DetailRow
                    label="To farmer"
                    value={entry.toFarmerStorageLinkId.name}
                  />
                  <DetailRow
                    label="To mobile"
                    value={entry.toFarmerStorageLinkId.mobileNumber}
                  />
                  <DetailRow
                    label="To address"
                    value={entry.toFarmerStorageLinkId.address}
                    icon={MapPin}
                  />
                  <DetailRow
                    label="Created By"
                    value={entry.createdBy.name}
                  />
                </div>
              </section>

              {entry.items.length > 0 && (
                <section className="w-full">
                  <h4 className="text-muted-foreground/70 mb-3 text-xs font-semibold tracking-wider uppercase">
                    Transfer Details
                  </h4>
                  <div className="border-border w-full overflow-hidden rounded-lg border shadow-sm">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/60 hover:bg-muted/60 border-border/50 font-custom">
                          <TableHead className="text-muted-foreground font-custom text-xs font-semibold tracking-wider uppercase">
                            Size
                          </TableHead>
                          <TableHead className="text-muted-foreground font-custom text-xs font-semibold tracking-wider uppercase">
                            Location
                          </TableHead>
                          <TableHead className="text-muted-foreground font-custom text-right text-xs font-semibold tracking-wider uppercase">
                            Qty
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody className="font-custom">
                        {entry.items.map((item, idx) => (
                          <TableRow
                            key={`${item.bagSize}-${idx}`}
                            className="border-border/50 bg-background hover:bg-background"
                          >
                            <TableCell className="text-foreground font-medium">
                              {item.bagSize}
                            </TableCell>
                            <TableCell className="text-foreground">
                              {`${item.location.chamber}/${item.location.floor}/${item.location.row}`}
                            </TableCell>
                            <TableCell className="text-foreground text-right">
                              {item.quantity.toLocaleString('en-IN')}
                            </TableCell>
                          </TableRow>
                        ))}
                        <TableRow className="border-primary bg-primary/10 hover:bg-primary/10 border-t-2">
                          <TableCell className="font-custom text-primary font-bold">
                            Total
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            —
                          </TableCell>
                          <TableCell className="font-custom text-primary text-right font-bold">
                            {totalBags.toLocaleString('en-IN')}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </section>
              )}

              {entry.remarks && entry.remarks.trim() !== '' && (
                <section className="w-full">
                  <h4 className="text-muted-foreground/70 mb-3 text-xs font-semibold tracking-wider uppercase">
                    Remarks
                  </h4>
                  <div className="bg-muted/30 w-full rounded-lg p-4">
                    <p className="text-foreground text-sm font-medium">
                      {entry.remarks}
                    </p>
                  </div>
                </section>
              )}
            </div>
          </>
        )}
      </div>
    </Card>
  );
}

const MemoTransferStockCard = memo(TransferStockCard);

const TransferStockHistoryPage = memo(function TransferStockHistoryPage() {
  const { data, isLoading, isError, error, isFetching, refetch } =
    useGetTransferGatePasses();

  const entries = data ?? [];
  const total = entries.length;

  return (
    <main className="mx-auto max-w-7xl p-2 sm:p-4 lg:p-6">
      <div className="space-y-6">
        {/* Header: count + refresh */}
        <Item variant="outline" size="sm" className="rounded-xl shadow-sm">
          <ItemHeader className="h-full">
            <div className="flex items-center gap-3">
              <ItemMedia variant="icon" className="rounded-lg">
                <Repeat2 className="text-primary h-5 w-5" />
              </ItemMedia>
              <ItemTitle className="font-custom text-sm font-semibold sm:text-base">
                {total > 0
                  ? `${total} transfer gate passes`
                  : 'Transfer Stock History'}
              </ItemTitle>
            </div>
            <ItemActions>
              <Button
                variant="outline"
                size="sm"
                disabled={isFetching}
                onClick={() => refetch()}
                className="font-custom h-8 gap-2 rounded-lg px-3"
                aria-busy={isFetching}
              >
                <RefreshCw
                  className={`h-4 w-4 shrink-0 ${
                    isFetching ? 'animate-spin' : ''
                  }`}
                />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
            </ItemActions>
          </ItemHeader>
        </Item>

        <div className="min-h-[120px] w-full">
          {isLoading && <TransferStockSkeleton />}

          {isError && !isLoading && (
            <p className="font-custom text-destructive text-sm">
              {error instanceof Error
                ? error.message
                : 'Failed to load transfer stock history'}
            </p>
          )}

          {!isLoading && !isError && entries.length === 0 && (
            <Empty className="font-custom border-border/40 rounded-xl border py-12">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Repeat2 className="text-muted-foreground size-6" />
                </EmptyMedia>
                <EmptyTitle>No transfer stock entries yet</EmptyTitle>
                <EmptyDescription>
                  Once you create transfer stock entries, they will appear here.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}

          {!isLoading && !isError && entries.length > 0 && (
            <div className="w-full space-y-4">
              {entries.map((entry) => (
                <MemoTransferStockCard key={entry._id} entry={entry} />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
});

export default TransferStockHistoryPage;