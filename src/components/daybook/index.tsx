import { memo, useState } from 'react';
import { Link } from '@tanstack/react-router';

// import { Card } from '@/components/ui/card'; // used in DaybookEntryCard (commented)
import {
  Item,
  ItemHeader,
  ItemMedia,
  ItemTitle,
  ItemActions,
  ItemFooter,
} from '@/components/ui/item';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardHeader } from '@/components/ui/card';

import {
  Search,
  ChevronDown,
  RefreshCw,
  Receipt,
  ArrowUpFromLine,
  ArrowRightFromLine,
  FileText,
} from 'lucide-react';

import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyMedia,
} from '@/components/ui/empty';

import { useGetDaybook } from '@/services/store-admin/functions/useGetDaybook';
import type {
  DaybookEntry,
  IncomingGatePassEntry,
  OutgoingGatePassEntry,
} from '@/services/store-admin/functions/useGetDaybook';
import { useSearchDaybook } from '@/services/store-admin/functions/useSearchDaybook';
import IncomingGatePassCard from '@/components/daybook/incoming-gate-pass-card';
import OutgoingGatePassCard from '@/components/daybook/outgoing-gate-pass-card';

/* ------------------------------------------------------------------ */
/* Fake Data */
/* ------------------------------------------------------------------ */

const LIMIT_OPTIONS = [10, 25, 50, 100];

type OrderFilter = 'all' | 'incoming' | 'outgoing';
type SortOrder = 'latest' | 'oldest';

const ORDER_LABELS: Record<OrderFilter, string> = {
  all: 'All Orders',
  incoming: 'Incoming',
  outgoing: 'Outgoing',
};

const SORT_LABELS: Record<SortOrder, string> = {
  latest: 'Latest First',
  oldest: 'Oldest First',
};

/* ------------------------------------------------------------------ */
/* Skeleton loader */
/* ------------------------------------------------------------------ */

