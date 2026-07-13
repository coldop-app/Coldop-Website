import { Layers } from 'lucide-react';

import { AnalyticsDistributionPanel } from '@/features/analytics/components/analytics-distribution-panel';
import type { AnalyticsDistribution } from '@/features/analytics/utils/build-analytics-distribution';
import type { StockQuantityMode } from '@/features/people/utils/build-farmer-stock-summary';

type AnalyticsSizeDistributionProps = {
  distribution: AnalyticsDistribution;
  quantityMode: StockQuantityMode;
};

export function AnalyticsSizeDistribution({
  distribution,
  quantityMode,
}: AnalyticsSizeDistributionProps) {
  return (
    <AnalyticsDistributionPanel
      title="Size distribution"
      icon={Layers}
      labelColumn="Size"
      distribution={distribution}
      quantityMode={quantityMode}
    />
  );
}
