import type { TransferStockReportParams } from './types';

export const transferStockReportKeys = {
  all: ['transfer-stock', 'report'] as const,
  list: (params: TransferStockReportParams) => [...transferStockReportKeys.all, params] as const,
};
