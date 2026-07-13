import {
  ArrowLeftRight,
  ArrowRightFromLine,
  ArrowUpFromLine,
  FileText,
  History,
  Loader2,
  MoreHorizontal,
  RefreshCw,
  Search,
} from 'lucide-react';
import { useMemo } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Route } from '@/routes/_authenticated/daybook';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ListPaginationFooter } from '@/components/list-pagination-footer';
import { Item, ItemActions, ItemContent, ItemMedia, ItemTitle } from '@/components/ui/item';

import { Input } from '@/components/ui/input';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { useDaybook } from './api/use-daybook';
import { useDaybookSearch } from './api/use-daybook-search';
import { IncomingGatePassCard } from './components/incoming-gate-pass-card';
import { OutgoingGatePassCard } from './components/outgoing-gate-pass-card';
import { DaybookPageSkeleton } from './components/daybook-page-skeleton';
import { useDaybookSearchInput } from './hooks/use-daybook-search-input';
import {
  buildSearchEntries,
  DAYBOOK_PAGE_SIZE_OPTIONS,
  DAYBOOK_SEARCH_BY_OPTIONS,
  getSearchPlaceholder,
  type DaybookSearchBy,
  type DaybookSortBy,
  type DaybookType,
} from './search';
import { isIncomingDaybookEntry, isOutgoingDaybookEntry } from './types';
import { DEFAULT_INCOMING_EDIT_HISTORY_SEARCH } from '@/features/incoming-edit-history/search';
import { DEFAULT_OUTGOING_EDIT_HISTORY_SEARCH } from '@/features/outgoing-edit-history/search';

