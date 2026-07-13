import { queryOptions, useQuery } from '@tanstack/react-query';

import { getOutgoingGatePassReport } from './get-outgoing-gate-pass-report';
import { outgoingGatePassReportKeys } from './query-keys';
import type { GetOutgoingGatePassReportResponse, OutgoingGatePassReportParams } from './types';

export function outgoingGatePassReportQueryOptions(params: OutgoingGatePassReportParams) {
  return queryOptions({
    queryKey: outgoingGatePassReportKeys.list(params),
    queryFn: () => getOutgoingGatePassReport(params),
  });
}

export function useOutgoingGatePassReport(params: OutgoingGatePassReportParams) {
  return useQuery({
    ...outgoingGatePassReportQueryOptions(params),
  });
}

export type { GetOutgoingGatePassReportResponse, OutgoingGatePassReportParams };
