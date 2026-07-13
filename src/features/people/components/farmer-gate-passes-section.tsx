import { useEffect, useMemo, useState } from 'react';
import { FileText, Loader2, RefreshCw } from 'lucide-react';

import { ListPaginationFooter } from '@/components/list-pagination-footer';
import { Button } from '@/components/ui/button';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { Item, ItemActions, ItemContent, ItemMedia, ItemTitle } from '@/components/ui/item';
import {
  DAYBOOK_PAGE_SIZE_OPTIONS,
  type DaybookSearchBy,
  type DaybookSortBy,
  type DaybookType,
} from '@/features/daybook/search';
import { IncomingGatePassCard } from '@/features/daybook/components/incoming-gate-pass-card';
import { OutgoingGatePassCard } from '@/features/daybook/components/outgoing-gate-pass-card';
import { isIncomingDaybookEntry, isOutgoingDaybookEntry } from '@/features/daybook/types';
import {
  paginateFarmerGatePassEntries,
  useFarmerGatePasses,
} from '@/features/people/api/use-farmer-gate-passes';
import { FarmerGatePassesSectionSkeleton } from '@/features/people/components/farmer-gate-passes-section-skeleton';
import { FarmerGatePassesToolbar } from '@/features/people/components/farmer-gate-passes-toolbar';
import type { FarmerBagTotals } from '@/features/people/components/farmer-profile-card';
import { FarmerStockSummarySection } from '@/features/people/components/farmer-stock-summary-section';
import {
  filterFarmerGatePassEntries,
  filterFarmerGatePassEntriesByType,
} from '@/features/people/utils/filter-farmer-gate-pass-entries';
import { useDebouncedValue } from '@/hooks/use-debounced-value';

const SEARCH_DEBOUNCE_MS = 400;

const DEFAULT_TYPE: DaybookType = 'all';
const DEFAULT_SORT_BY: DaybookSortBy = 'latest';
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = DAYBOOK_PAGE_SIZE_OPTIONS[0];

type FarmerGatePassesSectionProps = {
  linkId: string;
  onSummariesChange?: (totals: FarmerBagTotals, isLoading: boolean) => void;
};

