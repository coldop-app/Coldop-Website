import { useMemo, useState } from 'react';
import { Loader2, RefreshCw, Search, UserPlus, Users } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { Input } from '@/components/ui/input';
import { Item, ItemActions, ItemContent, ItemMedia, ItemTitle } from '@/components/ui/item';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useFarmerStorageLinks } from '@/features/people/api/use-farmer-storage-links';
import { AddFarmerDialog } from '@/features/people/components/add-farmer-dialog';
import { PeopleCard } from '@/features/people/components/people-card';
import { PeoplePageSkeleton } from '@/features/people/components/people-page-skeleton';
import type { FarmerStorageLink } from '@/features/people/types';
import { getLinkDisplayName } from '@/features/people/utils/get-link-display-fields';

type SortOrder = 'account-asc' | 'account-desc';

function filterAndSortPeople(
  links: FarmerStorageLink[],
  search: string,
  sortOrder: SortOrder,
): FarmerStorageLink[] {
  const normalizedSearch = search.trim().toLowerCase();

  const filtered = normalizedSearch
    ? links.filter((link) => getLinkDisplayName(link).toLowerCase().includes(normalizedSearch))
    : links;

  return [...filtered].sort((a, b) => {
    const diff = a.accountNumber - b.accountNumber;
    return sortOrder === 'account-asc' ? diff : -diff;
  });
}

const PeoplePage = () => {
  const [search, setSearch] = useState('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('account-asc');
  const [addFarmerOpen, setAddFarmerOpen] = useState(false);

  const {
    data: farmerStorageLinks,
    isLoading,
    isError,
    error,
    isFetching,
    refetch,
  } = useFarmerStorageLinks();

  const visiblePeople = useMemo(
    () => filterAndSortPeople(farmerStorageLinks, search, sortOrder),
    [farmerStorageLinks, search, sortOrder],
  );

  const peopleCount = farmerStorageLinks.length;
  const hasSearch = search.trim().length > 0;

  if (isLoading) {
    return (
      <div className="flex min-w-0 flex-1 flex-col gap-4 sm:gap-6">
        <PeoplePageSkeleton />
      </div>
    );
  }

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-4 sm:gap-6">
      <Item variant="outline" size="sm">
        <ItemMedia variant="icon">
          <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
            <Users className="text-primary h-5 w-5" />
          </div>
        </ItemMedia>

        <ItemContent>
          <ItemTitle>{peopleCount} people</ItemTitle>
        </ItemContent>

        <ItemActions>
          <Button variant="outline" size="sm" onClick={() => void refetch()} disabled={isFetching}>
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
          <div className="relative w-full">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />

            <Input
              placeholder="Search by name"
              className="w-full pl-10"
              inputMode="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
        </div>

        <Separator />

        <div className="bg-muted/20 space-y-3 p-3 sm:space-y-4 sm:p-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
            <div>
              <Select value={sortOrder} onValueChange={(value) => setSortOrder(value as SortOrder)}>
                <SelectTrigger className="w-full min-w-0 sm:w-[150px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="account-asc">Account # (Low to High)</SelectItem>
                  <SelectItem value="account-desc">Account # (High to Low)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="sm:shrink-0">
              <Button
                type="button"
                variant="secondary"
                className="h-auto min-h-9 w-full shrink-0 gap-1.5 px-3 sm:w-auto"
                onClick={() => setAddFarmerOpen(true)}
                aria-label="Add farmer"
              >
                <UserPlus className="size-4 shrink-0" />
                <span className="hidden sm:inline">Add Farmer</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {isError ? (
        <Empty className="bg-muted/10 rounded-xl border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Users />
            </EmptyMedia>

            <EmptyTitle>Could not load people</EmptyTitle>

            <EmptyDescription>
              {error instanceof Error
                ? error.message
                : 'Something went wrong while fetching people.'}
            </EmptyDescription>
          </EmptyHeader>

          <Button
            variant="outline"
            className="mt-4"
            onClick={() => void refetch()}
            disabled={isFetching}
          >
            {isFetching ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Try again
          </Button>
        </Empty>
      ) : visiblePeople.length === 0 ? (
        <Empty className="bg-muted/10 rounded-xl border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Users />
            </EmptyMedia>

            <EmptyTitle>{hasSearch ? 'No matching people' : 'No people yet'}</EmptyTitle>

            <EmptyDescription>
              {hasSearch
                ? 'Try a different name or clear the search.'
                : 'Farmer accounts linked to your cold storage will appear here.'}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visiblePeople.map((link) => (
            <PeopleCard key={link._id} link={link} />
          ))}
        </div>
      )}

      <AddFarmerDialog
        open={addFarmerOpen}
        onOpenChange={setAddFarmerOpen}
        links={farmerStorageLinks}
      />
    </div>
  );
};

export default PeoplePage;
