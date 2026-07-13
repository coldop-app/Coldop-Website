import { queryOptions, useQuery } from '@tanstack/react-query';

import { getTransferStockReport } from './get-transfer-stock-report';
import { transferStockReportKeys } from './query-keys';
import type { GetTransferStockReportResponse, TransferStockReportParams } from './types';

export function transferStockReportQueryOptions(params: TransferStockReportParams) {
  return queryOptions({
    queryKey: transferStockReportKeys.list(params),
    queryFn: () => getTransferStockReport(params),
  });
}

export function useTransferStockReport(params: TransferStockReportParams) {
  return useQuery({
    ...transferStockReportQueryOptions(params),
  });
}

export type { GetTransferStockReportResponse, TransferStockReportParams };
