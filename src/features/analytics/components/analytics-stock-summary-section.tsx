import { Separator } from '@/components/ui/separator';
import { usePreferencesStore } from '@/features/auth/store/use-preferences-store';
import { shouldShowStockFilter } from '@/features/incoming/utils/incoming-preferences';
import { AnalyticsStockSummaryTable } from '@/features/analytics/components/analytics-stock-summary-table';
import { StockSummaryTabBar } from '@/features/people/components/farmer-stock-summary-tabs';
import type {
  StockFilterTab,
  StockQuantityMode,
  StockSummaryMatrix,
} from '@/features/people/utils/build-farmer-stock-summary';

type AnalyticsStockSummarySectionProps = {
  matrix: StockSummaryMatrix;
  quantityMode: StockQuantityMode;
  stockFilterTab: StockFilterTab;
  onStockFilterTabChange: (tab: StockFilterTab) => void;
};

export function AnalyticsStockSummarySection({
  matrix,
  quantityMode,
  stockFilterTab,
  onStockFilterTabChange,
}: AnalyticsStockSummarySectionProps) {
  const preferences = usePreferencesStore((state) => state.preferences);
  const stockFilterOptions = preferences?.stockFilter?.options ?? [];
  const showStockFilterTabs = shouldShowStockFilter(preferences?.stockFilter);

  const stockFilterTabs: StockFilterTab[] = showStockFilterTabs
    ? ['all', ...stockFilterOptions]
    : [];

  const stockFilterTabItems = stockFilterTabs.map((tab) => ({
    value: tab,
    label: tab === 'all' ? 'All' : tab,
  }));

  return (
    <section className="flex w-full min-w-0 flex-col gap-4">
      <div>
        <h2 className="font-heading text-foreground text-base font-semibold">Stock Summary</h2>
        <p className="text-muted-foreground mt-0.5 text-sm">
          Variety and bag-size breakdown for the selected view.
        </p>
      </div>

      <div className="border-border bg-card text-card-foreground overflow-hidden rounded-xl border shadow-sm">
        {showStockFilterTabs ? (
          <div className="bg-muted/20 space-y-0">
            <div className="px-3 pt-3 sm:px-4 sm:pt-4">
              <StockSummaryTabBar
                value={stockFilterTab}
                onValueChange={(value) => onStockFilterTabChange(value as StockFilterTab)}
                items={stockFilterTabItems}
                ariaLabel="Stock ownership filter"
              />
            </div>
            <Separator />
          </div>
        ) : null}

        <div className="p-3 sm:p-4">
          <AnalyticsStockSummaryTable
            matrix={matrix}
            quantityMode={quantityMode}
            stockFilterTab={stockFilterTab}
          />
        </div>
      </div>
    </section>
  );
}
