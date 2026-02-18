import {
  Item,
  ItemHeader,
  ItemMedia,
  ItemTitle,
  ItemActions,
} from '@/components/ui/item';
import { Button } from '@/components/ui/button';
import { BarChart3, RefreshCw } from 'lucide-react';
import { useGetAllIncomingGatePasses } from '@/services/analytics/useGetAllIncomingGatePasses';

const AdvancedAnalyticsPage = () => {
  const { data, isLoading, error, refetch, isFetching } =
    useGetAllIncomingGatePasses();

  return (
    <main className="mx-auto max-w-7xl p-2 sm:p-4 lg:p-6">
      <div className="space-y-6">
        {/* Header: title + refresh */}
        <Item variant="outline" size="sm" className="rounded-xl shadow-sm">
          <ItemHeader className="h-full">
            <div className="flex items-center gap-3">
              <ItemMedia variant="icon" className="rounded-lg">
                <BarChart3 className="text-primary h-5 w-5" />
              </ItemMedia>
              <ItemTitle className="font-custom text-sm font-semibold sm:text-base">
                Advanced Analytics
              </ItemTitle>
            </div>
            <ItemActions>
              <Button
                variant="outline"
                size="sm"
                className="font-custom focus-visible:ring-primary h-8 gap-2 rounded-lg px-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                aria-label="Refresh analytics"
                onClick={() => refetch()}
                disabled={isFetching}
              >
                <RefreshCw
                  className={`h-4 w-4 shrink-0 ${isFetching ? 'animate-spin' : ''}`}
                />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
            </ItemActions>
          </ItemHeader>
        </Item>

        {/* Content */}
        <div className="min-h-[200px] w-full">
          <h2 className="font-custom text-lg font-semibold text-foreground sm:text-xl">
            Incoming gate passes (orders)
          </h2>
          {isLoading ? (
            <p className="font-custom text-muted-foreground mt-2 text-sm">
              Loading…
            </p>
          ) : error ? (
            <p className="font-custom text-destructive mt-2 text-sm">
              {error instanceof Error ? error.message : 'Failed to load orders'}
            </p>
          ) : data != null ? (
            <pre className="font-mono mt-3 max-h-[60vh] overflow-auto rounded-lg border bg-muted/30 p-4 text-xs sm:text-sm">
              {JSON.stringify(data, null, 2)}
            </pre>
          ) : null}
        </div>
      </div>
    </main>
  );
};

export default AdvancedAnalyticsPage;
