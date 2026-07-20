import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  ChevronDown,
  ChevronUp,
  FileText,
  Lock,
  MapPin,
  Package,
  Pencil,
  Loader2,
  Printer,
  Truck,
  User,
  Warehouse,
  type LucideIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { useColdStorageStore } from '@/features/auth/store/use-cold-storage-store';
import { usePreferencesStore } from '@/features/auth/store/use-preferences-store';
import type { IncomingDaybookEntry } from '@/features/daybook/types';
import {
  formatDaybookDateTime,
  formatIncomingLotNo,
  formatLocation,
  formatManualParchi,
  formatQuantity,
  sumBagQuantities,
} from '@/features/daybook/utils/format';
import {
  getBagSizeOrderForVariety,
  sortByPreferenceOrder,
} from '@/features/incoming/utils/incoming-preferences';
import {
  isIncomingTransferType,
  TransferGatePassBadge,
} from '@/features/daybook/components/transfer-gate-pass-badge';

interface InfoBlockProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  valueClassName?: string;
}

const InfoBlock = ({ label, value, icon: Icon, valueClassName }: InfoBlockProps) => (
  <div className="space-y-1.5">
    <span className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium tracking-wider uppercase">
      {Icon && <Icon className="h-3.5 w-3.5" />}
      {label}
    </span>
    <p className={cn('text-foreground text-sm font-semibold', valueClassName)}>{value}</p>
  </div>
);

interface SummaryFieldProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  valueClassName?: string;
}

const SummaryField = ({ label, value, icon: Icon, valueClassName }: SummaryFieldProps) => (
  <div className="min-w-0 space-y-1">
    <p className="text-muted-foreground text-xs">{label}</p>
    <p
      className={cn(
        'text-foreground flex min-w-0 items-center gap-1.5 text-sm font-semibold',
        valueClassName,
      )}
      title={typeof value === 'string' ? value : String(value)}
    >
      {Icon ? <Icon className="text-muted-foreground size-3.5 shrink-0" aria-hidden /> : null}
      <span className="truncate">{value}</span>
    </p>
  </div>
);

interface IncomingGatePassCardProps {
  entry: IncomingDaybookEntry;
}

