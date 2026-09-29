import { useMemo, type ReactNode } from 'react';
import { useNavigate } from '@tanstack/react-router';
import {
  AlertCircle,
  ArrowLeft,
  FileText,
  Lock,
  MapPin,
  Package,
  RefreshCw,
  User,
  Wallet,
  Warehouse,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { Skeleton } from '@/components/ui/skeleton';
import { usePreferencesStore } from '@/features/auth/store/use-preferences-store';
import {
  isIncomingTransferType,
  TransferGatePassBadge,
} from '@/features/daybook/components/transfer-gate-pass-badge';
import {
  buildGatePassEditBackTarget,
  navigateToGatePassEditBackTarget,
  type GatePassEditSearch,
} from '@/features/daybook/gate-pass-edit-search';
import {
  formatDaybookDate,
  formatDaybookDateTime,
  formatLocation,
  formatLotNo,
  formatManualParchi,
  formatQuantity,
  sumBagQuantities,
} from '@/features/daybook/utils/format';
import { formatInr } from '@/features/finances/shared/format-currency';
import {
  isIncomingGatePassNotFound,
  useIncomingGatePass,
} from '@/features/incoming/api/use-incoming-gate-pass';
import type { IncomingGatePassDetail } from '@/features/incoming/types/api';
import {
  getBagSizeOrderForVariety,
  sortByPreferenceOrder,
} from '@/features/incoming/utils/incoming-preferences';
import { cn } from '@/lib/utils';

type IncomingGatePassDetailPageProps = {
  id: string;
  search: GatePassEditSearch;
};

function DetailField({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="min-w-0 space-y-1">
      <p className="text-muted-foreground text-xs">{label}</p>
      <p
        className={cn(
          'text-foreground truncate text-sm font-semibold',
          mono && 'font-mono tabular-nums',
        )}
        title={value}
      >
        {value}
      </p>
    </div>
  );
}

function SectionHeading({ icon: Icon, title }: { icon: typeof User; title: string }) {
  return (
    <h2 className="text-foreground flex items-center gap-2 text-sm font-semibold">
      <Icon className="text-primary size-4" aria-hidden />
      {title}
    </h2>
  );
}

function BackButton({ search }: { search: GatePassEditSearch }) {
  const navigate = useNavigate();
  const back = buildGatePassEditBackTarget(search);

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => navigateToGatePassEditBackTarget(navigate, search)}
    >
      <ArrowLeft className="mr-2 h-4 w-4" />
      {back.label}
    </Button>
  );
}

function DetailSkeleton() {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-4 sm:gap-6">
      <Skeleton className="h-8 w-36" />
      <Card className="border-border/60 overflow-hidden">
        <CardHeader className="border-border/40 bg-muted/10 gap-3 border-b">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-5 pt-5 sm:grid-cols-3 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="space-y-2">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-5 w-full max-w-28" />
            </div>
          ))}
        </CardContent>
      </Card>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Skeleton className="h-40 rounded-xl" />
        <Skeleton className="h-40 rounded-xl" />
      </div>
      <Skeleton className="h-48 rounded-xl" />
    </div>
  );
}

function DetailStatus({
  search,
  title,
  description,
  action,
}: {
  search: GatePassEditSearch;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-4 sm:gap-6">
      <BackButton search={search} />
      <Empty className="border-border border border-dashed">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <AlertCircle aria-hidden />
          </EmptyMedia>
          <EmptyTitle>{title}</EmptyTitle>
          <EmptyDescription>{description}</EmptyDescription>
        </EmptyHeader>
        {action ? <EmptyContent>{action}</EmptyContent> : null}
      </Empty>
    </div>
  );
}

