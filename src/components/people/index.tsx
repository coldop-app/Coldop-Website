import { memo, useState, useMemo } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useGetAllFarmers } from '@/services/store-admin/functions/useGetAllFarmers';
import type { FarmerStorageLink } from '@/types/farmer';

import {
  Card,
  CardContent,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { AddFarmerModal } from '@/components/forms/add-farmer-modal';
import {
  User,
  Phone,
  MapPin,
  CheckCircle2,
  XCircle,
  Search,
  ChevronDown,
  RefreshCw,
} from 'lucide-react';

const PeoplePage = memo(function PeoplePage() {
  const { data, isLoading, error, refetch, isFetching } = useGetAllFarmers();

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'Name' | 'Account Number'>('Name');

  const links = useMemo(() => data ?? [], [data]);

  const filteredLinks = useMemo(() => {
    let result = links;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (link) =>
          link.farmerId.name.toLowerCase().includes(q) ||
          link.farmerId.mobileNumber.includes(q) ||
          link.accountNumber.toString().includes(q) ||
          link.farmerId.address.toLowerCase().includes(q)
      );
    }

    const sorted = [...result].sort((a, b) => {
      if (sortBy === 'Name')
        return a.farmerId.name.localeCompare(b.farmerId.name);
      return a.accountNumber - b.accountNumber;
    });

    return sorted;
  }, [links, searchQuery, sortBy]);

  if (isLoading) {
    return (
      <main className="mx-auto max-w-7xl p-2 sm:p-4 lg:p-6">
        <div className="space-y-6">
          <Skeleton className="h-12 w-48 rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
                      <div className="min-w-0 space-y-2">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                    </div>
                    <Skeleton className="h-6 w-14 rounded-full" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="mx-auto max-w-300 px-4 pt-6 pb-16 sm:px-8 sm:py-24">
        <Card>
          <CardContent className="pt-6">
            <p className="font-custom text-destructive">
              Error loading farmers. Please try again.
            </p>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl p-2 sm:p-4 lg:p-6">
      <div className="space-y-6">
        {/* Header: count + refresh */}
        <Item variant="outline" size="sm" className="rounded-xl shadow-sm">
          <ItemHeader className="h-full">
            <div className="flex items-center gap-3">
              <ItemMedia variant="icon" className="rounded-lg">
                <User className="text-primary h-5 w-5" />
              </ItemMedia>
              <ItemTitle className="font-custom text-sm font-semibold sm:text-base">
                {links.length} farmers
              </ItemTitle>
            </div>
            <ItemActions>
              <Button
                variant="outline"
                size="sm"
                disabled={isFetching}
                onClick={() => refetch()}
                className="font-custom h-8 gap-2 rounded-lg px-3"
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

        {/* Search + sort + add */}
        <Item
          variant="outline"
          size="sm"
          className="flex-col items-stretch gap-4 rounded-xl"
        >
          <div className="relative w-full">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              placeholder="Search by name, mobile, account number, or address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="font-custom focus-visible:ring-primary w-full pl-10 focus-visible:ring-2 focus-visible:ring-offset-2"
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
                  Sort by: {sortBy}
                  <ChevronDown className="h-4 w-4 shrink-0" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setSortBy('Name')}>
                  Name
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('Account Number')}>
                  Account Number
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <AddFarmerModal links={links} />
          </ItemFooter>
        </Item>

        {/* List */}
        {filteredLinks.length === 0 ? (
          <Card>
            <CardContent className="py-8 pt-6 text-center">
              <p className="font-custom text-muted-foreground">
                {searchQuery
                  ? 'No farmers match your search.'
                  : 'No farmers registered yet.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredLinks.map((link) => (
              <FarmerCard key={link._id} link={link} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
});

interface FarmerCardProps {
  link: FarmerStorageLink;
}

const FarmerCard = memo(function FarmerCard({ link }: FarmerCardProps) {
  const navigate = useNavigate();
  const { farmerId, accountNumber, isActive, costPerBag } = link;

  const handleClick = () => {
    navigate({
      to: '/store-admin/people/$farmerStorageLinkId',
      params: { farmerStorageLinkId: link._id },
      state: { link } as Record<string, unknown>,
    });
  };

  return (
    <div onClick={handleClick} className="block cursor-pointer">
      <Card className="focus-within:ring-primary rounded-xl transition-all duration-200 ease-in-out focus-within:ring-2 focus-within:ring-offset-2 hover:-translate-y-1 hover:shadow-xl">
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
                <User className="text-primary h-5 w-5" />
              </div>
              <div className="min-w-0">
                <CardTitle className="font-custom text-lg font-semibold">
                  {farmerId.name}
                </CardTitle>
                <CardDescription className="font-custom mt-1">
                  Account #{accountNumber}
                </CardDescription>
              </div>
            </div>
            <div
              className={`font-custom flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {isActive ? (
                <CheckCircle2 className="h-3 w-3 shrink-0" />
              ) : (
                <XCircle className="h-3 w-3 shrink-0" />
              )}
              {isActive ? 'Active' : 'Inactive'}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="font-custom text-muted-foreground space-y-3 text-sm">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 shrink-0" />
              <span>{farmerId.mobileNumber}</span>
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{farmerId.address}</span>
            </div>
            {costPerBag != null && (
              <div className="font-custom text-foreground pt-1 font-medium">
                ₹{costPerBag}/bag
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

export default PeoplePage;
