import { memo, useMemo, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { Card, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  ChevronDown,
  ChevronUp,
  Pencil,
  Printer,
  User,
  Package,
  MapPin,
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Spinner } from '@/components/ui/spinner';
import { DetailRow } from './detail-row';
import type { OutgoingGatePassEntry } from '@/services/store-admin/functions/useGetDaybook';
import { useStore } from '@/stores/store';

interface OutgoingGatePassCardProps {
  entry: OutgoingGatePassEntry;
}

function formatVoucherDate(date: string | undefined): string {
  if (!date) return 'N/A';
  return format(new Date(date), 'dd MMM yyyy');
}

function sortByPreferenceOrder<T>(
  items: T[],
  getSize: (item: T) => string,
  preferenceSizes: string[]
): T[] {
  if (preferenceSizes.length === 0) return items;
  const orderMap = new Map(preferenceSizes.map((size, i) => [size.trim(), i]));
  return [...items].sort((a, b) => {
    const idxA = orderMap.get(getSize(a).trim()) ?? Infinity;
    const idxB = orderMap.get(getSize(b).trim()) ?? Infinity;
    return idxA - idxB;
  });
}

const OutgoingGatePassCard = memo(function OutgoingGatePassCard({
  entry,
}: OutgoingGatePassCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const coldStorage = useStore((s) => s.coldStorage);
  const preferenceSizes = useStore(
    (s) => s.preferences?.commodities?.[0]?.sizes ?? []
  );

  const handlePrintPdf = async () => {
    // Open window synchronously so mobile popup blockers allow it
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(
        '<html><body style="font-family:sans-serif;padding:2rem;text-align:center;color:#666;">Generating PDF…</body></html>'
      );
    }
    setIsGeneratingPdf(true);
    try {
      const [{ pdf }, { OutgoingGatePassPdf }] = await Promise.all([
        import('@react-pdf/renderer'),
        import('@/pdf/OutgoingGatePassPdf'),
      ]);
      const blob = await pdf(
        <OutgoingGatePassPdf
          entry={entry}
          coldStorage={
            coldStorage
              ? {
                  name: coldStorage.name,
                  address: coldStorage.address,
                  imageUrl: coldStorage.imageUrl,
                }
              : null
          }
        />
      ).toBlob();
      const url = URL.createObjectURL(blob);
      if (printWindow) {
        printWindow.location.href = url;
      } else {
        window.location.href = url;
      }
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
      toast.success('PDF opened in new tab', {
        duration: 3000,
        description: 'Your gate pass is ready to view or print.',
      });
    } catch {
      if (printWindow) printWindow.close();
      toast.error('Could not generate PDF', {
        description: 'Please try again.',
      });
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const farmer = entry.farmerStorageLinkId?.farmerId;
  const farmerName = farmer?.name ?? '—';
  const accountNumber = entry.farmerStorageLinkId?.accountNumber ?? '—';

  const orderDetails = useMemo(
    () => entry.orderDetails ?? [],
    [entry.orderDetails]
  );

  /** Order details rows in preference order for table display. */
  const orderDetailsSorted = useMemo(
    () =>
      sortByPreferenceOrder(
        orderDetails,
        (od) => (od.size ?? '').trim(),
        preferenceSizes
      ),
    [orderDetails, preferenceSizes]
  );

  const incomingEntries = useMemo(
    () => entry.incomingGatePassEntries ?? [],
    [entry.incomingGatePassEntries]
  );

  /** Display variety: from new API or snapshots (comma-separated unique) or legacy top-level. */
  const displayVariety = useMemo(() => {
    if (incomingEntries.length > 0) {
      const varieties = [
        ...new Set(
          incomingEntries
            .map((e) => e.variety?.trim())
            .filter((v): v is string => Boolean(v))
        ),
      ];
      return varieties.length > 0 ? varieties.join(', ') : '—';
    }
    const snapshots = entry.incomingGatePassSnapshots ?? [];
    if (snapshots.length > 0) {
      const varieties = [
        ...new Set(
          snapshots
            .map((s) => s.variety?.trim())
            .filter((v): v is string => Boolean(v))
        ),
      ];
      return varieties.length > 0 ? varieties.join(', ') : '—';
    }
    return entry.variety ?? '—';
  }, [entry.variety, entry.incomingGatePassSnapshots, incomingEntries]);

  /** Rows from new API shape (incomingGatePassEntries): size, variety, ref, issued. Sorted by preference order. */
  const breakdownRowsNew = useMemo(() => {
    const rows: {
      size: string;
      variety: string;
      refNo: number | string;
      issuedQty: number;
    }[] = [];
    for (const ent of incomingEntries) {
      const ref = ent.gatePassNo ?? ent.incomingGatePassId?.slice(-6) ?? '—';
      for (const alloc of ent.allocations ?? []) {
        const size = (alloc.size ?? '').trim();
        if (!size) continue;
        rows.push({
          size,
          variety: ent.variety?.trim() ?? '—',
          refNo: ref,
          issuedQty: alloc.quantityToAllocate ?? 0,
        });
      }
    }
    return sortByPreferenceOrder(rows, (r) => r.size, preferenceSizes);
  }, [incomingEntries, preferenceSizes]);

  /**
   * One row per (size, location) from incoming snapshots (legacy) so the table shows
   * separate rows for separate locations instead of concatenated locations.
   * When orderDetails exist, INIT / Issued / Avail use orderDetails (quantityAvailable + quantityIssued for INIT).
   */
  const breakdownRowsLegacy = useMemo(() => {
    const snapshots = entry.incomingGatePassSnapshots ?? [];
    const orderDetailsList = entry.orderDetails ?? [];
    const rows: {
      size: string;
      variety: string;
      location: string;
      refNo: number;
      initialQty: number;
      issuedQty: number;
      availableQty: number;
    }[] = [];
    for (const snap of snapshots) {
      const variety = snap.variety?.trim() ?? '—';
      for (const bs of snap.bagSizes ?? []) {
        const size = (bs.name ?? '').trim();
        if (!size) continue;
        const loc = bs.location;
        const locationStr = loc
          ? `${loc.chamber ?? ''}-${loc.floor ?? ''}-${loc.row ?? ''}`.replace(
              /^-+$/,
              ''
            ) || '—'
          : '—';
        const matchOd = orderDetailsList.find(
          (od) =>
            (od.size ?? '').trim() === size &&
            String(od.location?.chamber ?? '') === String(loc?.chamber ?? '') &&
            String(od.location?.floor ?? '') === String(loc?.floor ?? '') &&
            String(od.location?.row ?? '') === String(loc?.row ?? '')
        );
        const availableQty = matchOd?.quantityAvailable ?? bs.currentQuantity ?? 0;
        const issuedQty = matchOd?.quantityIssued ?? Math.max(0, (bs.initialQuantity ?? 0) - (bs.currentQuantity ?? 0));
        const initialQty = availableQty + issuedQty;
        rows.push({
          size,
          variety,
          location: locationStr,
          refNo: snap.gatePassNo ?? 0,
          initialQty,
          issuedQty,
          availableQty,
        });
      }
    }
    return sortByPreferenceOrder(rows, (r) => r.size, preferenceSizes);
  }, [entry.incomingGatePassSnapshots, entry.orderDetails, preferenceSizes]);

  const useNewFormat = breakdownRowsNew.length > 0;

  const { totalIssued, totalAvailable } = useMemo(() => {
    if (useNewFormat) {
      const issued = breakdownRowsNew.reduce((s, r) => s + r.issuedQty, 0);
      return { totalIssued: issued, totalAvailable: 0 };
    }
    if (breakdownRowsLegacy.length > 0) {
      return {
        totalIssued: breakdownRowsLegacy.reduce((s, r) => s + r.issuedQty, 0),
        totalAvailable: breakdownRowsLegacy.reduce(
          (s, r) => s + r.availableQty,
          0
        ),
      };
    }
    let issued = 0;
    let available = 0;
    for (const od of orderDetails) {
      issued += od.quantityIssued ?? 0;
      available += od.quantityAvailable ?? 0;
    }
    return { totalIssued: issued, totalAvailable: available };
  }, [useNewFormat, breakdownRowsNew, breakdownRowsLegacy, orderDetails]);

  const bags = totalIssued + totalAvailable;

  return (
    <Card className="border-border/40 hover:border-destructive/30 overflow-hidden pt-0 shadow-sm transition-all duration-200 hover:shadow-md">
      <div className="w-full px-4 py-4 sm:px-5 sm:py-5">
        <CardHeader className="px-0 pt-0 pb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex min-w-0 items-center gap-2">
                <div className="bg-destructive h-1.5 w-1.5 shrink-0 rounded-full" />
                <h3 className="text-foreground font-custom text-base font-bold tracking-tight">
                  OGP{' '}
                  <span className="text-destructive">
                    #{entry.gatePassNo ?? '—'}
                  </span>
                  {entry.manualParchiNumber != null && (
                    <span className="text-muted-foreground font-normal">
                      {' '}
                      · Manual #{entry.manualParchiNumber}
                    </span>
                  )}
                </h3>
              </div>
              <p className="text-muted-foreground mt-2 text-xs">
                {formatVoucherDate(entry.date)}
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <Badge
                variant="secondary"
                className="px-2.5 py-1 text-[10px] font-medium"
              >
                {bags.toLocaleString('en-IN')} bags
              </Badge>
            </div>
          </div>
        </CardHeader>

        <div className="mb-4 grid w-full grid-cols-2 gap-4 lg:grid-cols-4">
          {farmerName != null && farmerName !== '—' && (
            <DetailRow label="Farmer" value={farmerName} icon={User} />
          )}
          {accountNumber != null && (
            <DetailRow label="Account" value={`#${accountNumber}`} />
          )}
          <DetailRow label="Variety" value={displayVariety} icon={Package} />
          {entry.truckNumber?.trim() && (
            <DetailRow label="Truck No." value={entry.truckNumber.trim()} />
          )}
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

          <div className="flex shrink-0 items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="hidden h-8 px-3 text-xs"
              asChild
            >
              <Link
                to="/store-admin/outgoing/edit/$id"
                params={{ id: entry._id }}
                state={{ entry } as Record<string, unknown>}
              >
                <Pencil className="mr-1.5 h-3.5 w-3.5" />
                Edit
              </Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrintPdf}
              disabled={isGeneratingPdf}
              className="h-8 w-8 p-0"
              aria-label={
                isGeneratingPdf ? 'Generating PDF…' : 'Print gate pass'
              }
            >
              {isGeneratingPdf ? (
                <Spinner className="h-3.5 w-3.5" />
              ) : (
                <Printer className="h-3.5 w-3.5" />
              )}
            </Button>
          </div>
        </div>

        {isExpanded && (
          <>
            <Separator className="my-5" />
            <div className="w-full space-y-5">
              <section className="w-full">
                <h4 className="text-muted-foreground/70 mb-3 text-xs font-semibold tracking-wider uppercase">
                  Entry Details
                </h4>
                <div className="bg-muted/30 grid w-full grid-cols-1 gap-3 rounded-lg p-4 sm:grid-cols-2 lg:grid-cols-3">
                  {(entry.from != null || entry.to != null) && (
                    <DetailRow
                      label="From → To"
                      value={`${entry.from ?? '—'} → ${entry.to ?? '—'}`}
                      icon={MapPin}
                    />
                  )}
                  <DetailRow
                    label="Created By"
                    value={entry.createdBy?.name ?? '—'}
                  />
                </div>
              </section>
              <section className="w-full">
                <h4 className="text-muted-foreground/70 mb-3 text-xs font-semibold tracking-wider uppercase">
                  Detailed Breakdown
                </h4>
                <div className="bg-muted/30 -mx-4 overflow-x-auto rounded-lg p-4 sm:mx-0">
                  <table className="font-custom w-full min-w-xl table-fixed text-sm">
                    <thead>
                      <tr className="text-muted-foreground/70 border-border/50 border-b text-left text-[10px] font-medium tracking-wider uppercase">
                        <th
                          className="w-[18%] min-w-16 px-1 pb-2 whitespace-nowrap sm:px-1 sm:pr-3"
                          title="Bag type / size"
                        >
                          Type
                        </th>
                        {useNewFormat ? (
                          <>
                            <th
                              className="w-[20%] min-w-16 px-1 pb-2 whitespace-nowrap sm:px-1 sm:pr-3"
                              title="Variety"
                            >
                              Variety
                            </th>
                            <th
                              className="w-[16%] min-w-14 px-1 pb-2 whitespace-nowrap sm:px-1 sm:pr-3"
                              title="Receipt / reference"
                            >
                              Ref
                            </th>
                            <th
                              className="w-[22%] min-w-14 px-1 pb-2 text-right whitespace-nowrap sm:px-1 sm:pr-2"
                              title="Quantity issued"
                            >
                              Issued
                            </th>
                          </>
                        ) : (
                          <>
                            <th
                              className="w-[16%] min-w-16 px-1 pb-2 whitespace-nowrap sm:px-1 sm:pr-3"
                              title="Variety"
                            >
                              Variety
                            </th>
                            <th
                              className="w-[16%] min-w-14 px-1 pb-2 whitespace-nowrap sm:px-1 sm:pr-3"
                              title="Storage location (chamber-floor-row)"
                            >
                              Location
                            </th>
                            <th
                              className="w-[16%] min-w-12 px-1 pb-2 whitespace-nowrap sm:px-1 sm:pr-3"
                              title="Receipt / reference voucher"
                            >
                              Ref
                            </th>
                            <th
                              className="w-[16%] min-w-10 px-1 pb-2 text-right whitespace-nowrap sm:px-1 sm:pr-3"
                              title="Available (quantity available + issued)"
                            >
                              Avail
                            </th>
                            <th
                              className="w-[22%] min-w-12 px-1 pb-2 text-right whitespace-nowrap sm:px-1 sm:pr-3"
                              title="Quantity issued"
                            >
                              Issued
                            </th>
                            <th
                              className="w-[22%] min-w-12 px-1 pb-2 text-right whitespace-nowrap sm:px-1 sm:pr-2"
                              title="Remaining"
                            >
                              Rem
                            </th>
                          </>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {useNewFormat && breakdownRowsNew.length > 0
                        ? breakdownRowsNew.map((row, idx) => (
                            <tr
                              key={`${row.size}-${row.variety}-${row.refNo}-${idx}`}
                              className="border-border/40 border-b"
                            >
                              <td
                                className="min-w-0 truncate px-1 py-2 font-medium sm:pr-3"
                                title={row.size}
                              >
                                {row.size}
                              </td>
                              <td
                                className="text-foreground min-w-0 truncate px-1 py-2 sm:pr-3"
                                title={row.variety}
                              >
                                {row.variety}
                              </td>
                              <td className="min-w-0 px-1 py-2 sm:pr-3">
                                <span className="inline-flex max-w-full min-w-0 items-center gap-1 sm:gap-1.5">
                                  <span className="bg-primary h-1.5 w-1.5 shrink-0 rounded-full" />
                                  <span
                                    className="text-foreground min-w-0 truncate font-medium"
                                    title={
                                      typeof row.refNo === 'number'
                                        ? `#${row.refNo}`
                                        : String(row.refNo)
                                    }
                                  >
                                    {typeof row.refNo === 'number'
                                      ? `#${row.refNo}`
                                      : row.refNo}
                                  </span>
                                </span>
                              </td>
                              <td className="text-destructive px-1 py-2 text-right font-medium whitespace-nowrap sm:pr-2">
                                {row.issuedQty.toLocaleString('en-IN')}
                              </td>
                            </tr>
                          ))
                        : breakdownRowsLegacy.length > 0
                          ? breakdownRowsLegacy.map((row, idx) => (
                              <tr
                                key={`${row.size}-${row.variety}-${row.location}-${row.refNo}-${idx}`}
                                className="border-border/40 border-b"
                              >
                                <td
                                  className="min-w-0 truncate px-1 py-2 font-medium sm:pr-3"
                                  title={row.size}
                                >
                                  {row.size}
                                </td>
                                <td
                                  className="text-foreground min-w-0 truncate px-1 py-2 sm:pr-3"
                                  title={row.variety}
                                >
                                  {row.variety}
                                </td>
                                <td
                                  className="text-foreground min-w-0 truncate px-1 py-2 sm:pr-3"
                                  title={row.location}
                                >
                                  {row.location}
                                </td>
                                <td className="min-w-0 px-1 py-2 sm:pr-3">
                                  <span className="inline-flex max-w-full min-w-0 items-center gap-1 sm:gap-1.5">
                                    <span className="bg-primary h-1.5 w-1.5 shrink-0 rounded-full" />
                                    <span
                                      className="text-foreground min-w-0 truncate font-medium"
                                      title={`#${row.refNo}`}
                                    >
                                      #{row.refNo}
                                    </span>
                                  </span>
                                </td>
                                <td className="px-1 py-2 text-right whitespace-nowrap sm:pr-3">
                                  {row.initialQty.toLocaleString('en-IN')}
                                </td>
                                <td className="text-destructive px-1 py-2 text-right font-medium whitespace-nowrap sm:pr-3">
                                  {row.issuedQty.toLocaleString('en-IN')}
                                </td>
                                <td className="text-primary px-1 py-2 text-right font-medium whitespace-nowrap sm:px-1 sm:pr-2">
                                  {row.availableQty.toLocaleString('en-IN')}
                                </td>
                              </tr>
                            ))
                          : orderDetailsSorted.map((od, idx) => {
                              const initialQty =
                                (od.quantityAvailable ?? 0) +
                                (od.quantityIssued ?? 0);
                              const varietyBySize = (() => {
                                const snapshots =
                                  entry.incomingGatePassSnapshots ?? [];
                                const varieties = [
                                  ...new Set(
                                    snapshots
                                      .filter((snap) =>
                                        snap.bagSizes?.some(
                                          (bs) =>
                                            (bs.name ?? '').trim() ===
                                            (od.size ?? '').trim()
                                        )
                                      )
                                      .map((s) => s.variety?.trim())
                                      .filter((v): v is string => Boolean(v))
                                  ),
                                ];
                                return varieties.length > 0
                                  ? varieties.join(', ')
                                  : '—';
                              })();
                              const locationBySize = (() => {
                                const snapshots =
                                  entry.incomingGatePassSnapshots ?? [];
                                const parts: string[] = [];
                                const seen = new Set<string>();
                                for (const snap of snapshots) {
                                  for (const bs of snap.bagSizes ?? []) {
                                    if (
                                      (bs.name ?? '').trim() !==
                                      (od.size ?? '').trim()
                                    )
                                      continue;
                                    const loc = bs.location;
                                    if (!loc) continue;
                                    const str = `${loc.chamber}-${loc.floor}-${loc.row}`;
                                    if (!seen.has(str)) {
                                      seen.add(str);
                                      parts.push(str);
                                    }
                                  }
                                }
                                return parts.length > 0
                                  ? parts.join(', ')
                                  : '—';
                              })();
                              const refDisplay = (() => {
                                const direct =
                                  od.incomingGatePassNo ?? od.gatePassNumber;
                                const fromSnapshots = (
                                  entry.incomingGatePassSnapshots ?? []
                                ).filter((s) =>
                                  s.bagSizes?.some(
                                    (bs) =>
                                      (bs.name ?? '').trim() ===
                                      (od.size ?? '').trim()
                                  )
                                );
                                const refNos =
                                  direct != null
                                    ? [direct]
                                    : fromSnapshots.map((s) => s.gatePassNo);
                                if (refNos.length === 0) return '—';
                                return refNos.map((no) => `#${no}`).join(', ');
                              })();
                              return (
                                <tr
                                  key={`${od.size}-${idx}`}
                                  className="border-border/40 border-b"
                                >
                                  <td
                                    className="min-w-0 truncate px-1 py-2 font-medium sm:pr-3"
                                    title={od.size ?? '—'}
                                  >
                                    {od.size ?? '—'}
                                  </td>
                                  <td
                                    className="text-foreground min-w-0 truncate px-1 py-2 sm:pr-3"
                                    title={varietyBySize}
                                  >
                                    {varietyBySize}
                                  </td>
                                  <td
                                    className="text-foreground min-w-0 truncate px-1 py-2 sm:pr-3"
                                    title={locationBySize}
                                  >
                                    {locationBySize}
                                  </td>
                                  <td className="min-w-0 px-1 py-2 sm:pr-3">
                                    <span className="inline-flex max-w-full min-w-0 items-center gap-1 sm:gap-1.5">
                                      <span className="bg-primary h-1.5 w-1.5 shrink-0 rounded-full" />
                                      <span
                                        className="text-foreground min-w-0 truncate font-medium"
                                        title={refDisplay}
                                      >
                                        {refDisplay}
                                      </span>
                                    </span>
                                  </td>
                                  <td className="px-1 py-2 text-right whitespace-nowrap sm:pr-3">
                                    {initialQty.toLocaleString('en-IN')}
                                  </td>
                                  <td className="text-destructive px-1 py-2 text-right font-medium whitespace-nowrap sm:pr-3">
                                    {(od.quantityIssued ?? 0).toLocaleString(
                                      'en-IN'
                                    )}
                                  </td>
                                  <td className="text-primary px-1 py-2 text-right font-medium whitespace-nowrap sm:px-1 sm:pr-2">
                                    {(od.quantityAvailable ?? 0).toLocaleString(
                                      'en-IN'
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                      {(breakdownRowsNew.length > 0 ||
                        breakdownRowsLegacy.length > 0 ||
                        orderDetails.length > 0) && (
                        <tr className="border-border/60 bg-muted/50 text-destructive border-t-2 font-semibold">
                          {useNewFormat ? (
                            <>
                              <td className="px-1 py-2.5 sm:pr-3" colSpan={3}>
                                Total
                              </td>
                              <td className="text-destructive px-1 py-2.5 text-right sm:pr-2">
                                {totalIssued.toLocaleString('en-IN')}
                              </td>
                            </>
                          ) : (
                            <>
                              <td className="px-1 py-2.5 sm:pr-3" colSpan={4}>
                                Total
                              </td>
                              <td className="px-1 py-2.5 text-right sm:pr-3">
                                {(totalAvailable + totalIssued).toLocaleString(
                                  'en-IN'
                                )}
                              </td>
                              <td className="text-destructive px-1 py-2.5 text-right sm:pr-3">
                                {totalIssued.toLocaleString('en-IN')}
                              </td>
                              <td className="text-primary px-1 py-2.5 text-right sm:pr-2">
                                {totalAvailable.toLocaleString('en-IN')}
                              </td>
                            </>
                          )}
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>

              {entry.remarks != null && entry.remarks !== '' && (
                <>
                  <Separator />
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
                </>
              )}
            </div>
          </>
        )}
      </div>
    </Card>
  );
});

export default OutgoingGatePassCard;
