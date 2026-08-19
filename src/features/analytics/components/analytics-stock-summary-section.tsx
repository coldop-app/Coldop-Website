import { Separator } from '@/components/ui/separator';
import { usePreferencesStore } from '@/features/auth/store/use-preferences-store';
import {
  shouldShowGeneration,
  shouldShowStockFilter,
} from '@/features/incoming/utils/incoming-preferences';
import { AnalyticsStockSummaryTable } from '@/features/analytics/components/analytics-stock-summary-table';
import { StockSummaryTabBar } from '@/features/people/components/farmer-stock-summary-tabs';
import type {
  GenerationTab,
  StockFilterTab,
  StockQuantityMode,
  StockSummaryMatrix,
} from '@/features/people/utils/build-farmer-stock-summary';

type AnalyticsStockSummarySectionProps = {
  matrix: StockSummaryMatrix;
  quantityMode: StockQuantityMode;
  stockFilterTab: StockFilterTab;
  onStockFilterTabChange: (tab: StockFilterTab) => void;
  generationTab: GenerationTab;
  onGenerationTabChange: (tab: GenerationTab) => void;
};

export function AnalyticsStockSummarySection({
  matrix,
  quantityMode,
  stockFilterTab,
  onStockFilterTabChange,
  generationTab,
  onGenerationTabChange,
}: AnalyticsStockSummarySectionProps) {
  const preferences = usePreferencesStore((state) => state.preferences);
  const stockFilterOptions = preferences?.stockFilter?.options ?? [];
  const generationOptions = preferences?.generation?.options ?? [];
  const showStockFilterTabs = shouldShowStockFilter(preferences?.stockFilter);
  const showGenerationTabs = shouldShowGeneration(preferences?.generation);

  const stockFilterTabs: StockFilterTab[] = showStockFilterTabs
    ? ['all', ...stockFilterOptions]
    : [];

  const stockFilterTabItems = stockFilterTabs.map((tab) => ({
    value: tab,
    label: tab === 'all' ? 'All' : tab,
  }));

  const generationTabs: GenerationTab[] = showGenerationTabs ? ['all', ...generationOptions] : [];

  const generationTabItems = generationTabs.map((tab) => ({
    value: tab,
    label: tab === 'all' ? 'All' : tab,
  }));

  const showAnyTabs = showStockFilterTabs || showGenerationTabs;

  return (
    <section className="flex w-full min-w-0 flex-col gap-4">
      <div>
        <h2 className="font-heading text-foreground text-base font-semibold">Stock Summary</h2>
        <p className="text-muted-foreground mt-0.5 text-sm">
          Variety and bag-size breakdown for the selected view.
        </p>
      </div>

      <div className="border-border bg-card text-card-foreground overflow-hidden rounded-xl border shadow-sm">
        {showAnyTabs ? (
          <div className="bg-muted/20 space-y-0">
            {showStockFilterTabs ? (
              <>
                <div className="px-3 pt-3 sm:px-4 sm:pt-4">
                  <StockSummaryTabBar
                    value={stockFilterTab}
                    onValueChange={(value) => onStockFilterTabChange(value as StockFilterTab)}
                    items={stockFilterTabItems}
                    ariaLabel="Stock ownership filter"
                  />
                </div>
                <Separator />
              </>
            ) : null}

            {showGenerationTabs ? (
              <>
                <div className="px-3 pt-3 sm:px-4 sm:pt-4">
                  <StockSummaryTabBar
                    value={generationTab}
                    onValueChange={(value) => onGenerationTabChange(value as GenerationTab)}
                    items={generationTabItems}
                    ariaLabel="Generation filter"
                  />
                </div>
                <Separator />
              </>
            ) : null}
          </div>
        ) : null}

        <div className="p-3 sm:p-4">
          <AnalyticsStockSummaryTable
            matrix={matrix}
            quantityMode={quantityMode}
            stockFilterTab={stockFilterTab}
            generationTab={generationTab}
          />
        </div>
      </div>
    </section>
  );
}
