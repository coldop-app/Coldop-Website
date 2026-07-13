import { Link, useNavigate } from '@tanstack/react-router';
import { Globe, History, Loader2, MapPin, Monitor, RefreshCw, User } from 'lucide-react';

import { ListPaginationFooter } from '@/components/list-pagination-footer';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { Item, ItemActions, ItemContent, ItemMedia, ItemTitle } from '@/components/ui/item';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { DAYBOOK_PAGE_SIZE_OPTIONS } from '@/features/daybook/search';
import { DaybookBackButton } from '@/features/daybook/components/daybook-back-button';
import { useIncomingGatePassEdits } from '@/features/incoming-edit-history/api/use-incoming-gate-pass-edits';
import type { IncomingBagSize } from '@/features/daybook/types';
import type {
  IncomingGatePassAudit,
  IncomingGatePassAuditState,
} from '@/features/incoming-edit-history/types';
import {
  formatAuditFieldValue,
  formatAuditLocation,
  getIncomingGatePassAuditChangedFields,
  INCOMING_GATE_PASS_AUDIT_FIELD_LABELS,
} from '@/features/incoming-edit-history/utils/format-audit-field-value';
import { cn } from '@/lib/utils';
import { Route } from '@/routes/_authenticated/incoming.edit-history';

