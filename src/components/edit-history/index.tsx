import { memo, useState, useMemo } from 'react';
import { useGetEditHistory } from '@/services/store-admin/functions/useGetEditHistory';
import type {
  EditHistoryEntry,
  EditHistorySnapshot,
  EditHistoryBagSize,
} from '@/services/store-admin/functions/useGetEditHistory';

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Item,
  ItemMedia,
  ItemTitle,
  ItemHeader,
  ItemActions,
  ItemFooter,
} from '@/components/ui/item';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyMedia,
} from '@/components/ui/empty';

import {
  History,
  Search,
  ChevronDown,
  RefreshCw,
  User,
  FileText,
} from 'lucide-react';
import { format } from 'date-fns';

/* ------------------------------------------------------------------ */
/* Helpers */
/* ------------------------------------------------------------------ */

function formatEditDate(dateStr: string | undefined): string {
  if (!dateStr) return '—';
  try {
    return format(new Date(dateStr), 'dd MMM yyyy, HH:mm');
  } catch {
    return '—';
  }
}

function formatLocation(bag: EditHistoryBagSize): string {
  const loc = bag.location;
  if (!loc) return '—';
  return `${loc.chamber}/${loc.floor}/${loc.row}`;
}

function SnapshotSummary({ snapshot }: { snapshot: EditHistorySnapshot }) {
  const bagSizes = snapshot.bagSizes ?? [];
  const totalBags = bagSizes.reduce((s, b) => s + b.currentQuantity, 0);
  const variety = snapshot.variety ?? '—';
  const status = (snapshot.status ?? '—').replace(/_/g, ' ');

  return (
    <div className="font-custom space-y-2 text-sm">
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 sm:grid-cols-4">
        <div>
          <span className="text-muted-foreground">Gate pass</span>
          <p className="font-medium">#{snapshot.gatePassNo ?? '—'}</p>
        </div>
        <div>
          <span className="text-muted-foreground">Manual parchi #</span>
          <p className="font-medium">{snapshot.manualParchiNumber ?? '—'}</p>
        </div>
        <div>
          <span className="text-muted-foreground">Date</span>
          <p className="font-medium">
            {snapshot.date
              ? format(new Date(snapshot.date), 'dd MMM yyyy')
              : '—'}
          </p>
        </div>
        <div>
          <span className="text-muted-foreground">Type</span>
          <p className="font-medium">{snapshot.type ?? '—'}</p>
        </div>
        <div>
          <span className="text-muted-foreground">Status</span>
          <p className="font-medium">{status}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 sm:grid-cols-4">
        <div>
          <span className="text-muted-foreground">Variety</span>
          <p className="font-medium">{variety}</p>
        </div>
        <div>
          <span className="text-muted-foreground">Total bags</span>
          <p className="font-medium">{totalBags}</p>
        </div>
      </div>
      {bagSizes.length > 0 && (
        <div className="mt-2">
          <span className="text-muted-foreground text-xs">Bag sizes</span>
          <ul className="mt-1 space-y-0.5 text-xs">
            {bagSizes.map((b, i) => (
              <li key={i}>
                {b.name}: {b.currentQuantity} @ {formatLocation(b)}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Skeleton */
/* ------------------------------------------------------------------ */

function EditHistorySkeleton() {
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
                    <Skeleton className="h-5 w-40" />
                  </div>
                  <Skeleton className="h-3.5 w-28" />
                </div>
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
            </CardHeader>
            <Skeleton className="h-12 w-full rounded-lg" />
          </div>
        </Card>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Entry card */
/* ------------------------------------------------------------------ */

type SortOrder = 'latest' | 'oldest';
const SORT_LABELS: Record<SortOrder, string> = {
  latest: 'Latest First',
  oldest: 'Oldest First',
};

interface EditHistoryEntryCardProps {
  entry: EditHistoryEntry;
}

const EditHistoryEntryCard = memo(function EditHistoryEntryCard({
  entry,
}: EditHistoryEntryCardProps) {
  const {
    editedBy,
    editedAt,
    action,
    changeSummary,
    snapshotBefore,
    snapshotAfter,
    entityType,
  } = entry;

  const [open, setOpen] = useState(false);

  return (
    <Card className="border-border/40 hover:border-primary/30 overflow-hidden pt-0 shadow-sm transition-all duration-200 hover:shadow-md">
      <div className="w-full px-4 py-4 sm:px-5 sm:py-5">
        <CardHeader className="px-0 pt-0 pb-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                <div className="bg-primary h-1.5 w-1.5 shrink-0 rounded-full" />
                <CardTitle className="font-custom text-foreground text-base font-bold tracking-tight">
                  {editedBy?.name ?? 'Unknown'}
                </CardTitle>
                <Badge
                  variant="secondary"
                  className="font-custom shrink-0 text-xs capitalize"
                >
                  {action}
                </Badge>
              </div>
              <CardDescription className="font-custom text-muted-foreground flex items-center gap-1.5 text-xs">
                <User className="h-3.5 w-3.5 shrink-0" />
                {formatEditDate(editedAt)}
                <span className="hidden sm:inline">· {entityType}</span>
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        {changeSummary && (
          <p className="font-custom text-muted-foreground mb-4 text-sm">
            {changeSummary}
          </p>
        )}

        <Collapsible open={open} onOpenChange={setOpen}>
          <CollapsibleTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="font-custom focus-visible:ring-primary w-full justify-between gap-2 rounded-lg focus-visible:ring-2 focus-visible:ring-offset-2"
            >
              <span>View before / after</span>
              <ChevronDown
                className={`h-4 w-4 shrink-0 transition-transform duration-200 ${
                  open ? 'rotate-180' : ''
                }`}
              />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="border-border/50 mt-4 grid gap-4 rounded-lg border p-4 sm:grid-cols-2">
              <div className="min-w-0 space-y-2">
                <h4 className="font-custom text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                  Before
                </h4>
                <div className="bg-muted/50 rounded-md p-3">
                  <SnapshotSummary snapshot={snapshotBefore} />
                </div>
              </div>
              <div className="min-w-0 space-y-2">
                <h4 className="font-custom text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                  After
                </h4>
                <div className="bg-muted/50 rounded-md p-3">
                  <SnapshotSummary snapshot={snapshotAfter} />
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </Card>
  );
});

/* ------------------------------------------------------------------ */
/* Page */
/* ------------------------------------------------------------------ */

const EditHistoryPage = memo(function EditHistoryPage() {
  const [sortOrder, setSortOrder] = useState<SortOrder>('latest');
  const [searchQuery, setSearchQuery] = useState('');

  const { data, isLoading, isError, error, isFetching, refetch } =
    useGetEditHistory();

  const entries = useMemo(() => {
    const list = data?.data ?? [];
    const sorted = [...list].sort((a, b) => {
      const dateA = new Date(a.editedAt).getTime();
      const dateB = new Date(b.editedAt).getTime();
      return sortOrder === 'latest' ? dateB - dateA : dateA - dateB;
    });
    if (!searchQuery.trim()) return sorted;
    const q = searchQuery.toLowerCase();
    return sorted.filter(
      (e) =>
        e.editedBy?.name?.toLowerCase().includes(q) ||
        e.changeSummary?.toLowerCase().includes(q) ||
        e.entityType?.toLowerCase().includes(q) ||
        e.action?.toLowerCase().includes(q)
    );
  }, [data?.data, sortOrder, searchQuery]);

  return (
    <main className="mx-auto max-w-7xl p-2 sm:p-4 lg:p-6">
      <div className="space-y-6">
        {/* Header: count + refresh */}
        <Item variant="outline" size="sm" className="rounded-xl shadow-sm">
          <ItemHeader className="h-full">
            <div className="flex items-center gap-3">
              <ItemMedia variant="icon" className="rounded-lg">
                <History className="text-primary h-5 w-5" />
              </ItemMedia>
              <ItemTitle className="font-custom text-sm font-semibold sm:text-base">
                {data?.data != null
                  ? `${data.data.length} edit${data.data.length === 1 ? '' : 's'}`
                  : 'Edit history'}
              </ItemTitle>
            </div>
            <ItemActions>
              <Button
                variant="outline"
                size="sm"
                disabled={isFetching}
                onClick={() => refetch()}
                className="font-custom focus-visible:ring-primary h-8 gap-2 rounded-lg px-3 focus-visible:ring-2 focus-visible:ring-offset-2"
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

        {/* Search + sort */}
        <Item
          variant="outline"
          size="sm"
          className="flex-col items-stretch gap-4 rounded-xl"
        >
          <div className="relative w-full">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              placeholder="Search by editor, summary, or type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="font-custom focus-visible:ring-primary w-full pl-10 focus-visible:ring-2 focus-visible:ring-offset-2"
              aria-label="Search edit history"
            />
          </div>
          <ItemFooter className="flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="font-custom focus-visible:ring-primary h-8 w-full gap-2 rounded-lg px-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 sm:w-auto"
                >
                  Sort: {SORT_LABELS[sortOrder]}
                  <ChevronDown className="h-4 w-4 shrink-0" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="font-custom">
                <DropdownMenuCheckboxItem
                  checked={sortOrder === 'latest'}
                  onCheckedChange={() => setSortOrder('latest')}
                >
                  Latest First
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={sortOrder === 'oldest'}
                  onCheckedChange={() => setSortOrder('oldest')}
                >
                  Oldest First
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </ItemFooter>
        </Item>

        {/* List */}
        <div className="min-h-[120px] w-full">
          {isLoading && <EditHistorySkeleton />}
          {isError && (
            <p className="font-custom text-destructive text-sm">
              {error instanceof Error
                ? error.message
                : 'Failed to load edit history'}
            </p>
          )}
          {!isLoading && !isError && entries.length === 0 && (
            <Empty className="font-custom border-border/40 rounded-xl border py-12">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <FileText className="text-muted-foreground size-6" />
                </EmptyMedia>
                <EmptyTitle>No edit history</EmptyTitle>
                <EmptyDescription>
                  {searchQuery.trim()
                    ? 'No edits match your search.'
                    : 'No edits recorded yet.'}
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
          {!isLoading && !isError && entries.length > 0 && (
            <div className="w-full space-y-4">
              {entries.map((entry) => (
                <EditHistoryEntryCard key={entry._id} entry={entry} />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
});

export default EditHistoryPage;