const DaybookPage = () => {
  const navigate = useNavigate({ from: Route.fullPath });
  const search = Route.useSearch();

  const { query, setDraftQuery } = useDaybookSearchInput(search.receiptNumber);
  const isSearchActive = Boolean(search.receiptNumber?.trim());

  const listQuery = useDaybook(search, { enabled: !isSearchActive });
  const searchQuery = useDaybookSearch(
    {
      receiptNumber: search.receiptNumber ?? '',
      searchBy: search.searchBy,
    },
    { enabled: isSearchActive },
  );

  const entries = useMemo(() => {
    if (!isSearchActive) {
      return listQuery.entries;
    }

    return buildSearchEntries(searchQuery.incoming, searchQuery.outgoing, {
      type: search.type,
      sortBy: search.sortBy,
    });
  }, [
    isSearchActive,
    listQuery.entries,
    search.type,
    search.sortBy,
    searchQuery.incoming,
    searchQuery.outgoing,
  ]);

  const pagination = listQuery.pagination;
  const gatePassCount = isSearchActive ? entries.length : pagination.totalItems;
  const currentPage = pagination.currentPage;
  const totalPages = Math.max(pagination.totalPages, 1);
  const isOnFirstPage = !pagination.hasPreviousPage;
  const isOnLastPage = !pagination.hasNextPage;
  const isFetching = isSearchActive ? searchQuery.isFetching : listQuery.isFetching;
  const isError = !isSearchActive && listQuery.isError;
  const searchError = isSearchActive && searchQuery.isError;
  const emptyMessage = isSearchActive ? searchQuery.emptyMessage : listQuery.emptyMessage;
  const showResultsLoading = isSearchActive && searchQuery.isLoading && !searchQuery.isError;
  const showSearchSpinner = isSearchActive && searchQuery.isFetching;

  const updateSearch = (patch: Partial<typeof search>) => {
    void navigate({
      search: (prev) => ({ ...prev, ...patch }),
    });
  };

  const handlePrevPage = () => {
    if (isOnFirstPage || isFetching) return;

    updateSearch({
      page: pagination.previousPage ?? Math.max(currentPage - 1, 1),
    });
  };

  const handleNextPage = () => {
    if (isOnLastPage || isFetching) return;

    updateSearch({
      page: pagination.nextPage ?? currentPage + 1,
    });
  };

  const handleGoToPage = (page: number) => {
    if (isFetching || page === currentPage) return;
    updateSearch({ page });
  };

  const rangeStart =
    pagination.totalItems === 0
      ? 0
      : Math.min((currentPage - 1) * search.limit + 1, pagination.totalItems);
  const rangeEnd =
    pagination.totalItems === 0 ? 0 : Math.min(currentPage * search.limit, pagination.totalItems);

  const handleTypeChange = (type: DaybookType) => {
    updateSearch({ type, page: 1 });
  };

  const handleSortChange = (sortBy: DaybookSortBy) => {
    updateSearch({ sortBy, page: 1 });
  };

  const handlePageSizeChange = (limit: number) => {
    updateSearch({ limit, page: 1 });
  };

  const handleSearchByChange = (searchBy: DaybookSearchBy) => {
    updateSearch({ searchBy, page: 1 });
  };

  const handleRefresh = () => {
    if (isSearchActive) {
      void searchQuery.refetch();
      return;
    }

    void listQuery.refetch();
  };

  const handleAddIncoming = () => {
    navigate({ to: '/incoming' });
  };

  const handleTransferStock = () => {
    navigate({ to: '/transfer' });
  };

  const handleIncomingEditHistory = () => {
    navigate({
      to: '/incoming/edit-history',
      search: DEFAULT_INCOMING_EDIT_HISTORY_SEARCH,
    });
  };

  const handleOutgoingEditHistory = () => {
    navigate({
      to: '/outgoing/edit-history',
      search: DEFAULT_OUTGOING_EDIT_HISTORY_SEARCH,
    });
  };

  const handleAddOutgoing = () => {
    navigate({ to: '/outgoing' });
  };

  const handleGetReports = () => {
    navigate({ to: '/reports/incoming' });
  };

  if (!isSearchActive && listQuery.isLoading) {
    return (
      <div className="flex min-w-0 flex-1 flex-col gap-4">
        <DaybookPageSkeleton />
      </div>
    );
  }

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-4">
      <Item variant="outline" size="sm">
        <ItemMedia variant="icon">
          <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
            <FileText className="text-primary h-5 w-5" />
          </div>
        </ItemMedia>

        <ItemContent>
          <ItemTitle>
            {gatePassCount} gate pass{gatePassCount === 1 ? '' : 'es'}
          </ItemTitle>
        </ItemContent>

        <ItemActions>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isFetching}>
            {isFetching ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Refresh
          </Button>
        </ItemActions>
      </Item>

      <div className="border-border bg-card text-card-foreground overflow-hidden rounded-xl border shadow-sm">
        <div className="p-3 sm:p-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative order-1 w-full min-w-0 sm:order-2 sm:flex-1">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />

              <Input
                placeholder={getSearchPlaceholder(search.searchBy)}
                className={`w-full pl-10${showSearchSpinner ? 'pr-10' : ''}`}
                inputMode="search"
                value={query}
                onChange={(event) => setDraftQuery(event.target.value)}
                aria-busy={showSearchSpinner}
              />

              {showSearchSpinner ? (
                <Loader2
                  className="text-muted-foreground pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 animate-spin"
                  aria-hidden
                />
              ) : null}
            </div>

            <div className="order-2 w-full sm:order-1 sm:w-[150px] sm:shrink-0">
              <Select value={search.searchBy} onValueChange={handleSearchByChange}>
                <SelectTrigger className="w-full min-w-0">
                  <SelectValue placeholder="Search by" />
                </SelectTrigger>

                <SelectContent>
                  {DAYBOOK_SEARCH_BY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <Separator />

        <div className="bg-muted/20 space-y-3 p-3 sm:space-y-4 sm:p-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
            <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-row">
              <Select value={search.sortBy} onValueChange={handleSortChange}>
                <SelectTrigger className="w-full min-w-0 sm:w-[150px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="latest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                </SelectContent>
              </Select>

              <Select value={search.type} onValueChange={handleTypeChange}>
                <SelectTrigger className="w-full min-w-0 sm:w-[150px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="incoming">Incoming</SelectItem>
                  <SelectItem value="outgoing">Outgoing</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:flex sm:shrink-0 sm:flex-row">
              <Button className="min-w-0 px-2.5 sm:px-3" onClick={handleAddIncoming}>
                <ArrowUpFromLine className="h-4 w-4 shrink-0 sm:mr-2" />
                <span className="truncate">Add Incoming</span>
              </Button>

              <Button
                variant="secondary"
                className="min-w-0 px-2.5 sm:px-3"
                onClick={handleAddOutgoing}
              >
                <ArrowRightFromLine className="h-4 w-4 shrink-0 sm:mr-2" />
                <span className="truncate">Add Outgoing</span>
              </Button>

              <Button
                variant="outline"
                className="min-w-0 px-2.5 sm:px-3"
                onClick={handleTransferStock}
              >
                <ArrowLeftRight className="h-4 w-4 shrink-0 sm:mr-2" />
                <span className="truncate">Transfer stock</span>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="min-w-0 shrink-0"
                    aria-label="More actions"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <DropdownMenuItem onSelect={handleGetReports}>
                    <FileText className="h-4 w-4" />
                    Get Reports
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={handleIncomingEditHistory}>
                    <History className="h-4 w-4" />
                    Incoming edit history
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={handleOutgoingEditHistory}>
                    <History className="h-4 w-4" />
                    Outgoing edit history
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      {searchError ? (
        <div
          role="alert"
          className="border-destructive/30 bg-destructive/5 text-destructive rounded-xl border px-4 py-3 text-sm"
        >
          {searchQuery.error instanceof Error
            ? searchQuery.error.message
            : 'Something went wrong while searching gate passes.'}
        </div>
      ) : null}

      {isError ? (
        <Empty className="bg-muted/10 rounded-xl border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FileText />
            </EmptyMedia>

            <EmptyTitle>Could not load daybook</EmptyTitle>

            <EmptyDescription>
              {listQuery.error instanceof Error
                ? listQuery.error.message
                : 'Something went wrong while fetching gate passes.'}
            </EmptyDescription>
          </EmptyHeader>

          <Button variant="outline" onClick={handleRefresh} disabled={isFetching}>
            Try again
          </Button>
        </Empty>
      ) : showResultsLoading ? (
        <DaybookPageSkeleton />
      ) : (
        entries.map((entry) =>
          isIncomingDaybookEntry(entry) ? (
            <IncomingGatePassCard key={entry._id} entry={entry} />
          ) : isOutgoingDaybookEntry(entry) ? (
            <OutgoingGatePassCard key={entry._id} entry={entry} />
          ) : null,
        )
      )}

      {!isError && !searchError && !showResultsLoading && entries.length === 0 && (
        <Empty className="bg-muted/10 rounded-xl border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FileText />
            </EmptyMedia>

            <EmptyTitle>No gate passes found</EmptyTitle>

            <EmptyDescription>
              {emptyMessage ?? 'To create a new incoming gate pass, click on Add Incoming button.'}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}

      {!isSearchActive ? (
        <ListPaginationFooter
          attached={false}
          rangeStart={rangeStart}
          rangeEnd={rangeEnd}
          totalItems={pagination.totalItems}
          itemLabel="gate passes"
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
      ) : null}
    </div>
  );
};

export default DaybookPage;
