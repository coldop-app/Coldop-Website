import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useRouterState } from '@tanstack/react-router';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
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
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Search,
  ChevronDown,
  RefreshCw,
  Receipt,
  ArrowUpFromLine,
  ArrowDownToLine,
  Hash,
  Edit,
  Calendar,
  X,
  Wallet,
  BookOpen,
  FileText,
} from 'lucide-react';
import type { FarmerStorageLink } from '@/types/farmer';
import type {
  DaybookEntry,
  IncomingGatePassEntry,
  OutgoingGatePassEntry,
} from '@/services/store-admin/functions/useGetDaybook';
import { useGetFarmerGatePasses } from '@/services/store-admin/functions/useGetFarmerGatePasses';
import { formatDateToISO } from '@/lib/helpers';
import { DatePicker } from '@/components/forms/date-picker';
import IncomingGatePassCard from '@/components/daybook/incoming-gate-pass-card';
import OutgoingGatePassCard from '@/components/daybook/outgoing-gate-pass-card';
import { useStore } from '@/stores/store';
import { FarmerStockSummaryTable } from '@/components/people/farmer-profile/farmer-stock-summary-table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import EditFarmerDialog from '@/components/people/farmer-profile/edit-farmer-dialog';
import FinancesActionsDialog from '@/components/people/farmer-profile/finances-actions-dialog';
import BuyPotatoForm from '@/components/forms/people/buy-potato';
import SellPotatoForm from '@/components/forms/people/sell-potato';
import ReceivePaymentForm from '@/components/forms/people/receive-payment';
import AddPaymentForm from '@/components/forms/people/add-payment';
import AddDiscountForm from '@/components/forms/people/add-discount';
import AddChargeForm from '@/components/forms/people/add-charge';

/* ------------------------------------------------------------------ */
/* Types – same as daybook screen */
/* ------------------------------------------------------------------ */

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

export interface FarmerProfilePageProps {
  farmerStorageLinkId: string;
}

/* ------------------------------------------------------------------ */
/* Helpers */
/* ------------------------------------------------------------------ */

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function totalBagsIncoming(entry: DaybookEntry): number {
  const bagSizes = entry.bagSizes ?? [];
  return bagSizes.reduce((s, b) => s + (b.initialQuantity ?? 0), 0);
}

function totalBagsOutgoing(entry: DaybookEntry): number {
  const orderDetails = entry.orderDetails ?? [];
  return orderDetails.reduce((s, d) => s + (d.quantityIssued ?? 0), 0);
}

/* ------------------------------------------------------------------ */
/* Component */
/* ------------------------------------------------------------------ */

