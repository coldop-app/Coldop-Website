import type { IncomingGatePassReportRecord } from '@/features/incoming-report/api/types';

export type IncomingReportSearchIndex = {
  row: IncomingGatePassReportRecord;
  text: string;
};

function buildIncomingReportSearchText(row: IncomingGatePassReportRecord): string {
  const link = row.farmerStorageLinkId;

  return [
    link.name,
    link.address,
    String(link.accountNumber),
    String(row.gatePassNo),
    row.manualParchiNumber,
    row.date,
    row.variety,
    row.stockFilter,
    row.customMarka,
    row.remarks,
    row.truckNumber,
    row.createdBy?.name,
    String(row.initialTotal),
    String(row.currentTotal),
    ...row.bagSizes.flatMap((bag) => [
      bag.name,
      String(bag.currentQuantity),
      String(bag.initialQuantity),
      bag.location.chamber,
      bag.location.floor,
      bag.location.row,
    ]),
  ]
    .filter((value) => value != null && value !== '')
    .join('\u0000')
    .toLowerCase();
}

export function createIncomingReportSearchIndex(
  rows: IncomingGatePassReportRecord[],
): IncomingReportSearchIndex[] {
  return rows.map((row) => ({
    row,
    text: buildIncomingReportSearchText(row),
  }));
}

export function filterIncomingReportSearchIndex(
  index: IncomingReportSearchIndex[],
  query: string,
): IncomingGatePassReportRecord[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return index.map((item) => item.row);

  const matches: IncomingGatePassReportRecord[] = [];

  for (const item of index) {
    if (item.text.includes(normalized)) {
      matches.push(item.row);
    }
  }

  return matches;
}

export function countIncomingReportSearchMatches(
  index: IncomingReportSearchIndex[],
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