export function FarmerGatePassesSection({
  linkId,
  onSummariesChange,
}: FarmerGatePassesSectionProps) {
  const [type, setType] = useState<DaybookType>(DEFAULT_TYPE);
  const [sortBy, setSortBy] = useState<DaybookSortBy>(DEFAULT_SORT_BY);
  const [appliedFrom, setAppliedFrom] = useState<string | undefined>();
  const [appliedTo, setAppliedTo] = useState<string | undefined>();
  const [page, setPage] = useState(DEFAULT_PAGE);
  const [limit, setLimit] = useState<(typeof DAYBOOK_PAGE_SIZE_OPTIONS)[number]>(DEFAULT_LIMIT);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchBy, setSearchBy] = useState<DaybookSearchBy>('gatePassNumber');

  const debouncedSearchQuery = useDebouncedValue(searchQuery, SEARCH_DEBOUNCE_MS);

  const apiFilters = useMemo(
    () => ({
      type: 'all' as const,
      sortBy,
      ...(appliedFrom ? { from: appliedFrom } : {}),
      ...(appliedTo ? { to: appliedTo } : {}),
    }),
    [sortBy, appliedFrom, appliedTo],
  );

  const gatePasses = useFarmerGatePasses(linkId, apiFilters);

  const incomingPasses = useMemo(
    () => gatePasses.entries.filter(isIncomingDaybookEntry),
    [gatePasses.entries],
  );

  const outgoingPasses = useMemo(
    () => gatePasses.entries.filter(isOutgoingDaybookEntry),
    [gatePasses.entries],
  );

  const typeFilteredEntries = useMemo(
    () => filterFarmerGatePassEntriesByType(gatePasses.entries, type),
    [gatePasses.entries, type],
  );

  const filteredEntries = useMemo(
    () => filterFarmerGatePassEntries(typeFilteredEntries, debouncedSearchQuery, searchBy),
    [typeFilteredEntries, debouncedSearchQuery, searchBy],
  );

  const isSearchActive = debouncedSearchQuery.trim().length > 0;

  const { entries: visibleEntries, pagination } = useMemo(
    () => paginateFarmerGatePassEntries(filteredEntries, page, limit),
    [filteredEntries, page, limit],
  );

  const incomingGatePassCount = useMemo(
    () => gatePasses.entries.filter(isIncomingDaybookEntry).length,
    [gatePasses.entries],
  );

  const outgoingGatePassCount = useMemo(
    () =>
      gatePasses.entries.filter((entry) => isOutgoingDaybookEntry(entry) && entry.isNull !== true)
        .length,
    [gatePasses.entries],
  );

  const profileBagTotals = useMemo<FarmerBagTotals>(
    () => ({
      incomingGatePasses: incomingGatePassCount,
      outgoingGatePasses: outgoingGatePassCount,
      incomingBags: gatePasses.summaries.totalIncomingBags,
      outgoingBags: gatePasses.summaries.totalOutgoingBags,
      transferIncomingBags: gatePasses.summaries.totalInternallyTransferredIncomingBags,
      transferOutgoingBags: gatePasses.summaries.totalInternallyTransferredOutgoingBags,
    }),
    [
      incomingGatePassCount,
      outgoingGatePassCount,
      gatePasses.summaries.totalIncomingBags,
      gatePasses.summaries.totalOutgoingBags,
      gatePasses.summaries.totalInternallyTransferredIncomingBags,
      gatePasses.summaries.totalInternallyTransferredOutgoingBags,
    ],
  );

  useEffect(() => {
    onSummariesChange?.(profileBagTotals, gatePasses.isLoading);
  }, [profileBagTotals, gatePasses.isLoading, onSummariesChange]);

  const gatePassCount = pagination.totalItems;
  const currentPage = pagination.currentPage;
  const totalPages = Math.max(pagination.totalPages, 1);
  const isOnFirstPage = !pagination.hasPreviousPage;
  const isOnLastPage = !pagination.hasNextPage;
  const isFetching = gatePasses.isFetching;

  const rangeStart =
    pagination.totalItems === 0
      ? 0
      : Math.min((currentPage - 1) * limit + 1, pagination.totalItems);
  const rangeEnd =
    pagination.totalItems === 0 ? 0 : Math.min(currentPage * limit, pagination.totalItems);

  const handleSearchQueryChange = (value: string) => {
    setSearchQuery(value);
    setPage(1);
  };

  const handleSearchByChange = (nextSearchBy: DaybookSearchBy) => {
    setSearchBy(nextSearchBy);
    setPage(1);
  };

  const handleTypeChange = (nextType: DaybookType) => {
    setType(nextType);
    setPage(1);
  };

  const handleSortChange = (nextSortBy: DaybookSortBy) => {
    setSortBy(nextSortBy);
    setPage(1);
  };

  const handleApplyDates = (from?: string, to?: string) => {
    setAppliedFrom(from);
    setAppliedTo(to);
    setPage(1);
  };

  const handleResetDates = () => {
    setAppliedFrom(undefined);
    setAppliedTo(undefined);
    setPage(1);
  };

  const handlePrevPage = () => {
    if (isOnFirstPage || isFetching) return;
    setPage(pagination.previousPage ?? Math.max(currentPage - 1, 1));
  };

  const handleNextPage = () => {
    if (isOnLastPage || isFetching) return;
    setPage(pagination.nextPage ?? currentPage + 1);
  };

  const handleGoToPage = (nextPage: number) => {
    if (isFetching || nextPage === currentPage) return;
    setPage(nextPage);
  };

  const handlePageSizeChange = (nextLimit: number) => {
    if (
      !DAYBOOK_PAGE_SIZE_OPTIONS.includes(nextLimit as (typeof DAYBOOK_PAGE_SIZE_OPTIONS)[number])
    ) {
      return;
    }

    setLimit(nextLimit as (typeof DAYBOOK_PAGE_SIZE_OPTIONS)[number]);
    setPage(1);
  };

  const handleRefresh = () => {
    void gatePasses.refetch();
  };

  if (gatePasses.isLoading) {
    return <FarmerGatePassesSectionSkeleton />;
  }

  const countLabel =
    isSearchActive && gatePassCount !== typeFilteredEntries.length
      ? `${gatePassCount} of ${typeFilteredEntries.length} gate passes`
      : `${gatePassCount} gate pass${gatePassCount === 1 ? '' : 'es'}`;

  return (
    <div className="flex w-full min-w-0 flex-col gap-4">
      <FarmerGatePassesToolbar
        searchQuery={searchQuery}
        searchBy={searchBy}
        onSearchQueryChange={handleSearchQueryChange}
        onSearchByChange={handleSearchByChange}
        appliedFrom={appliedFrom}
        appliedTo={appliedTo}
        onApplyDates={handleApplyDates}
        onResetDates={handleResetDates}
        type={type}
        sortBy={sortBy}
        onTypeChange={handleTypeChange}
        onSortChange={handleSortChange}
      />

      <FarmerStockSummarySection
        passes={incomingPasses}
        outgoingPasses={outgoingPasses}
        allEntries={gatePasses.entries}
        isError={gatePasses.isError}
        error={gatePasses.error}
        isFetching={gatePasses.isFetching}
        onRefresh={handleRefresh}
        embedded
      />

      <Item variant="outline" size="sm">
        <ItemMedia variant="icon">
          <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
            <FileText className="text-primary h-5 w-5" />
          </div>
        </ItemMedia>

        <ItemContent>
          <ItemTitle>{countLabel}</ItemTitle>
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

      {gatePasses.isError ? (
        <Empty className="bg-muted/10 rounded-xl border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FileText />
            </EmptyMedia>

            <EmptyTitle>Could not load gate passes</EmptyTitle>

            <EmptyDescription>
              {gatePasses.error instanceof Error
                ? gatePasses.error.message
                : 'Something went wrong while fetching gate passes.'}
            </EmptyDescription>
          </EmptyHeader>

          <Button variant="outline" onClick={handleRefresh} disabled={isFetching}>
            Try again
          </Button>
        </Empty>
      ) : (
        visibleEntries.map((entry) =>
          isIncomingDaybookEntry(entry) ? (
            <IncomingGatePassCard key={entry._id} entry={entry} />
          ) : isOutgoingDaybookEntry(entry) ? (
            <OutgoingGatePassCard key={entry._id} entry={entry} />
          ) : null,
        )
      )}

      {!gatePasses.isError && pagination.totalItems === 0 && (
        <Empty className="bg-muted/10 rounded-xl border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FileText />
            </EmptyMedia>

            <EmptyTitle>No gate passes found</EmptyTitle>

            <EmptyDescription>
              {isSearchActive
                ? 'No gate passes match your search. Try a different term or search field.'
                : (gatePasses.emptyMessage ?? 'Try changing the filters or date range.')}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}

      {!gatePasses.isError ? (
        <ListPaginationFooter
          attached={false}
          rangeStart={rangeStart}
          rangeEnd={rangeEnd}
          totalItems={pagination.totalItems}
          itemLabel="gate passes"
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={limit}
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
}
