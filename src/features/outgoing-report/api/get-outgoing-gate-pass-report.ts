import apiClient, { getApiErrorMessage } from '@/lib/api-client';

import type { GetOutgoingGatePassReportResponse, OutgoingGatePassReportParams } from './types';

export function buildOutgoingGatePassReportParams(
  params: OutgoingGatePassReportParams,
): Record<string, string> {
  const query: Record<string, string> = {};

  if (params.dateFrom) query.dateFrom = params.dateFrom;
  if (params.dateTo) query.dateTo = params.dateTo;

  return query;
}

export async function getOutgoingGatePassReport(
  params: OutgoingGatePassReportParams = {},
): Promise<GetOutgoingGatePassReportResponse> {
  try {
    const { data } = await apiClient.get<GetOutgoingGatePassReportResponse>(
      '/outgoing-gate-pass/report',
      { params: buildOutgoingGatePassReportParams(params) },
    );

    if (!data.success) {
      throw new Error(data.message ?? 'Failed to load outgoing report');
    }

    return data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to load outgoing report'), { cause: error });
  }
}
