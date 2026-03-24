import { memo, useState } from 'react';
import { Card, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import type { TransferStockGatePass } from '@/services/transfer-stock/useGetTransferStockGatePasses';
import {
  ChevronDown,
  ChevronUp,
  ArrowRightLeft,
  User,
  Truck,
  Package,
  MapPin,
  FileStack,
} from 'lucide-react';
import { format } from 'date-fns';
import { DetailRow } from '@/components/daybook/detail-row';

interface TransferStockGatePassCardProps {
  entry: TransferStockGatePass;
}

function formatVoucherDate(date: string | undefined): string {
  if (!date) return '—';
  try {
    return format(new Date(date), 'dd MMM yyyy');
  } catch {
    return '—';
  }
}

function formatLocation(loc: {
  chamber: string;
  floor: string;
  row: string;
}): string {
  return `${loc.chamber}/${loc.floor}/${loc.row}`;
}

const TransferStockGatePassCard = memo(function TransferStockGatePassCard({
  entry,
}: TransferStockGatePassCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const from = entry.fromFarmerStorageLinkId;
  const to = entry.toFarmerStorageLinkId;
  const totalQty = entry.items.reduce((s, i) => s + (i.quantity ?? 0), 0);

  const igp = entry.createdIncomingGatePassId;
  const ogp = entry.createdOutgoingGatePassId;

  return (
    <Card className="border-border/40 hover:border-primary/30 overflow-hidden pt-0 shadow-sm transition-all duration-200 hover:shadow-md">
      <div className="w-full px-4 py-4 sm:px-5 sm:py-5">
        <CardHeader className="px-0 pt-0 pb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex min-w-0 items-center gap-2">
                <div className="bg-primary h-1.5 w-1.5 shrink-0 rounded-full" />
                <h3 className="text-foreground font-custom text-base font-bold tracking-tight">
                  Transfer{' '}
                  <span className="text-primary">#{entry.gatePassNo ?? '—'}</span>
                </h3>
              </div>
              <p className="text-muted-foreground mt-2 text-xs">
                {formatVoucherDate(entry.date)}
              </p>
            </div>

            <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
              <Badge
                variant="secondary"
                className="px-2.5 py-1 text-[10px] font-medium"
              >
                <Truck className="mr-1 inline h-3 w-3" />
                {entry.truckNumber ?? '—'}
              </Badge>
              <Badge
                variant="outline"
                className="px-2.5 py-1 text-[10px] font-medium"
              >
                {totalQty.toLocaleString('en-IN')} bags
              </Badge>
            </div>
          </div>
        </CardHeader>

        <div className="mb-4 grid w-full gap-4 sm:grid-cols-2">
          <div className="bg-muted/25 border-border/50 rounded-lg border p-4">
            <p className="text-muted-foreground mb-2 flex items-center gap-1.5 text-[10px] font-semibold tracking-wider uppercase">
              <ArrowRightLeft className="h-3 w-3" />
              From
            </p>
            <p className="text-foreground font-custom text-sm font-semibold">
              {from?.name ?? '—'}
            </p>
            <p className="text-muted-foreground mt-1 text-xs">
              Account #{from?.accountNumber ?? '—'} · {from?.mobileNumber ?? '—'}
            </p>
          </div>
          <div className="bg-muted/25 border-border/50 rounded-lg border p-4">
            <p className="text-muted-foreground mb-2 flex items-center gap-1.5 text-[10px] font-semibold tracking-wider uppercase">
              <ArrowRightLeft className="h-3 w-3 rotate-180" />
              To
            </p>
            <p className="text-foreground font-custom text-sm font-semibold">
              {to?.name ?? '—'}
            </p>
            <p className="text-muted-foreground mt-1 text-xs">
              Account #{to?.accountNumber ?? '—'} · {to?.mobileNumber ?? '—'}
            </p>
          </div>
        </div>

        <div className="mb-4 grid w-full grid-cols-2 gap-4 sm:grid-cols-3">
          <DetailRow
            label="Created by"
            value={entry.createdBy?.name ?? '—'}
            icon={User}
          />
          <DetailRow
            label="Variety"
            value={igp?.variety ?? '—'}
            icon={Package}
          />
          <DetailRow
            label="Truck"
            value={entry.truckNumber ?? '—'}
            icon={Truck}
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
        </div>

        {isExpanded && (
          <>
            <Separator className="my-5" />
            <div className="w-full space-y-5">
              {entry.items.length > 0 && (
                <section className="w-full">
                  <h4 className="text-muted-foreground/70 mb-3 text-xs font-semibold tracking-wider uppercase">
                    Transfer line items
                  </h4>
                  <div className="border-border w-full overflow-hidden rounded-lg border shadow-sm">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/60 hover:bg-muted/60 border-border/50 font-custom">
                          <TableHead className="text-muted-foreground font-custom text-xs font-semibold tracking-wider uppercase">
                            Size
                          </TableHead>
                          <TableHead className="text-muted-foreground font-custom text-xs font-semibold tracking-wider uppercase">
                            Source IGP
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
                            key={`${item.incomingGatePassId}-${item.bagSize}-${idx}`}
                            className="border-border/50 bg-background hover:bg-background"
                          >
                            <TableCell className="text-foreground font-medium">
                              {item.bagSize ?? '—'}
                            </TableCell>
                            <TableCell className="text-foreground">
                              #{item.gatePassNo ?? '—'}
                            </TableCell>
                            <TableCell className="text-foreground">
                              {formatLocation(item.location)}
                            </TableCell>
                            <TableCell className="text-foreground text-right">
                              {(item.quantity ?? 0).toLocaleString('en-IN')}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </section>
              )}

              <section className="w-full">
                <h4 className="text-muted-foreground/70 mb-3 text-xs font-semibold tracking-wider uppercase">
                  Linked vouchers
                </h4>
                <div className="bg-muted/30 grid w-full grid-cols-1 gap-4 rounded-lg p-4 sm:grid-cols-2">
                  <div className="min-w-0 space-y-2">
                    <div className="flex items-center gap-2">
                      <FileStack className="text-muted-foreground h-4 w-4 shrink-0" />
                      <span className="text-muted-foreground text-xs font-semibold uppercase">
                        Incoming ({igp?.type ?? '—'})
                      </span>
                    </div>
                    <p className="text-foreground font-custom text-sm font-semibold">
                      IGP #{igp?.gatePassNo ?? '—'}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {formatVoucherDate(igp?.date)}
                    </p>
                  </div>
                  <div className="min-w-0 space-y-2">
                    <div className="flex items-center gap-2">
                      <FileStack className="text-muted-foreground h-4 w-4 shrink-0" />
                      <span className="text-muted-foreground text-xs font-semibold uppercase">
                        Outgoing ({ogp?.type ?? '—'})
                      </span>
                    </div>
                    <p className="text-foreground font-custom text-sm font-semibold">
                      OGP #{ogp?.gatePassNo ?? '—'}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {formatVoucherDate(ogp?.date)} ·{' '}
                      {ogp?.truckNumber ?? entry.truckNumber ?? '—'}
                    </p>
                  </div>
                </div>
              </section>

              {ogp?.orderDetails != null && ogp.orderDetails.length > 0 && (
                <section className="w-full">
                  <h4 className="text-muted-foreground/70 mb-3 text-xs font-semibold tracking-wider uppercase">
                    Outgoing order details
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
                            Issued
                          </TableHead>
                          <TableHead className="text-muted-foreground font-custom text-right text-xs font-semibold tracking-wider uppercase">
                            Available
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody className="font-custom">
                        {ogp.orderDetails.map((row, idx) => (
                          <TableRow
                            key={`${row.size}-${idx}`}
                            className="border-border/50 bg-background hover:bg-background"
                          >
                            <TableCell className="text-foreground font-medium">
                              {row.size}
                            </TableCell>
                            <TableCell className="text-foreground">
                              {formatLocation(row.location)}
                            </TableCell>
                            <TableCell className="text-foreground text-right">
                              {(row.quantityIssued ?? 0).toLocaleString('en-IN')}
                            </TableCell>
                            <TableCell className="text-foreground text-right">
                              {(row.quantityAvailable ?? 0).toLocaleString(
                                'en-IN'
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </section>
              )}

              <section className="w-full">
                <h4 className="text-muted-foreground/70 mb-3 text-xs font-semibold tracking-wider uppercase">
                  Addresses
                </h4>
                <div className="bg-muted/30 grid w-full grid-cols-1 gap-3 rounded-lg p-4 sm:grid-cols-2">
                  <DetailRow
                    label="From address"
                    value={from?.address ?? '—'}
                    icon={MapPin}
                  />
                  <DetailRow
                    label="To address"
                    value={to?.address ?? '—'}
                    icon={MapPin}
                  />
                </div>
              </section>

              {entry.remarks != null && entry.remarks !== '' && (
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
});

export default TransferStockGatePassCard;
