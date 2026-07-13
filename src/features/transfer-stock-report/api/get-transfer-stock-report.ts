import apiClient, { getApiErrorMessage } from '@/lib/api-client';

import type { GetTransferStockReportResponse, TransferStockReportParams } from './types';

export function buildTransferStockReportParams(
  params: TransferStockReportParams,
): Record<string, string> {
  const query: Record<string, string> = {};

  if (params.dateFrom) query.dateFrom = params.dateFrom;
  if (params.dateTo) query.dateTo = params.dateTo;

  return query;
}

export async function getTransferStockReport(
  params: TransferStockReportParams = {},
): Promise<GetTransferStockReportResponse> {
  try {
    const { data } = await apiClient.get<GetTransferStockReportResponse>('/transfer-stock/report', {
      params: buildTransferStockReportParams(params),
    });

    if (!data.success) {
      throw new Error(data.message ?? 'Failed to load transfer stock report');
    }

    return data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to load transfer stock report'), {
      cause: error,
    });
  }
}
