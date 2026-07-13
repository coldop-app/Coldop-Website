import type { StockQuantityMode } from '@/features/people/utils/build-farmer-stock-summary';

export function getAnalyticsQuantityForMode(
  initialQuantity: number,
  currentQuantity: number,
  mode: StockQuantityMode,
): number {
  switch (mode) {
    case 'current':
      return currentQuantity;
    case 'initial':
      return initialQuantity;
    case 'outgoing':
      return Math.max(initialQuantity - currentQuantity, 0);
  }
}