const FarmerProfilePage = ({ farmerStorageLinkId }: FarmerProfilePageProps) => {
  const navigate = useNavigate();
  const link = useRouterState({
    select: (state) =>
      (state.location.state as { link?: FarmerStorageLink } | undefined)?.link,
  });

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [financesDialogOpen, setFinancesDialogOpen] = useState(false);
  const [buyPotatoDialogOpen, setBuyPotatoDialogOpen] = useState(false);
  const [sellPotatoDialogOpen, setSellPotatoDialogOpen] = useState(false);
  const [receivePaymentDialogOpen, setReceivePaymentDialogOpen] =
    useState(false);
  const [addPaymentDialogOpen, setAddPaymentDialogOpen] = useState(false);
  const [addDiscountDialogOpen, setAddDiscountDialogOpen] = useState(false);
  const [addChargeDialogOpen, setAddChargeDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [orderFilter, setOrderFilter] = useState<OrderFilter>('all');
  const [sortOrder, setSortOrder] = useState<SortOrder>('latest');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const gatePassesParams = useMemo(() => {
    const dateRange =
      dateFrom || dateTo
        ? {
            from: dateFrom ? formatDateToISO(dateFrom).slice(0, 10) : undefined,
            to: dateTo ? formatDateToISO(dateTo).slice(0, 10) : undefined,
          }
        : undefined;
    return {
      dateRange,
      type: orderFilter,
      sortBy: sortOrder,
    };
  }, [dateFrom, dateTo, orderFilter, sortOrder]);

  const {
    data: gatePassesData,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetFarmerGatePasses(farmerStorageLinkId, gatePassesParams);

  useEffect(() => {
    if (!isError || !error) return;
    const err = error as Error & {
      response?: { data?: { message?: string; error?: { message?: string } } };
    };
    const apiMessage =
      err.response?.data?.message ?? err.response?.data?.error?.message;
    const message =
      apiMessage ||
      (err instanceof Error ? err.message : 'Failed to load gate passes.');
    toast.error(message);
  }, [isError, error]);

  const incoming = useMemo(
    () => gatePassesData?.incoming ?? [],
    [gatePassesData?.incoming]
  );
  const outgoing = useMemo(
    () => gatePassesData?.outgoing ?? [],
    [gatePassesData?.outgoing]
  );
  const pagination = gatePassesData?.pagination;

  const preferences = useStore((s) => s.preferences);
  const sizes = useMemo(
    () => preferences?.commodities?.[0]?.sizes ?? [],
    [preferences?.commodities]
  );

  const combinedEntries: DaybookEntry[] = useMemo(() => {
    const inc: DaybookEntry[] = incoming.map((e) => ({
      ...e,
      type: 'RECEIPT' as const,
    }));
    const out: DaybookEntry[] = outgoing.map((e) => ({
      ...e,
      type: 'DELIVERY' as const,
    }));
    return [...inc, ...out];
  }, [incoming, outgoing]);

  const filteredAndSortedEntries = useMemo(() => {
    let list = combinedEntries;

    const normalizedQuery = searchQuery.trim();
    if (normalizedQuery) {
      list = list.filter((entry) => {
        const gatePassNoStr = String(entry.gatePassNo ?? '');
        return (
          gatePassNoStr === normalizedQuery ||
          gatePassNoStr.includes(normalizedQuery)
        );
      });
    }

    list = [...list].sort((a, b) => {
      const dateA = a.date ? new Date(a.date).getTime() : 0;
      const dateB = b.date ? new Date(b.date).getTime() : 0;
      return sortOrder === 'latest' ? dateB - dateA : dateA - dateB;
    });

    return list;
  }, [combinedEntries, searchQuery, sortOrder]);

  const totalCount = filteredAndSortedEntries.length;
  const totalFromApi = pagination?.totalItems ?? totalCount;

  const aggregateStats = useMemo(() => {
    const totalIncomingBags = incoming.reduce(
      (sum, entry) => sum + totalBagsIncoming(entry),
      0
    );
    const totalOutgoingBags = outgoing.reduce(
      (sum, entry) => sum + totalBagsOutgoing(entry),
      0
    );
    return {
      incomingCount: incoming.length,
      outgoingCount: outgoing.length,
      totalIncomingBags,
      totalOutgoingBags,
    };
  }, [incoming, outgoing]);

  if (!link) {
    return (
      <main className="mx-auto max-w-7xl p-2 sm:p-4 lg:p-6">
        <p className="font-custom text-muted-foreground">Farmer not found.</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl p-2 sm:p-4 lg:p-6">
      <div className="space-y-6">
        {/* Farmer info card */}
        <Card className="overflow-hidden rounded-xl shadow-sm">
          <CardContent className="p-4 sm:p-5">
            <div className="space-y-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16 shadow-md sm:h-20 sm:w-20">
                    <AvatarFallback className="bg-primary text-primary-foreground font-custom text-xl font-bold sm:text-2xl">
                      {getInitials(link.farmerId.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <h1 className="font-custom text-xl font-bold tracking-tight sm:text-2xl">
                      {link.farmerId.name}
                    </h1>
                    <Badge variant="secondary" className="font-custom w-fit">
                      <Hash className="mr-1 h-3 w-3" />
                      {link.accountNumber}
                    </Badge>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="focus-visible:ring-primary h-10 w-10 rounded-full focus-visible:ring-2 focus-visible:ring-offset-2"
                  aria-label="Edit farmer"
                  onClick={() => setEditDialogOpen(true)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </div>

              <EditFarmerDialog
                open={editDialogOpen}
                onOpenChange={setEditDialogOpen}
                link={link}
                onUpdated={(updatedLink) => {
                  navigate({
                    to: '/store-admin/people/$farmerStorageLinkId',
                    params: { farmerStorageLinkId: link._id },
                    state: { link: updatedLink } as Record<string, unknown>,
                    replace: true,
                  });
                }}
              />

              <div className="flex flex-wrap gap-3">
                <Button
                  variant="outline"
                  className="font-custom focus-visible:ring-primary dark:border-border dark:bg-background dark:text-foreground dark:hover:bg-accent dark:hover:text-foreground gap-2 rounded-lg border-gray-200 bg-white text-[#333] shadow-sm transition-colors duration-200 hover:bg-gray-50 hover:text-[#333] focus-visible:ring-2 focus-visible:ring-offset-2"
                  onClick={() => setFinancesDialogOpen(true)}
                >
                  <Wallet className="text-primary h-4 w-4" />
                  Finances
                </Button>
                <FinancesActionsDialog
                  open={financesDialogOpen}
                  onOpenChange={setFinancesDialogOpen}
                  onAction={(action) => {
                    if (action === 'buy-potato') setBuyPotatoDialogOpen(true);
                    if (action === 'sell-potato') setSellPotatoDialogOpen(true);
                    if (action === 'receive-payment')
                      setReceivePaymentDialogOpen(true);
                    if (action === 'add-payment') setAddPaymentDialogOpen(true);
                    if (action === 'add-discount')
                      setAddDiscountDialogOpen(true);
                    if (action === 'add-charge') setAddChargeDialogOpen(true);
                  }}
                />
                <Dialog
                  open={buyPotatoDialogOpen}
                  onOpenChange={setBuyPotatoDialogOpen}
                >
                  <DialogContent className="font-custom border-border bg-card text-card-foreground w-[calc(100%-2rem)] max-w-md gap-0 overflow-hidden rounded-xl p-0 shadow-sm sm:max-w-lg">
                    <DialogHeader className="shrink-0 space-y-0.5 p-3 pr-11 sm:space-y-1 sm:p-5 sm:pr-12">
                      <DialogTitle className="font-custom text-card-foreground text-base leading-tight font-bold tracking-tight sm:text-2xl">
                        Buy Potato
                      </DialogTitle>
                      <DialogDescription className="font-custom text-muted-foreground line-clamp-1 text-xs sm:text-sm">
                        Create a voucher for potato purchase from{' '}
                        {link.farmerId.name}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="min-h-0 shrink-0 px-3 pt-0.5 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-5 sm:pt-1 sm:pb-5">
                      <BuyPotatoForm
                        defaultFarmerStorageLinkId={link._id}
                        farmerName={link.farmerId.name}
                        onSuccess={() => setBuyPotatoDialogOpen(false)}
                        onCancel={() => setBuyPotatoDialogOpen(false)}
                      />
                    </div>
                  </DialogContent>
                </Dialog>
                <Dialog
                  open={sellPotatoDialogOpen}
                  onOpenChange={setSellPotatoDialogOpen}
                >
                  <DialogContent className="font-custom border-border bg-card text-card-foreground w-[calc(100%-2rem)] max-w-md gap-0 overflow-hidden rounded-xl p-0 shadow-sm sm:max-w-lg">
                    <DialogHeader className="shrink-0 space-y-0.5 p-3 pr-11 sm:space-y-1 sm:p-5 sm:pr-12">
                      <DialogTitle className="font-custom text-card-foreground text-base leading-tight font-bold tracking-tight sm:text-2xl">
                        Sell Potato
                      </DialogTitle>
                      <DialogDescription className="font-custom text-muted-foreground line-clamp-1 text-xs sm:text-sm">
                        Create a voucher for potato sale to {link.farmerId.name}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="min-h-0 shrink-0 px-3 pt-0.5 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-5 sm:pt-1 sm:pb-5">
                      <SellPotatoForm
                        defaultFarmerStorageLinkId={link._id}
                        farmerName={link.farmerId.name}
                        onSuccess={() => setSellPotatoDialogOpen(false)}
                        onCancel={() => setSellPotatoDialogOpen(false)}
                      />
                    </div>
                  </DialogContent>
                </Dialog>
                <Dialog
                  open={receivePaymentDialogOpen}
                  onOpenChange={setReceivePaymentDialogOpen}
                >
                  <DialogContent className="font-custom border-border bg-card text-card-foreground w-[calc(100%-2rem)] max-w-md gap-0 overflow-hidden rounded-xl p-0 shadow-sm sm:max-w-lg">
                    <DialogHeader className="shrink-0 space-y-0.5 p-3 pr-11 sm:space-y-1 sm:p-5 sm:pr-12">
                      <DialogTitle className="font-custom text-card-foreground text-base leading-tight font-bold tracking-tight sm:text-2xl">
                        Receive Payment
                      </DialogTitle>
                      <DialogDescription className="font-custom text-muted-foreground line-clamp-1 text-xs sm:text-sm">
                        Record payment received from {link.farmerId.name}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="min-h-0 shrink-0 px-3 pt-0.5 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-5 sm:pt-1 sm:pb-5">
                      <ReceivePaymentForm
                        defaultFarmerStorageLinkId={link._id}
                        farmerName={link.farmerId.name}
                        onSuccess={() => setReceivePaymentDialogOpen(false)}
                        onCancel={() => setReceivePaymentDialogOpen(false)}
                      />
                    </div>
                  </DialogContent>
                </Dialog>
                <Dialog
                  open={addPaymentDialogOpen}
                  onOpenChange={setAddPaymentDialogOpen}
                >
                  <DialogContent className="font-custom border-border bg-card text-card-foreground w-[calc(100%-2rem)] max-w-md gap-0 overflow-hidden rounded-xl p-0 shadow-sm sm:max-w-lg">
                    <DialogHeader className="shrink-0 space-y-0.5 p-3 pr-11 sm:space-y-1 sm:p-5 sm:pr-12">
                      <DialogTitle className="font-custom text-card-foreground text-base leading-tight font-bold tracking-tight sm:text-2xl">
                        Add Payment
                      </DialogTitle>
                      <DialogDescription className="font-custom text-muted-foreground line-clamp-1 text-xs sm:text-sm">
                        Record payment made to {link.farmerId.name}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="min-h-0 shrink-0 px-3 pt-0.5 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-5 sm:pt-1 sm:pb-5">
                      <AddPaymentForm
                        defaultFarmerStorageLinkId={link._id}
                        farmerName={link.farmerId.name}
                        onSuccess={() => setAddPaymentDialogOpen(false)}
                        onCancel={() => setAddPaymentDialogOpen(false)}
                      />
                    </div>
                  </DialogContent>
                </Dialog>
                <Dialog
                  open={addDiscountDialogOpen}
                  onOpenChange={setAddDiscountDialogOpen}
                >
                  <DialogContent className="font-custom border-border bg-card text-card-foreground w-[calc(100%-2rem)] max-w-md gap-0 overflow-hidden rounded-xl p-0 shadow-sm sm:max-w-lg">
                    <DialogHeader className="shrink-0 space-y-0.5 p-3 pr-11 sm:space-y-1 sm:p-5 sm:pr-12">
                      <DialogTitle className="font-custom text-card-foreground text-base leading-tight font-bold tracking-tight sm:text-2xl">
                        Add Discount
                      </DialogTitle>
                      <DialogDescription className="font-custom text-muted-foreground line-clamp-1 text-xs sm:text-sm">
                        Create a discount voucher for {link.farmerId.name}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="min-h-0 shrink-0 px-3 pt-0.5 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-5 sm:pt-1 sm:pb-5">
                      <AddDiscountForm
                        defaultFarmerStorageLinkId={link._id}
                        farmerName={link.farmerId.name}
                        onSuccess={() => setAddDiscountDialogOpen(false)}
                        onCancel={() => setAddDiscountDialogOpen(false)}
                      />
                    </div>
                  </DialogContent>
                </Dialog>
                <Dialog
                  open={addChargeDialogOpen}
                  onOpenChange={setAddChargeDialogOpen}
                >
                  <DialogContent className="font-custom border-border bg-card text-card-foreground w-[calc(100%-2rem)] max-w-md gap-0 overflow-hidden rounded-xl p-0 shadow-sm sm:max-w-lg">
                    <DialogHeader className="shrink-0 space-y-0.5 p-3 pr-11 sm:space-y-1 sm:p-5 sm:pr-12">
                      <DialogTitle className="font-custom text-card-foreground text-base leading-tight font-bold tracking-tight sm:text-2xl">
                        Add Charge
                      </DialogTitle>
                      <DialogDescription className="font-custom text-muted-foreground line-clamp-1 text-xs sm:text-sm">
                        Create a charge (other income) voucher for{' '}
                        {link.farmerId.name}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="min-h-0 shrink-0 px-3 pt-0.5 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-5 sm:pt-1 sm:pb-5">
                      <AddChargeForm
                        defaultFarmerStorageLinkId={link._id}
                        farmerName={link.farmerId.name}
                        onSuccess={() => setAddChargeDialogOpen(false)}
                        onCancel={() => setAddChargeDialogOpen(false)}
                      />
                    </div>
                  </DialogContent>
                </Dialog>
                <Button
                  variant="outline"
                  className="font-custom focus-visible:ring-primary dark:border-border dark:bg-background dark:text-foreground dark:hover:bg-accent dark:hover:text-foreground gap-2 rounded-lg border-gray-200 bg-white text-[#333] shadow-sm transition-colors duration-200 hover:bg-gray-50 hover:text-[#333] focus-visible:ring-2 focus-visible:ring-offset-2"
                  asChild
                >
                  <Link
                    to="/store-admin/my-finances"
                    search={{
                      tab: 'Ledger View',
                      farmerStorageLinkId: link._id,
                      farmerName: link.farmerId.name,
                    }}
                    className="gap-2"
                  >
                    <BookOpen className="text-primary h-4 w-4" />
                    View Financial Ledger
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="font-custom focus-visible:ring-primary dark:border-border dark:bg-background dark:text-foreground dark:hover:bg-accent dark:hover:text-foreground gap-2 rounded-lg border-gray-200 bg-white text-[#333] shadow-sm transition-colors duration-200 hover:bg-gray-50 hover:text-[#333] focus-visible:ring-2 focus-visible:ring-offset-2"
                >
                  <FileText className="text-primary h-4 w-4" />
                  View Stock Ledger
                </Button>
              </div>

              <Separator />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl">
                    <ArrowUpFromLine className="text-primary h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-custom text-muted-foreground text-xs font-medium tracking-wide uppercase">
                      Incoming
                    </p>
                    <p className="font-custom text-lg font-bold">
                      {aggregateStats.incomingCount} gate passes
                    </p>
                    <p className="font-custom text-muted-foreground text-sm">
                      {aggregateStats.totalIncomingBags.toLocaleString('en-IN')}{' '}
                      bags
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl">
                    <ArrowDownToLine className="text-primary h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-custom text-muted-foreground text-xs font-medium tracking-wide uppercase">
                      Outgoing
                    </p>
                    <p className="font-custom text-lg font-bold">
                      {aggregateStats.outgoingCount} gate passes
                    </p>
                    <p className="font-custom text-muted-foreground text-sm">
                      {aggregateStats.totalOutgoingBags.toLocaleString('en-IN')}{' '}
                      bags
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Header: order count + refresh */}
        <Item variant="outline" size="sm" className="rounded-xl shadow-sm">
          <ItemHeader className="h-full">
            <div className="flex items-center gap-3">
              <ItemMedia variant="icon" className="rounded-lg">
                <Receipt className="text-primary h-5 w-5" />
              </ItemMedia>
              <ItemTitle className="font-custom text-sm font-semibold sm:text-base">
                {totalCount === totalFromApi
                  ? `${totalCount} ${totalCount === 1 ? 'gate pass' : 'gate passes'}`
                  : `${totalCount} of ${totalFromApi} gate passes`}
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

        {/* Search + sort + filter */}
        <Item
          variant="outline"
          size="sm"
          className="flex-col items-stretch gap-4 rounded-xl"
        >
          <div className="relative w-full">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              placeholder="Search by gate pass number"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="font-custom focus-visible:ring-primary w-full pl-10 focus-visible:ring-2 focus-visible:ring-offset-2"
            />
          </div>

          <ItemFooter className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {/* Left: sorting filters */}
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-nowrap sm:items-center sm:gap-4">
              {/* Orders filter – same as daybook */}
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
                    onCheckedChange={() => setOrderFilter('all')}
                  >
                    All Orders
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={orderFilter === 'incoming'}
                    onCheckedChange={() => setOrderFilter('incoming')}
                  >
                    Incoming
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={orderFilter === 'outgoing'}
                    onCheckedChange={() => setOrderFilter('outgoing')}
                  >
                    Outgoing
                  </DropdownMenuCheckboxItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Sort – same as daybook */}
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
            </div>

            {/* Right: date range filter */}
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center sm:gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="text-muted-foreground h-4 w-4 shrink-0" />
                <span className="font-custom text-muted-foreground shrink-0 text-sm font-medium">
                  Period
                </span>
              </div>
              <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:gap-2">
                <div className="w-full min-w-0 sm:w-auto sm:min-w-32">
                  <DatePicker
                    id="voucher-date-from"
                    label="From"
                    value={dateFrom}
                    onChange={setDateFrom}
                    fullWidth
                  />
                </div>
                <span className="font-custom text-muted-foreground hidden text-sm sm:inline">
                  to
                </span>
                <div className="w-full min-w-0 sm:w-auto sm:min-w-32">
                  <DatePicker
                    id="voucher-date-to"
                    label="To"
                    value={dateTo}
                    onChange={setDateTo}
                    fullWidth
                  />
                </div>
                {(dateFrom || dateTo) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="font-custom text-muted-foreground hover:text-foreground h-8 gap-1.5 rounded-lg px-2 sm:shrink-0"
                    onClick={() => {
                      setDateFrom('');
                      setDateTo('');
                    }}
                    aria-label="Clear date range"
                  >
                    <X className="h-4 w-4" />
                    <span className="hidden sm:inline">Clear</span>
                  </Button>
                )}
              </div>
            </div>
          </ItemFooter>
        </Item>

        <FarmerStockSummaryTable sizes={sizes} incomingEntries={incoming} />

        {/* Error state */}
        {isError && (
          <Card className="border-destructive/50">
            <CardContent className="py-6 text-center">
              <p className="font-custom text-destructive font-medium">
                Failed to load gate passes.
              </p>
              <p className="font-custom text-muted-foreground mt-1 text-sm">
                {error instanceof Error
                  ? error.message
                  : 'Something went wrong.'}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                className="font-custom mt-4"
              >
                Try again
              </Button>
            </CardContent>
          </Card>
        )}

        {/* List: gate passes */}
        {!isError && isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card
                key={i}
                className="border-border/40 overflow-hidden pt-0 shadow-sm"
              >
                <div className="w-full px-4 py-4 sm:px-5 sm:py-5">
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
                  <div className="mt-4 grid w-full grid-cols-2 gap-4 lg:grid-cols-4">
                    {[...Array(4)].map((_, j) => (
                      <div key={j} className="min-w-0 space-y-1">
                        <Skeleton className="h-3.5 w-14" />
                        <Skeleton className="h-4 w-full max-w-28" />
                      </div>
                    ))}
                  </div>
                  <div className="border-border/50 mt-4 flex w-full items-center justify-between border-t pt-4">
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
        ) : !isError && filteredAndSortedEntries.length === 0 ? (
          <Card>
            <CardContent className="py-8 pt-6 text-center">
              <p className="font-custom text-muted-foreground">
                No gate passes yet.
              </p>
            </CardContent>
          </Card>
        ) : !isError ? (
          <div className="w-full space-y-4">
            {filteredAndSortedEntries.map((entry, idx) =>
              entry.type === 'RECEIPT' ? (
                <IncomingGatePassCard
                  key={entry._id ?? `inc-${idx}`}
                  entry={entry as IncomingGatePassEntry}
                />
              ) : (
                <OutgoingGatePassCard
                  key={entry._id ?? `out-${idx}`}
                  entry={entry as OutgoingGatePassEntry}
                />
              )
            )}
          </div>
        ) : null}
      </div>
    </main>
  );
};

export default FarmerProfilePage;
