import { useMemo, useState } from 'react';
import { Loader2, RefreshCw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { Separator } from '@/components/ui/separator';
import { usePreferencesStore } from '@/features/auth/store/use-preferences-store';
import type {
  DaybookEntry,
  IncomingDaybookEntry,
  OutgoingDaybookEntry,
} from '@/features/daybook/types';
import { shouldShowStockFilter } from '@/features/incoming/utils/incoming-preferences';
import { FarmerStockSummaryTable } from '@/features/people/components/farmer-stock-summary-table';
import {
  QuantityModeTabLabel,
  StockSummaryTabBar,
} from '@/features/people/components/farmer-stock-summary-tabs';
import { getStockSummaryAccent } from '@/features/people/components/farmer-stock-summary-table-styles';
import {
  buildFarmerStockSummary,
  type StockFilterTab,
  type StockQuantityMode,
} from '@/features/people/utils/build-farmer-stock-summary';

const QUANTITY_MODE_LABELS: Record<StockQuantityMode, string> = {
  current: 'Current',
  initial: 'Initial',
  outgoing: 'Outgoing',
};

const QUANTITY_MODES = Object.keys(QUANTITY_MODE_LABELS) as StockQuantityMode[];

type FarmerStockSummarySectionProps = {
  passes: IncomingDaybookEntry[];
  outgoingPasses?: OutgoingDaybookEntry[];
  allEntries?: DaybookEntry[];
  isError?: boolean;
  error?: Error | null;
  isFetching?: boolean;
  onRefresh?: () => void;
  embedded?: boolean;
};

export function FarmerStockSummarySection({
  passes,
  outgoingPasses,
  allEntries,
  isError = false,
  error = null,
  isFetching = false,
  onRefresh,
  embedded = false,
}: FarmerStockSummarySectionProps) {
  const preferences = usePreferencesStore((state) => state.preferences);
  const commodities = preferences?.commodities ?? [];
  const stockFilterOptions = preferences?.stockFilter?.options ?? [];
  const showStockFilterTabs = shouldShowStockFilter(preferences?.stockFilter);

  const [stockFilterTab, setStockFilterTab] = useState<StockFilterTab>('all');
  const [quantityMode, setQuantityMode] = useState<StockQuantityMode>('current');

  const summary = useMemo(
    () =>
      buildFarmerStockSummary({
        passes,
        commodities,
        stockFilterTab,
        quantityMode,
      }),
    [passes, commodities, stockFilterTab, quantityMode],
  );

  const stockFilterTabs = useMemo<StockFilterTab[]>(() => {
    if (!showStockFilterTabs) return [];
    return ['all', ...stockFilterOptions];
  }, [showStockFilterTabs, stockFilterOptions]);

  const stockFilterTabItems = useMemo(
    () =>
      stockFilterTabs.map((tab) => ({
        value: tab,
        label: tab === 'all' ? 'All' : tab,
      })),
    [stockFilterTabs],
  );

  const quantityModeTabItems = useMemo(
    () =>
      QUANTITY_MODES.map((mode) => ({
        value: mode,
        label: (
          <QuantityModeTabLabel
            label={QUANTITY_MODE_LABELS[mode]}
            count={summary.modeTotals[mode]}
          />
        ),
      })),
    [summary.modeTotals],
  );

  return (
    <section
      className={
        embedded ? 'flex w-full min-w-0 flex-col gap-3' : 'flex w-full min-w-0 flex-col gap-4'
      }
    >
      <div>
        <h2 className="font-heading text-foreground text-base font-semibold">Stock Summary</h2>
        <p className="text-muted-foreground mt-0.5 text-sm">
          View stock quantities by current inventory, initial quantities, or outgoing quantities.
        </p>
      </div>

      <div className="border-border bg-card text-card-foreground overflow-hidden rounded-xl border shadow-sm">
        <div className="bg-muted/20 space-y-0">
          {showStockFilterTabs ? (
            <>
              <div className="px-3 pt-3 sm:px-4 sm:pt-4">
                <StockSummaryTabBar
                  value={stockFilterTab}
                  onValueChange={(value) => setStockFilterTab(value as StockFilterTab)}
                  items={stockFilterTabItems}
                  ariaLabel="Stock ownership filter"
                />
              </div>
              <Separator />
            </>
          ) : null}

          <div className="px-3 py-2 sm:px-4 sm:py-3">
            <StockSummaryTabBar
              value={quantityMode}
              onValueChange={(value) => setQuantityMode(value as StockQuantityMode)}
              items={quantityModeTabItems}
              ariaLabel="Stock quantity view"
              accent={getStockSummaryAccent(quantityMode)}
            />
          </div>
        </div>

        <div className="border-border border-t p-3 sm:p-4">
          {isError ? (
            <Empty className="bg-muted/10 rounded-lg border">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <RefreshCw />
                </EmptyMedia>

                <EmptyTitle>Could not load stock summary</EmptyTitle>

                <EmptyDescription>
                  {error instanceof Error
                    ? error.message
                    : 'Something went wrong while fetching stock data.'}
                </EmptyDescription>
              </EmptyHeader>

              <Button variant="outline" onClick={() => onRefresh?.()} disabled={isFetching}>
                {isFetching ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="mr-2 h-4 w-4" />
                )}
                Try again
              </Button>
            </Empty>
          ) : (
            <FarmerStockSummaryTable
              matrix={summary}
              passes={passes}
              outgoingPasses={outgoingPasses}
              allEntries={allEntries}
              stockFilterTab={stockFilterTab}
              quantityMode={quantityMode}
            />
          )}
        </div>
      </div>
    </section>
  );
}
