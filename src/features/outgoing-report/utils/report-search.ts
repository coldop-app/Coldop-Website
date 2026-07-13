import type { OutgoingGatePassReportRecord } from '@/features/outgoing-report/api/types';
import {
  getOutgoingReportType,
  getOutgoingReportVariety,
} from '@/features/outgoing-report/utils/report-row-values';

export type OutgoingReportSearchIndex = {
  row: OutgoingGatePassReportRecord;
  text: string;
};

function buildOutgoingReportSearchText(row: OutgoingGatePassReportRecord): string {
  const link = row.farmerStorageLinkId;

  return [
    link.name,
    link.address,
    String(link.accountNumber),
    String(row.gatePassNo),
    row.manualParchiNumber != null ? String(row.manualParchiNumber) : null,
    row.date,
    getOutgoingReportType(row),
    getOutgoingReportVariety(row),
    row.stockFilter,
    row.from,
    row.to,
    row.remarks,
    row.truckNumber,
    row.createdBy?.name,
    row.isNull ? 'nulled' : null,
    ...row.orderDetails.flatMap((detail) => [
      detail.size,
      String(detail.quantityIssued),
      String(detail.quantityAvailable),
      detail.location?.chamber,
      detail.location?.floor,
      detail.location?.row,
    ]),
    ...(row.incomingGatePassSnapshots ?? []).flatMap((snapshot) => [
      String(snapshot.gatePassNo),
      snapshot.variety,
    ]),
  ]
    .filter((value) => value != null && value !== '')
    .join('\u0000')
    .toLowerCase();
}

export function createOutgoingReportSearchIndex(
  rows: OutgoingGatePassReportRecord[],
): OutgoingReportSearchIndex[] {
  return rows.map((row) => ({
    row,
    text: buildOutgoingReportSearchText(row),
  }));
}

export function filterOutgoingReportSearchIndex(
  index: OutgoingReportSearchIndex[],
  query: string,
): OutgoingGatePassReportRecord[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return index.map((item) => item.row);

  const matches: OutgoingGatePassReportRecord[] = [];

  for (const item of index) {
    if (item.text.includes(normalized)) {
      matches.push(item.row);
    }
  }

  return matches;
}

export function countOutgoingReportSearchMatches(
  index: OutgoingReportSearchIndex[],
  query: string,
): number {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return index.length;

  let count = 0;

  for (const item of index) {
    if (item.text.includes(normalized)) count += 1;
  }

  return count;
}