export function IncomingGatePassCard({ entry }: IncomingGatePassCardProps) {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const preferences = usePreferencesStore((state) => state.preferences);
  const coldStorageName = useColdStorageStore((state) => state.coldStorage?.name);
  const coldStorageAddress = useColdStorageStore((state) => state.coldStorage?.address);
  const coldStorageLogo = useColdStorageStore((state) => state.coldStorage?.imageUrl);

  const farmerLink = entry.farmerStorageLinkId;
  const bagSizes = useMemo(() => {
    const sizes = entry.bagSizes ?? [];
    const commodities = preferences?.commodities ?? [];
    const sizeOrder = getBagSizeOrderForVariety(commodities, entry.variety);
    return sortByPreferenceOrder(sizes, sizeOrder);
  }, [entry.bagSizes, entry.variety, preferences?.commodities]);
  const totalBags = sumBagQuantities(bagSizes, 'initialQuantity');
  const lotNo = formatIncomingLotNo(entry, preferences, totalBags);
  const manualParchi = formatManualParchi(entry.manualParchiNumber);
  const remarks = entry.remarks?.trim() || '—';
  const truckNumber = entry.truckNumber?.trim() ? entry.truckNumber.trim().toUpperCase() : '—';
  const accountLabel = `#${farmerLink.accountNumber.toLocaleString('en-IN')}`;
  const isTransfer = isIncomingTransferType(entry.type);
  const isClosed = entry.status === 'CLOSED';
  const hasQuantityChanged = bagSizes.some((bag) => bag.initialQuantity !== bag.currentQuantity);
  const canEdit = entry.status === 'OPEN' && !hasQuantityChanged;
  const editDisabledTitle = hasQuantityChanged
    ? 'Cannot edit when initial and current quantities differ'
    : entry.status !== 'OPEN'
      ? 'Only open gate passes can be edited'
      : undefined;

  const handlePrint = useCallback(async () => {
    if (!coldStorageName) {
      toast.error('Cold storage details are not ready yet.');
      return;
    }

    try {
      setIsGeneratingPdf(true);

      const { generateIncomingGatePassPdf } =
        await import('@/features/daybook/utils/generate-incoming-gate-pass-pdf');

      const blob = await generateIncomingGatePassPdf({
        entry,
        preferences,
        coldStorageName,
        coldStorageAddress,
        coldStorageLogo: coldStorageLogo || undefined,
      });

      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      toast.error('Failed to generate PDF. Please try again.');
    } finally {
      setIsGeneratingPdf(false);
    }
  }, [coldStorageAddress, coldStorageLogo, coldStorageName, entry, preferences]);

  return (
    <Card className="card-hover border-border/60 overflow-hidden">
      <CardHeader className="border-border/40 bg-muted/10 flex flex-col gap-4 border-b pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <span className="bg-primary h-2 w-2 rounded-full" />
              IGP <span className="text-primary font-mono tabular-nums">#{entry.gatePassNo}</span>
            </CardTitle>
            {manualParchi !== '—' && (
              <Badge
                variant="outline"
                className="bg-background font-mono text-xs uppercase tabular-nums"
              >
                Manual: {manualParchi}
              </Badge>
            )}
          </div>
          <CardDescription className="text-xs">
            {formatDaybookDateTime(entry.date)}
          </CardDescription>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          {entry.stockFilter && (
            <Badge
              variant="outline"
              className="bg-background max-w-36 truncate text-xs"
              title={entry.stockFilter}
            >
              {entry.stockFilter}
            </Badge>
          )}
          <Badge variant="outline" className="bg-background text-xs" title={entry.variety}>
            {entry.variety}
          </Badge>
          <Badge
            variant={isClosed ? 'secondary' : 'outline'}
            className={cn(
              'text-xs',
              isClosed
                ? 'border-border bg-secondary text-secondary-foreground gap-1 font-semibold'
                : 'bg-background',
            )}
            title={entry.status}
          >
            {isClosed ? <Lock className="size-3 shrink-0" aria-hidden /> : null}
            {entry.status}
          </Badge>
          {isTransfer ? (
            <TransferGatePassBadge bagCount={totalBags} typeLabel={entry.type} tone="incoming" />
          ) : (
            <Badge variant="outline" className="bg-background text-xs tabular-nums">
              {formatQuantity(totalBags)} Bags
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-5">
        <div className="grid grid-cols-2 gap-x-4 gap-y-5 sm:grid-cols-3 lg:grid-cols-5 lg:gap-6">
          <SummaryField label="Farmer" value={farmerLink.name} icon={User} />
          <SummaryField
            label="Account"
            value={accountLabel}
            valueClassName="font-mono tabular-nums"
          />
          <SummaryField label="Variety" value={entry.variety} icon={Package} />
          <SummaryField label="Lot No" value={lotNo} valueClassName="font-mono tabular-nums" />
          <SummaryField
            label="Truck No"
            value={truckNumber}
            icon={Truck}
            valueClassName="font-mono uppercase tabular-nums"
          />
        </div>

        {isExpanded && (
          <div className="animate-in fade-in slide-in-from-top-4 mt-6 duration-300">
            <Separator className="mb-6" />
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="space-y-6">
                <div>
                  <h4 className="text-foreground mb-3 flex items-center gap-2 text-sm font-semibold">
                    <User className="text-primary h-4 w-4" />
                    Farmer information
                  </h4>
                  <div className="border-border/50 bg-muted/20 grid grid-cols-2 gap-4 rounded-xl border p-4">
                    <InfoBlock label="Name" value={farmerLink.name} />
                    <InfoBlock label="Mobile" value={farmerLink.mobileNumber} />
                    <div className="col-span-2">
                      <InfoBlock label="Address" value={farmerLink.address} />
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-foreground mb-3 flex items-center gap-2 text-sm font-semibold">
                    <FileText className="text-primary h-4 w-4" />
                    Remarks
                  </h4>
                  <div className="border-border/50 bg-muted/20 rounded-xl border p-4">
                    <p className="text-muted-foreground text-sm italic">{remarks}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="text-foreground mb-3 flex items-center gap-2 text-sm font-semibold">
                    <Warehouse className="text-primary h-4 w-4" />
                    Bag quantities & location
                  </h4>
                  <div className="border-border/50 overflow-x-auto rounded-xl border">
                    <table className="w-full caption-bottom text-sm">
                      <thead className="border-border/50 bg-muted/50 border-b">
                        <tr>
                          <th className="text-muted-foreground h-10 px-3 text-left text-xs font-medium">
                            Size
                          </th>
                          <th className="text-muted-foreground h-10 px-3 text-right text-xs font-medium">
                            Initial qty
                          </th>
                          <th className="text-muted-foreground h-10 px-3 text-right text-xs font-medium">
                            Current qty
                          </th>
                          <th className="text-muted-foreground h-10 px-3 text-left text-xs font-medium">
                            Location
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {bagSizes.map((bag, index) => (
                          <tr
                            key={`${bag.name}-${index}`}
                            className="border-border/40 border-b last:border-0"
                          >
                            <td className="text-foreground px-3 py-2.5 font-medium">{bag.name}</td>
                            <td className="text-foreground px-3 py-2.5 text-right font-medium tabular-nums">
                              {formatQuantity(bag.initialQuantity)}
                            </td>
                            <td className="text-foreground px-3 py-2.5 text-right font-medium tabular-nums">
                              {formatQuantity(bag.currentQuantity)}
                            </td>
                            <td className="text-muted-foreground px-3 py-2.5">
                              <span className="inline-flex items-center gap-1">
                                <MapPin className="h-3.5 w-3.5 shrink-0" />
                                {formatLocation(bag.location)}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {entry.createdBy && (
                  <div className="border-border/50 bg-muted/20 rounded-xl border p-4">
                    <InfoBlock label="Created by" value={entry.createdBy.name} />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="border-border/40 bg-muted/10 flex items-center justify-between border-t px-4 py-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-muted-foreground hover:text-foreground text-xs"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="mr-2 h-4 w-4" />
              View less
            </>
          ) : (
            <>
              <ChevronDown className="mr-2 h-4 w-4" />
              View full details
            </>
          )}
        </Button>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="bg-background h-8"
            disabled={!canEdit}
            title={editDisabledTitle}
            onClick={() =>
              navigate({
                to: '/incoming/$id',
                params: { id: entry._id },
              })
            }
          >
            <Pencil className="mr-2 h-3.5 w-3.5" />
            Edit
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="h-8"
            disabled={isGeneratingPdf || !coldStorageName}
            onClick={() => void handlePrint()}
          >
            {isGeneratingPdf ? (
              <>
                <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                Generating…
              </>
            ) : (
              <>
                <Printer className="mr-2 h-3.5 w-3.5" />
                Print
              </>
            )}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}

export function IncomingGatePassCardSkeleton() {
  return (
    <Card className="border-border/60 overflow-hidden">
      <CardHeader className="border-border/40 bg-muted/10 flex flex-col gap-4 border-b pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Skeleton className="h-6 w-36" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      </CardHeader>
      <CardContent className="pt-5">
        <div className="grid grid-cols-2 gap-x-4 gap-y-5 sm:grid-cols-3 lg:grid-cols-5 lg:gap-6">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="space-y-2">
              <Skeleton className="h-3 w-14" />
              <Skeleton className="h-5 w-full max-w-28" />
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="border-border/40 bg-muted/10 flex items-center justify-between border-t px-4 py-3">
        <Skeleton className="h-8 w-32" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-16 rounded-md" />
          <Skeleton className="h-8 w-16 rounded-md" />
        </div>
      </CardFooter>
    </Card>
  );
}