function DaybookSkeleton() {
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

const DaybookPage = memo(function DaybookPage() {
  const [orderFilter, setOrderFilter] = useState<OrderFilter>('all');
  const [sortOrder, setSortOrder] = useState<SortOrder>('latest');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchReceipt, setSearchReceipt] = useState('');

  const { data, isLoading, isError, error, isFetching, refetch } =
    useGetDaybook({
      type: orderFilter,
      sortBy: sortOrder,
      page,
      limit,
    });

  const searchDaybook = useSearchDaybook();
  const searchResult = searchDaybook.data;
  const isSearchMode = searchResult !== undefined;

  const handleSearchReceiptChange = (value: string) => {
    setSearchReceipt(value.replace(/\D/g, ''));
  };

  const handleSearchSubmit = () => {
    const trimmed = searchReceipt.trim();
    if (trimmed) {
      searchDaybook.mutate({ receiptNumber: trimmed });
    }
  };

  const handleClearSearch = () => {
    searchDaybook.reset();
    setSearchReceipt('');
  };

  const pagination = data?.pagination;
  const hasPreviousPage = pagination?.hasPreviousPage ?? false;
  const hasNextPage = pagination?.hasNextPage ?? false;
  const currentPage = pagination?.currentPage ?? 1;
  const totalPages = pagination?.totalPages ?? 1;

  const handleOrderFilterChange = (value: OrderFilter) => {
    setOrderFilter(value);
    setPage(1);
  };

  const handleSortOrderChange = (value: SortOrder) => {
    setSortOrder(value);
    setPage(1);
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  };

  const entries: DaybookEntry[] = isSearchMode
    ? [...(searchResult?.incoming ?? []), ...(searchResult?.outgoing ?? [])]
    : (data?.data ?? []);

  /** API message when daybook has no orders (e.g. "Cold storage doesn't have any orders") */
  const emptyMessage = data?.message;

  return (
    <main className="mx-auto max-w-7xl p-2 sm:p-4 lg:p-6">
      <div className="space-y-6">
        {/* Header: count + refresh */}
        <Item variant="outline" size="sm" className="rounded-xl shadow-sm">
          <ItemHeader className="h-full">
            <div className="flex items-center gap-3">
              <ItemMedia variant="icon" className="rounded-lg">
                <Receipt className="text-primary h-5 w-5" />
              </ItemMedia>
              <ItemTitle className="font-custom text-sm font-semibold sm:text-base">
                {data?.pagination != null
                  ? `${data.pagination.totalItems} gate passes`
                  : 'Daybook'}
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

        {/* Search + filters (same layout/spacing as people page) */}
        <Item
          variant="outline"
          size="sm"
          className="flex-col items-stretch gap-4 rounded-xl"
        >
          {/* Search by receipt number (numbers only) */}
          <div className="relative flex w-full gap-2">
            <div className="relative flex-1">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="Search by gate pass no"
                value={searchReceipt}
                onChange={(e) => handleSearchReceiptChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSearchSubmit();
                  }
                }}
                className="font-custom focus-visible:ring-primary w-full pl-10 focus-visible:ring-2 focus-visible:ring-offset-2"
                aria-label="Search by gate pass no (numbers only)"
              />
            </div>
            <Button
              variant="default"
              size="sm"
              className="font-custom focus-visible:ring-primary h-8 shrink-0 gap-2 rounded-lg px-3 focus-visible:ring-2 focus-visible:ring-offset-2"
              onClick={handleSearchSubmit}
              disabled={!searchReceipt.trim() || searchDaybook.isPending}
            >
              {searchDaybook.isPending ? (
                <RefreshCw className="h-4 w-4 shrink-0 animate-spin" />
              ) : (
                'Search'
              )}
            </Button>
            {isSearchMode && (
              <Button
                variant="outline"
                size="sm"
                className="font-custom focus-visible:ring-primary h-8 shrink-0 gap-2 rounded-lg px-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                onClick={handleClearSearch}
              >
                Clear
              </Button>
            )}
          </div>

          <ItemFooter className="flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex w-full flex-col gap-3 sm:flex-1 sm:flex-row sm:flex-nowrap sm:items-center sm:gap-4">
              {/* Orders filter */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="font-custom focus-visible:ring-primary h-8 w-full gap-2 rounded-lg px-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 sm:w-auto"
                  >
                    Orders: {ORDER_LABELS[orderFilter]}
                    <ChevronDown className="h-4 w-4 shrink-0" />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="start" className="font-custom">
                  <DropdownMenuCheckboxItem
                    checked={orderFilter === 'all'}
                    onCheckedChange={() => handleOrderFilterChange('all')}
                  >
                    All Orders
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={orderFilter === 'incoming'}
                    onCheckedChange={() => handleOrderFilterChange('incoming')}
                  >
                    Incoming
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={orderFilter === 'outgoing'}
                    onCheckedChange={() => handleOrderFilterChange('outgoing')}
                  >
                    Outgoing
                  </DropdownMenuCheckboxItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Latest / Oldest sort */}
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
                    onCheckedChange={() => handleSortOrderChange('latest')}
                  >
                    Latest First
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={sortOrder === 'oldest'}
                    onCheckedChange={() => handleSortOrderChange('oldest')}
                  >
                    Oldest First
                  </DropdownMenuCheckboxItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Action buttons (primary/secondary same width & spacing as people "New Farmer") */}
            <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:flex-nowrap">
              <Button
                className="font-custom h-10 w-full gap-2 sm:w-auto"
                asChild
              >
                <Link to="/store-admin/incoming">
                  <ArrowUpFromLine className="h-4 w-4 shrink-0" />
                  Add Incoming
                </Link>
              </Button>
              <Button
                variant="secondary"
                className="font-custom h-10 w-full gap-2 sm:w-auto"
                asChild
              >
                <Link to="/store-admin/outgoing">
                  <ArrowRightFromLine className="h-4 w-4 shrink-0" />
                  Add Outgoing
                </Link>
              </Button>
              <Button
                variant="secondary"
                className="font-custom h-10 w-full gap-2 sm:w-auto"
                asChild
              >
                <a href="#">
                  <FileText className="h-4 w-4 shrink-0" />
                  Get Reports
                </a>
              </Button>
            </div>
          </ItemFooter>
        </Item>

        {/* Search results or Daybook list */}
        <div className="min-h-[120px] w-full">
          {isSearchMode && searchDaybook.isError && (
            <p className="font-custom text-destructive text-sm">
              Search failed. Please try again.
            </p>
          )}
          {!isSearchMode && isLoading && <DaybookSkeleton />}
          {!isSearchMode && isError && (
            <p className="font-custom text-destructive text-sm">
              {error instanceof Error
                ? error.message
                : 'Failed to load daybook'}
            </p>
          )}
          {!isSearchMode && !isLoading && !isError && entries.length === 0 && (
            <Empty className="font-custom border-border/40 rounded-xl border py-12">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <FileText className="text-muted-foreground size-6" />
                </EmptyMedia>
                <EmptyTitle>No orders yet</EmptyTitle>
                <EmptyDescription>
                  {emptyMessage ?? 'No gate passes to show.'}
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
          {isSearchMode && searchResult != null && entries.length === 0 && (
            <p className="font-custom text-muted-foreground text-sm">
              No gate passes found for this receipt number.
            </p>
          )}
          {((!isSearchMode && !isLoading && !isError) || isSearchMode) &&
            entries.length > 0 && (
              <div className="w-full space-y-4">
                {entries.map((entry) =>
                  entry.type === 'RECEIPT' ? (
                    <IncomingGatePassCard
                      key={entry._id}
                      entry={entry as IncomingGatePassEntry}
                    />
                  ) : (
                    <OutgoingGatePassCard
                      key={entry._id}
                      entry={entry as OutgoingGatePassEntry}
                    />
                  )
                )}
              </div>
            )}
        </div>

        {/* Pagination (hidden when showing search results) */}
        {!isSearchMode && (
          <Item
            variant="outline"
            className="flex flex-wrap items-center justify-between gap-4"
          >
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="font-custom focus-visible:ring-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                >
                  {limit} per page
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent className="font-custom">
                {LIMIT_OPTIONS.map((n) => (
                  <DropdownMenuItem
                    key={n}
                    onClick={() => handleLimitChange(n)}
                  >
                    {n} per page
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (hasPreviousPage && pagination?.previousPage != null) {
                        setPage(pagination.previousPage);
                      }
                    }}
                    aria-disabled={!hasPreviousPage}
                    className={
                      !hasPreviousPage
                        ? 'pointer-events-none opacity-50'
                        : undefined
                    }
                  />
                </PaginationItem>

                <PaginationItem>
                  <span className="font-custom px-4 text-sm">
                    Page {currentPage} of {totalPages}
                  </span>
                </PaginationItem>

                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (hasNextPage && pagination?.nextPage != null) {
                        setPage(pagination.nextPage);
                      }
                    }}
                    aria-disabled={!hasNextPage}
                    className={
                      !hasNextPage
                        ? 'pointer-events-none opacity-50'
                        : undefined
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </Item>
        )}
      </div>
    </main>
  );
});

export default DaybookPage;
