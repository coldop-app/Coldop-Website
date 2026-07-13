import type { IncomingGatePassReportParams } from './types';

export const incomingGatePassReportKeys = {
  all: ['incoming-gate-pass', 'report'] as const,
  list: (params: IncomingGatePassReportParams) =>
    [...incomingGatePassReportKeys.all, params] as const,
};