function GatePassBody({ entry }: { entry: IncomingGatePassDetail }) {
  const preferences = usePreferencesStore((state) => state.preferences);
  const showFinances = preferences?.showFinances ?? true;

  const bagSizes = useMemo(() => {
    const commodities = preferences?.commodities ?? [];
    const sizeOrder = getBagSizeOrderForVariety(commodities, entry.variety);
    return sortByPreferenceOrder(entry.bagSizes, sizeOrder);
  }, [entry.bagSizes, entry.variety, preferences?.commodities]);

  const initialBags = sumBagQuantities(bagSizes, 'initialQuantity');
  const currentBags = sumBagQuantities(bagSizes, 'currentQuantity');
  const farmer = entry.farmerStorageLinkId;
  const lotNo = formatLotNo(
    {
      gatePassNo: entry.gatePassNo,
      accountNumber: farmer.accountNumber,
      customMarka: entry.customMarka,
    },
    preferences,
    initialBags,
  );
  const remarks = entry.remarks?.trim();
  const truckNumber = entry.truckNumber?.trim();
  const manualParchi = formatManualParchi(entry.manualParchiNumber);
  const isClosed = entry.status === 'CLOSED';
  const isTransfer = isIncomingTransferType(entry.type);
  const voucher = showFinances ? entry.rentEntryVoucherId : undefined;

  return (
    <div className="flex min-w-0 flex-col gap-4 sm:gap-6">
      <Card className="border-border/60 overflow-hidden">
        <CardHeader className="border-border/40 bg-muted/10 flex flex-col gap-4 border-b sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1.5">
            <CardTitle className="flex flex-wrap items-center gap-3 text-xl">
              <span className="bg-primary h-2 w-2 rounded-full" />
              IGP <span className="text-primary font-mono tabular-nums">#{entry.gatePassNo}</span>
              {manualParchi !== '—' ? (
                <Badge variant="outline" className="bg-background font-mono text-xs uppercase">
                  Manual: {manualParchi}
                </Badge>
              ) : null}
            </CardTitle>
            <p className="text-muted-foreground text-xs">{formatDaybookDateTime(entry.date)}</p>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            {entry.stockFilter ? (
              <Badge variant="outline" className="bg-background text-xs" title={entry.stockFilter}>
                {entry.stockFilter}
              </Badge>
            ) : null}
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
            >
              {isClosed ? <Lock className="size-3 shrink-0" aria-hidden /> : null}
              {entry.status}
            </Badge>
            {isTransfer ? (
              <TransferGatePassBadge
                bagCount={initialBags}
                typeLabel={entry.type}
                tone="incoming"
              />
            ) : (
              <Badge variant="outline" className="bg-background text-xs">
                {entry.type}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-x-4 gap-y-5 pt-5 sm:grid-cols-3 lg:grid-cols-6">
          <DetailField label="Farmer" value={farmer.name} />
          <DetailField
            label="Account"
            value={`#${farmer.accountNumber.toLocaleString('en-IN')}`}
            mono
          />
          <DetailField label="Lot No" value={lotNo} mono />
          {truckNumber ? (
            <DetailField label="Truck No" value={truckNumber.toUpperCase()} mono />
          ) : null}
          <DetailField label="Initial bags" value={formatQuantity(initialBags)} mono />
          <DetailField label="Current bags" value={formatQuantity(currentBags)} mono />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="border-border/60">
          <CardHeader>
            <SectionHeading icon={User} title="Farmer" />
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <DetailField label="Name" value={farmer.name} />
            <DetailField label="Mobile" value={farmer.mobileNumber} mono />
            <div className="col-span-2">
              <DetailField label="Address" value={farmer.address} />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader>
            <SectionHeading icon={Package} title="Receipt" />
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <DetailField label="Variety" value={entry.variety} />
            <DetailField label="Type" value={entry.type} />
            {entry.customMarka?.trim() ? (
              <DetailField label="Marka" value={entry.customMarka.trim()} mono />
            ) : null}
            {remarks ? (
              <div className="col-span-2 space-y-1">
                <p className="text-muted-foreground flex items-center gap-1.5 text-xs">
                  <FileText className="size-3.5" aria-hidden />
                  Remarks
                </p>
                <p className="text-foreground text-sm">{remarks}</p>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/60">
        <CardHeader>
          <SectionHeading icon={Warehouse} title="Bag quantities and location" />
        </CardHeader>
        <CardContent>
          <div className="border-border/50 overflow-x-auto rounded-xl border">
            <table className="w-full text-sm">
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
                {bagSizes.map((bag, index) => {
                  const location = formatLocation(bag.location);
                  return (
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
                      <td className="text-foreground px-3 py-2.5">
                        <span className="inline-flex items-center gap-1.5 text-sm">
                          <MapPin className="text-primary size-3.5 shrink-0" aria-hidden />
                          {location}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {voucher ? (
        <Card className="border-border/60">
          <CardHeader>
            <SectionHeading icon={Wallet} title="Rent voucher" />
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <DetailField label="Voucher" value={`#${voucher.voucherNumber}`} mono />
            <DetailField label="Date" value={formatDaybookDate(voucher.date)} />
            <DetailField label="Amount" value={formatInr(voucher.amount)} mono />
            <DetailField label="Debit" value={voucher.debitLedger.name} />
            <DetailField label="Credit" value={voucher.creditLedger.name} />
            {voucher.narration?.trim() ? (
              <div className="col-span-2 space-y-1 sm:col-span-3">
                <p className="text-muted-foreground text-xs">Narration</p>
                <p className="text-foreground text-sm">{voucher.narration.trim()}</p>
              </div>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      <p className="text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 text-xs">
        <span>
          Created by <span className="text-foreground font-medium">{entry.createdBy.name}</span>
        </span>
        <span>Created {formatDaybookDateTime(entry.createdAt)}</span>
        <span>Updated {formatDaybookDateTime(entry.updatedAt)}</span>
      </p>
    </div>
  );
}

export function IncomingGatePassDetailPage({ id, search }: IncomingGatePassDetailPageProps) {
  const { data, isLoading, isError, error, refetch, isFetching } = useIncomingGatePass(id);

  if (isLoading) {
    return <DetailSkeleton />;
  }

  if (isError && isIncomingGatePassNotFound(error)) {
    return (
      <DetailStatus
        search={search}
        title="Gate pass not found"
        description="This incoming gate pass is missing, or it does not belong to this cold storage."
      />
    );
  }

  if (isError || !data) {
    const message = error instanceof Error ? error.message : 'Failed to load incoming gate pass';

    return (
      <DetailStatus
        search={search}
        title="Could not load gate pass"
        description={message}
        action={
          <Button
            type="button"
            variant="outline"
            onClick={() => void refetch()}
            disabled={isFetching}
            className="gap-2"
          >
            <RefreshCw className={cn('size-4', isFetching && 'animate-spin')} aria-hidden />
            Try again
          </Button>
        }
      />
    );
  }

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-4 sm:gap-6">
      <BackButton search={search} />
      <GatePassBody entry={data} />
    </div>
  );
}