function formatAuditTimestamp(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '-';

  return new Intl.DateTimeFormat('en-IN', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('en-IN').format(value);
}

function AuditBagSizesTable({ bagSizes }: { bagSizes: readonly IncomingBagSize[] }) {
  if (bagSizes.length === 0) {
    return <span>-</span>;
  }

  return (
    <div className="border-border/50 bg-background overflow-x-auto rounded-lg border">
      <table className="w-full min-w-[480px] caption-bottom text-sm">
        <thead className="border-border/50 bg-muted/50 border-b">
          <tr>
            <th className="text-muted-foreground h-10 px-3 text-left text-xs font-medium">Size</th>
            <th className="text-muted-foreground h-10 px-3 text-right text-xs font-medium">
              Current
            </th>
            <th className="text-muted-foreground h-10 px-3 text-right text-xs font-medium">
              Initial
            </th>
            <th className="text-muted-foreground h-10 px-3 text-left text-xs font-medium">
              Location
            </th>
          </tr>
        </thead>
        <tbody>
          {bagSizes.map((slot, index) => (
            <tr
              key={`${slot.name}-${slot.location.chamber}-${slot.location.floor}-${slot.location.row}-${index}`}
              className="border-border/40 border-b last:border-0"
            >
              <td className="text-foreground px-3 py-2.5 font-medium">{slot.name}</td>
              <td className="text-foreground px-3 py-2.5 text-right font-medium tabular-nums">
                {formatNumber(slot.currentQuantity)}
              </td>
              <td className="text-muted-foreground px-3 py-2.5 text-right tabular-nums">
                {formatNumber(slot.initialQuantity)}
              </td>
              <td className="text-muted-foreground px-3 py-2.5">
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  {formatAuditLocation(slot.location)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AuditFieldValue({
  field,
  value,
}: {
  field: keyof IncomingGatePassAuditState;
  value: unknown;
}) {
  if (field === 'bagSizes' && Array.isArray(value)) {
    return <AuditBagSizesTable bagSizes={value as IncomingBagSize[]} />;
  }

  return <>{formatAuditFieldValue(field, value)}</>;
}

function IncomingEditHistorySkeleton() {
  return (
    <div className="flex w-full flex-col gap-4">
      <DaybookBackButton />

      <Item variant="outline" size="sm">
        <ItemMedia variant="icon">
          <Skeleton className="h-10 w-10 rounded-lg" />
        </ItemMedia>
        <ItemContent>
          <Skeleton className="h-5 w-48" />
        </ItemContent>
        <ItemActions>
          <Skeleton className="h-9 w-24 rounded-md" />
        </ItemActions>
      </Item>

      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index} className="gap-0 py-0 shadow-sm">
            <CardHeader className="border-border/60 bg-muted/10 border-b">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-56" />
            </CardHeader>
            <CardContent className="py-4">
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function AuditChangeTable({ audit }: { audit: IncomingGatePassAudit }) {
  const changedFields = getIncomingGatePassAuditChangedFields(
    audit.previousState,
    audit.modifiedState,
  );

  if (changedFields.length === 0) {
    return (
      <CardContent className="text-muted-foreground py-3 text-sm">
        No field changes recorded.
      </CardContent>
    );
  }

  return (
    <CardContent className="px-0 pb-0">
      <Table className="min-w-[640px]">
        <TableHeader className="bg-muted/50">
          <TableRow className="hover:bg-transparent">
            <TableHead className="text-muted-foreground">Field</TableHead>
            <TableHead className="text-muted-foreground">Before</TableHead>
            <TableHead className="text-muted-foreground">After</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {changedFields.map((field) => (
            <TableRow key={field}>
              <TableCell className="text-foreground align-top font-medium">
                {INCOMING_GATE_PASS_AUDIT_FIELD_LABELS[field]}
              </TableCell>
              <TableCell className="text-muted-foreground align-top whitespace-normal">
                <AuditFieldValue field={field} value={audit.previousState?.[field]} />
              </TableCell>
              <TableCell className="text-foreground align-top whitespace-normal">
                <AuditFieldValue field={field} value={audit.modifiedState?.[field]} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </CardContent>
  );
}

function IncomingEditAuditCard({ audit }: { audit: IncomingGatePassAudit }) {
  return (
    <Card className="gap-0 overflow-hidden py-0 shadow-sm">
      <CardHeader className="border-border/60 bg-muted/10 border-b sm:px-5">
        <CardTitle className="font-heading text-base font-semibold">Gate pass edit</CardTitle>
        <CardDescription>{formatAuditTimestamp(audit.createdAt)}</CardDescription>
        <CardAction>
          <Button asChild variant="outline" size="sm" className="h-9 shrink-0">
            <Link to="/incoming/$id" params={{ id: audit.incomingGatePassId }}>
              View gate pass
            </Link>
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent className="border-border/60 grid gap-3 border-b py-4 sm:grid-cols-2 sm:px-5">
        <div className="flex items-start gap-2 text-sm">
          <User className="text-primary mt-0.5 h-5 w-5 shrink-0" />
          <div className="min-w-0">
            <p className="text-foreground font-medium">{audit.editedBy.name}</p>
            {audit.editedBy.mobileNumber ? (
              <p className="text-muted-foreground tabular-nums">{audit.editedBy.mobileNumber}</p>
            ) : null}
          </div>
        </div>

        {audit.ipAddress ? (
          <div className="flex items-start gap-2 text-sm">
            <Globe className="text-primary mt-0.5 h-5 w-5 shrink-0" />
            <div className="min-w-0">
              <p className="text-foreground font-medium">IP address</p>
              <p className="text-muted-foreground font-mono tabular-nums">{audit.ipAddress}</p>
            </div>
          </div>
        ) : null}

        {audit.userAgent ? (
          <div className={cn('min-w-0 text-sm', audit.ipAddress ? '' : 'sm:col-span-2')}>
            <div className="flex items-start gap-2">
              <Monitor className="text-primary mt-0.5 h-5 w-5 shrink-0" />
              <div className="min-w-0">
                <p className="text-foreground font-medium">User agent</p>
                <p className="text-muted-foreground truncate" title={audit.userAgent}>
                  {audit.userAgent}
                </p>
              </div>
            </div>
          </div>
        ) : null}
      </CardContent>

      <AuditChangeTable audit={audit} />
    </Card>
  );
}

const IncomingEditHistoryPage = () => {
  const navigate = useNavigate({ from: Route.fullPath });
  const search = Route.useSearch();

  const { audits, pagination, isLoading, isFetching, isError, error, refetch } =
    useIncomingGatePassEdits(search);

  const currentPage = pagination.page;
  const totalPages = Math.max(pagination.totalPages, 1);
  const totalCount = pagination.total;
  const isOnFirstPage = !pagination.hasPreviousPage;
  const isOnLastPage = !pagination.hasNextPage;
  const rangeStart =
    totalCount === 0 ? 0 : Math.min((currentPage - 1) * search.limit + 1, totalCount);
  const rangeEnd = totalCount === 0 ? 0 : Math.min(currentPage * search.limit, totalCount);

  const updateSearch = (patch: Partial<typeof search>) => {
    void navigate({
      search: (prev) => ({ ...prev, ...patch }),
    });
  };

  const handlePrevPage = () => {
    if (isOnFirstPage || isFetching) return;
    updateSearch({ page: Math.max(currentPage - 1, 1) });
  };

  const handleNextPage = () => {
    if (isOnLastPage || isFetching) return;
    updateSearch({ page: currentPage + 1 });
  };

  const handleGoToPage = (page: number) => {
    if (isFetching || page === currentPage) return;
    updateSearch({ page });
  };

  const handlePageSizeChange = (limit: number) => {
    updateSearch({ limit, page: 1 });
  };

  if (isLoading) {
    return <IncomingEditHistorySkeleton />;
  }

  return (
    <div className="flex w-full flex-col gap-4 sm:gap-6">
      <DaybookBackButton />

      <header className="min-w-0">
        <h1 className="font-heading text-foreground text-xl font-semibold tracking-tight sm:text-2xl">
          Incoming edit history
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Audit trail of incoming gate pass changes in your cold storage.
        </p>
      </header>

      <Item variant="outline" size="sm">
        <ItemMedia variant="icon">
          <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
            <History className="text-primary h-5 w-5" />
          </div>
        </ItemMedia>

        <ItemContent>
          <ItemTitle>
            {totalCount.toLocaleString('en-IN')} edit
            {totalCount === 1 ? '' : 's'}
          </ItemTitle>
        </ItemContent>

        <ItemActions>
          <Button variant="outline" size="sm" onClick={() => void refetch()} disabled={isFetching}>
            {isFetching ? (
              <Loader2 className="text-primary mr-2 h-5 w-5 animate-spin" />
            ) : (
              <RefreshCw className="text-primary mr-2 h-5 w-5" />
            )}
            Refresh
          </Button>
        </ItemActions>
      </Item>

      {isError ? (
        <Empty className="bg-muted/10 rounded-xl border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <History className="text-primary h-5 w-5" />
            </EmptyMedia>
            <EmptyTitle>Could not load edit history</EmptyTitle>
            <EmptyDescription>
              {error instanceof Error
                ? error.message
                : 'Something went wrong while fetching edit history.'}
            </EmptyDescription>
          </EmptyHeader>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => void refetch()}
            disabled={isFetching}
          >
            Try again
          </Button>
        </Empty>
      ) : audits.length > 0 ? (
        <div className="space-y-4">
          {audits.map((audit) => (
            <IncomingEditAuditCard key={audit._id} audit={audit} />
          ))}
        </div>
      ) : (
        <Empty className="bg-muted/10 rounded-xl border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <History className="text-primary h-5 w-5" />
            </EmptyMedia>
            <EmptyTitle>No edits recorded yet</EmptyTitle>
            <EmptyDescription>
              Changes to incoming gate passes will appear here after they are saved.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}

      <ListPaginationFooter
        attached={false}
        rangeStart={rangeStart}
        rangeEnd={rangeEnd}
        totalItems={totalCount}
        itemLabel="edits"
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={search.limit}
        pageSizeOptions={DAYBOOK_PAGE_SIZE_OPTIONS}
        onPageSizeChange={handlePageSizeChange}
        onPreviousPage={handlePrevPage}
        onNextPage={handleNextPage}
        onGoToPage={handleGoToPage}
        isPreviousDisabled={isOnFirstPage || isFetching}
        isNextDisabled={isOnLastPage || isFetching}
        isPageSizeDisabled={isFetching}
      />
    </div>
  );
};

export default IncomingEditHistoryPage;
