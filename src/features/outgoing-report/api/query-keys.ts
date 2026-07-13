import type { OutgoingGatePassReportParams } from './types';

export const outgoingGatePassReportKeys = {
  all: ['outgoing-gate-pass', 'report'] as const,
  list: (params: OutgoingGatePassReportParams) =>
    [...outgoingGatePassReportKeys.all, params] as const,
};
