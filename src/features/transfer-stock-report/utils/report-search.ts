import type { TransferStockReportRecord } from '@/features/transfer-stock-report/api/types';

export type TransferStockReportSearchIndex = {
  row: TransferStockReportRecord;
  text: string;
};

function buildTransferStockReportSearchText(row: TransferStockReportRecord): string {
  const from = row.fromFarmerStorageLinkId;
  const to = row.toFarmerStorageLinkId;

  return [
    String(row.gatePassNo),
    row.date,
    row.customMarka,
    row.truckNumber,
    row.remarks,
    from.name,
    from.address,
    String(from.accountNumber),
    from.mobileNumber,
    to.name,
    to.address,
    String(to.accountNumber),
    to.mobileNumber,
    row.createdBy?.name,
    ...row.items.flatMap((item) => [
      String(item.gatePassNo),
      item.bagSize,
      String(item.quantity),
      item.location?.chamber,
      item.location?.floor,
      item.location?.row,
    ]),
  ]
    .filter((value) => value != null && value !== '')
    .join('\u0000')
    .toLowerCase();
}

export function createTransferStockReportSearchIndex(
  rows: TransferStockReportRecord[],
): TransferStockReportSearchIndex[] {
  return rows.map((row) => ({
    row,
    text: buildTransferStockReportSearchText(row),
  }));
}

export function filterTransferStockReportSearchIndex(
  index: TransferStockReportSearchIndex[],
  query: string,
): TransferStockReportRecord[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return index.map((item) => item.row);

  const matches: TransferStockReportRecord[] = [];

  for (const item of index) {
    if (item.text.includes(normalized)) {
      matches.push(item.row);
    }
  }

  return matches;
}

export function countTransferStockReportSearchMatches(
  index: TransferStockReportSearchIndex[],
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
