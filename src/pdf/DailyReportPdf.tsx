import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import type { DaybookEntry } from '@/services/store-admin/functions/useGetDaybook';
import { shouldShowSpecialFields } from '@/lib/special-fields';
import type {
  GetReportsData,
  GetReportsDataGrouped,
  ReportFarmerBlock,
  ReportOutgoingEntry,
} from '@/services/analytics/useGetReports';
import { isReportsDataGrouped } from '@/services/analytics/useGetReports';
import type { IncomingGatePassEntry } from '@/services/store-admin/functions/useGetDaybook';

/* ------------------------------------------------------------------ */
/* Types */
/* ------------------------------------------------------------------ */

export interface DailyReportPdfAdmin {
  mobileNumber?: string;
}

export interface DailyReportPdfProps {
  companyName: string;
  dateRangeLabel: string;
  data: GetReportsData;
  sizeColumns: string[];
  admin?: DailyReportPdfAdmin | null;
  /** When true and special fields are shown, receipt details are grouped by ownership (OWNED / FARMER) */
  filterByOwnership?: boolean;
}

/** Per-size list of (quantity, location) for one gate pass row */
type SizeQtyLocList = Record<string, { qty: number; loc: string }[]>;

interface ReceiptRow {
  date: string;
  voucher: string;
  variety: string;
  ac?: string;
  farmerName?: string;
  customMarka?: string;
  sizeQtys: SizeQtyLocList;
  rowTotal: number;
  runningTotal: number;
  remarks: string;
}

interface DeliveryRow {
  date: string;
  voucher: string;
  variety: string;
  ac?: string;
  farmerName?: string;
  customMarka?: string;
  sizeQtys: SizeQtyLocList;
  rowTotal: number;
  runningTotal: number;
}

/** Format location for display below quantity, e.g. "(1-2-1)" */
function locDisplay(loc: { chamber?: string; floor?: string; row?: string }): string {
  const c = loc?.chamber ?? '';
  const f = loc?.floor ?? '';
  const r = loc?.row ?? '';
  const s = [c, f, r].filter(Boolean).join('-').trim();
  return s ? `(${s})` : '';
}

function formatPdfDate(iso: string): string {
  if (!iso) return '-';
  const d = new Date(iso);
  const day = d.getDate();
  const month = d.getMonth() + 1;
  const year = String(d.getFullYear()).slice(2);
  return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
}

function toDaybookEntryIncoming(e: IncomingGatePassEntry): DaybookEntry {
  return {
    ...e,
    type: 'RECEIPT',
    // Preserve customMarka so it displays in receipt details when shouldShowSpecialFields is true
    customMarka: e.customMarka,
  };
}

function toDaybookEntryOutgoing(e: ReportOutgoingEntry): DaybookEntry {
  const manual = e.manualParchiNumber;
  return {
    ...e,
    type: 'DELIVERY',
    manualParchiNumber: manual !== undefined && manual !== null ? String(manual) : undefined,
  } as DaybookEntry;
}

function buildReceiptRows(
  incoming: DaybookEntry[],
  sizeColumns: string[],
  options?: { includeAcColumn: boolean; includeCustomMarka?: boolean }
): ReceiptRow[] {
  const rows: ReceiptRow[] = [];
  let runningTotal = 0;
  const sorted = [...incoming].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  const includeAc = options?.includeAcColumn ?? false;
  const includeCustomMarka = options?.includeCustomMarka ?? false;

  for (const entry of sorted) {
    if (entry.type !== 'RECEIPT' || !entry.bagSizes?.length) continue;
    const variety = entry.variety ?? '-';
    const remarks = entry.remarks ?? '-';
    const dateStr = formatPdfDate(entry.date);
    const voucherStr = String(entry.gatePassNo ?? '');
    const acStr = includeAc
      ? String(entry.farmerStorageLinkId?.accountNumber ?? '')
      : undefined;
    const farmerName = includeAc
      ? (entry.farmerStorageLinkId?.farmerId?.name ?? '')
      : undefined;
    const customMarka = includeCustomMarka ? (entry.customMarka ?? '-') : undefined;

    const sizeQtys: SizeQtyLocList = sizeColumns.reduce(
      (acc, col) => ({ ...acc, [col]: [] }),
      {} as SizeQtyLocList
    );
    let rowTotal = 0;
    for (const bag of entry.bagSizes) {
      const size = bag.name;
      const qty = bag.initialQuantity ?? 0;
      const loc = locDisplay(bag.location ?? {});
      if (!sizeQtys[size]) sizeQtys[size] = [];
      sizeQtys[size].push({ qty, loc });
      rowTotal += qty;
    }
    runningTotal += rowTotal;
    rows.push({
      date: dateStr,
      voucher: voucherStr,
      variety,
      ...(includeAc && acStr !== undefined ? { ac: acStr, farmerName } : {}),
      ...(includeCustomMarka ? { customMarka } : {}),
      sizeQtys,
      rowTotal,
      runningTotal,
      remarks,
    });
  }
  return rows;
}

function buildDeliveryRows(
  outgoing: DaybookEntry[],
  sizeColumns: string[],
  openingTotal: number,
  options?: { includeAcColumn: boolean; includeCustomMarka?: boolean }
): DeliveryRow[] {
  const rows: DeliveryRow[] = [];
  let runningTotal = openingTotal;
  const sorted = [...outgoing].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  const includeAc = options?.includeAcColumn ?? false;
  const includeCustomMarka = options?.includeCustomMarka ?? false;

  for (const entry of sorted) {
    if (entry.type !== 'DELIVERY') continue;
    const variety = entry.variety ?? '-';
    const dateStr = formatPdfDate(entry.date);
    const voucherStr = String(entry.gatePassNo ?? '');
    const acStr = includeAc
      ? String(entry.farmerStorageLinkId?.accountNumber ?? '')
      : undefined;
    const farmerName = includeAc
      ? (entry.farmerStorageLinkId?.farmerId?.name ?? '')
      : undefined;
    const customMarka = includeCustomMarka
      ? ((entry as DaybookEntry & { customMarka?: string }).customMarka ?? '-')
      : undefined;
    const orderDetails = entry.orderDetails ?? [];

    const sizeQtys: SizeQtyLocList = sizeColumns.reduce(
      (acc, col) => ({ ...acc, [col]: [] }),
      {} as SizeQtyLocList
    );
    let rowTotal = 0;
    for (const od of orderDetails) {
      const size = od.size;
      const qty = od.quantityIssued ?? 0;
      const loc = locDisplay(od.location ?? {});
      if (!sizeQtys[size]) sizeQtys[size] = [];
      sizeQtys[size].push({ qty, loc });
      rowTotal += qty;
    }
    runningTotal -= rowTotal;
    rows.push({
      date: dateStr,
      voucher: voucherStr,
      variety,
      ...(includeAc && acStr !== undefined ? { ac: acStr, farmerName } : {}),
      ...(includeCustomMarka ? { customMarka } : {}),
      sizeQtys,
      rowTotal,
      runningTotal,
    });
  }
  return rows;
}

/* ------------------------------------------------------------------ */
/* Styles */
/* ------------------------------------------------------------------ */

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#FEFDF8',
    padding: 16,
    paddingBottom: 80,
    fontFamily: 'Helvetica',
    fontSize: 11,
  },
  header: {
    borderBottomWidth: 2,
    borderBottomColor: '#000',
    paddingBottom: 6,
    marginBottom: 12,
    textAlign: 'center',
  },
  companyName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 3,
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  dateRange: {
    fontSize: 11,
    marginBottom: 6,
  },
  farmerInfoStrip: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#000',
    backgroundColor: '#F5F5F5',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 12,
  },
  farmerInfoItem: {
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRightWidth: 0.5,
    borderRightColor: '#999',
  },
  farmerInfoItemLast: {
    borderRightWidth: 0,
  },
  farmerInfoLabel: {
    fontSize: 8,
    color: '#444',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 2,
    fontWeight: 'bold',
  },
  farmerInfoValue: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  ledgerContainer: {
    marginVertical: 12,
  },
  ledgerTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  table: {
    borderWidth: 1,
    borderColor: '#000',
    width: '100%',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: '#666',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#E8E8E8',
    fontWeight: 'bold',
    fontSize: 11,
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    paddingVertical: 5,
  },
  cell: {
    padding: 4,
    fontSize: 11,
    textAlign: 'center',
    borderRightWidth: 0.5,
    borderRightColor: '#666',
  },
  cellLeft: {
    padding: 4,
    fontSize: 11,
    textAlign: 'left',
    borderRightWidth: 0.5,
    borderRightColor: '#666',
  },
  cellLast: {
    borderRightWidth: 0,
  },
  cellQtyLoc: {
    paddingVertical: 1,
  },
  cellQtyLocBlock: {
    marginBottom: 4,
  },
  cellLocText: {
    fontSize: 10,
    color: '#444',
  },
  cellTotal: {
    backgroundColor: '#F5F5F5',
    fontWeight: 'bold',
  },
  cellGTotal: {
    backgroundColor: '#E8E8E8',
    fontWeight: 'bold',
  },
  cellRemarks: {
    backgroundColor: '#F5F5F5',
  },
  rowTotals: {
    backgroundColor: '#E0E0E0',
    fontWeight: 'bold',
  },
  rowBalance: {
    backgroundColor: '#F5F5F5',
    fontWeight: 'bold',
  },
  summary: {
    marginTop: 12,
    marginBottom: 10,
  },
  summaryTable: {
    borderWidth: 1,
    borderColor: '#000',
    backgroundColor: '#FAFAFA',
  },
  summaryTableRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: '#999',
    minHeight: 20,
  },
  summaryTableRowLast: {
    borderBottomWidth: 0,
  },
  footer: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopWidth: 1.5,
    borderTopColor: '#000',
    backgroundColor: '#F2F2F2',
    borderRadius: 4,
    paddingTop: 6,
    paddingBottom: 6,
    fontSize: 10,
  },
  footerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerLogo: {
    width: 26,
    height: 26,
    marginBottom: 3,
  },
  poweredBy: {
    fontSize: 10,
    color: '#2B2B2B',
    fontWeight: 'bold',
  },
  pageNumber: {
    textAlign: 'center',
    fontSize: 10,
    color: '#666',
    marginTop: 8,
  },
  emptyStateText: {
    fontSize: 11,
  },
});

function receiptTableBaseCols(includeAc: boolean, showSpecialFields: boolean): string[] {
  const base = includeAc
    ? ['DATE', 'VOUCHER', 'A/c', 'Name', 'VARIETY']
    : ['DATE', 'VOUCHER', 'VARIETY'];
  return showSpecialFields ? [...base, 'CUSTOM MARKA'] : base;
}
function deliveryTableBaseCols(includeAc: boolean, showSpecialFields: boolean): string[] {
  const base = includeAc
    ? ['DATE', 'VOUCHER', 'A/c', 'Name', 'VARIETY']
    : ['DATE', 'VOUCHER', 'VARIETY'];
  return showSpecialFields ? [...base, 'CUSTOM MARKA'] : base;
}

function cellWidth(col: string): string {
  if (col === 'VARIETY') return '14%';
  if (col === 'DATE') return '10%';
  if (col === 'VOUCHER') return '8%';
  if (col === 'A/c') return '6%';
  if (col === 'Name') return '12%';
  if (col === 'CUSTOM MARKA') return '10%';
  if (col === 'TOTAL' || col === 'G.TOTAL') return '8%';
  if (col === 'REMARKS') return '8%';
  return '8%';
}

function buildSummaryMatrix(rows: ReceiptRow[], sizeColumns: string[]) {
  const varietyMap = new Map<string, Record<string, number>>();
  for (const row of rows) {
    const variety = row.variety?.trim() || '-';
    const totals =
      varietyMap.get(variety) ??
      (Object.fromEntries(sizeColumns.map((col) => [col, 0])) as Record<string, number>);
    for (const col of sizeColumns) {
      totals[col] += (row.sizeQtys[col] ?? []).reduce((sum, item) => sum + item.qty, 0);
    }
    varietyMap.set(variety, totals);
  }

  const varietyRows = [...varietyMap.entries()]
    .map(([variety, totalsBySize]) => ({
      variety,
      totalsBySize,
      rowTotal: sizeColumns.reduce((sum, col) => sum + (totalsBySize[col] ?? 0), 0),
    }))
    .sort((a, b) => a.variety.localeCompare(b.variety));

  const grandTotalsBySize = Object.fromEntries(sizeColumns.map((col) => [col, 0])) as Record<string, number>;
  for (const row of varietyRows) {
    for (const col of sizeColumns) {
      grandTotalsBySize[col] += row.totalsBySize[col] ?? 0;
    }
  }

  return {
    varietyRows,
    grandTotalsBySize,
    grandTotal: sizeColumns.reduce((sum, col) => sum + (grandTotalsBySize[col] ?? 0), 0),
  };
}

function SummaryTable({
  receiptRows,
  sizeColumns,
}: {
  receiptRows: ReceiptRow[];
  sizeColumns: string[];
}) {
  const { varietyRows, grandTotalsBySize, grandTotal } = buildSummaryMatrix(receiptRows, sizeColumns);
  const sizeColWidth = sizeColumns.length > 0 ? `${Math.max(8, Math.floor(62 / sizeColumns.length))}%` : '12%';

  return (
    <View style={styles.summary}>
      <View style={styles.summaryTable}>
        <View style={[styles.summaryTableRow, styles.tableHeaderRow]}>
          <Text style={[styles.cellLeft, { width: '26%', fontWeight: 'bold' }]}>Varieties</Text>
          {sizeColumns.map((col) => (
            <Text key={`summary-head-${col}`} style={[styles.cell, { width: sizeColWidth, fontWeight: 'bold' }]}>
              {col}
            </Text>
          ))}
          <Text style={[styles.cell, styles.cellTotal, styles.cellLast, { width: '12%', fontWeight: 'bold' }]}>
            Total
          </Text>
        </View>
        {varietyRows.map((row, idx) => (
          <View key={`summary-row-${row.variety}-${idx}`} style={styles.summaryTableRow}>
            <Text style={[styles.cellLeft, { width: '26%' }]}>{row.variety}</Text>
            {sizeColumns.map((col) => (
              <Text key={`summary-${row.variety}-${col}`} style={[styles.cell, { width: sizeColWidth }]}>
                {row.totalsBySize[col] ?? 0}
              </Text>
            ))}
            <Text style={[styles.cell, styles.cellTotal, styles.cellLast, { width: '12%' }]}>{row.rowTotal}</Text>
          </View>
        ))}
        <View style={[styles.summaryTableRow, styles.rowTotals, styles.summaryTableRowLast]}>
          <Text style={[styles.cellLeft, { width: '26%', fontWeight: 'bold' }]}>Bag Total</Text>
          {sizeColumns.map((col) => (
            <Text key={`summary-total-${col}`} style={[styles.cell, { width: sizeColWidth, fontWeight: 'bold' }]}>
              {grandTotalsBySize[col] ?? 0}
            </Text>
          ))}
          <Text style={[styles.cell, styles.cellTotal, styles.cellLast, { width: '12%', fontWeight: 'bold' }]}>
            {grandTotal}
          </Text>
        </View>
      </View>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Single farmer block (same layout as FarmerReportPdf) */
/* ------------------------------------------------------------------ */

function FarmerBlockPage({
  companyName,
  dateRangeLabel,
  block,
  sizeColumns,
  pageIndex,
  showSpecialFields,
  filterByOwnership = false,
  showFooter = true,
}: {
  companyName: string;
  dateRangeLabel: string;
  block: ReportFarmerBlock;
  sizeColumns: string[];
  pageIndex: number;
  showSpecialFields: boolean;
  filterByOwnership?: boolean;
  showFooter?: boolean;
}) {
  const incoming = block.incoming.map(toDaybookEntryIncoming);
  const outgoing = block.outgoing.map(toDaybookEntryOutgoing);
  const useOwnershipFilter = showSpecialFields && filterByOwnership;
  const ownedIncoming = incoming.filter((e) => e.stockFilter === 'OWNED');
  const farmerIncoming = incoming.filter((e) => e.stockFilter !== 'OWNED');
  const receiptRows = buildReceiptRows(incoming, sizeColumns, {
    includeAcColumn: false,
    includeCustomMarka: showSpecialFields,
  });
  const ownedReceiptRows = useOwnershipFilter
    ? buildReceiptRows(ownedIncoming, sizeColumns, {
        includeAcColumn: false,
        includeCustomMarka: true,
      })
    : [];
  const farmerReceiptRows = useOwnershipFilter
    ? buildReceiptRows(farmerIncoming, sizeColumns, {
        includeAcColumn: false,
        includeCustomMarka: true,
      })
    : [];
  const totalReceived = receiptRows.reduce((s, r) => s + r.rowTotal, 0);
  const receiptTotalsBySize = sizeColumns.reduce(
    (acc, col) => ({
      ...acc,
      [col]: receiptRows.reduce(
        (s, r) =>
          s +
          (r.sizeQtys[col] ?? []).reduce((sum, x) => sum + x.qty, 0),
        0
      ),
    }),
    {} as Record<string, number>
  );
  const ownedTotalsBySize = useOwnershipFilter
    ? sizeColumns.reduce(
        (acc, col) => ({
          ...acc,
          [col]: ownedReceiptRows.reduce(
            (s, r) =>
              s +
              (r.sizeQtys[col] ?? []).reduce((sum, x) => sum + x.qty, 0),
            0
          ),
        }),
        {} as Record<string, number>
      )
    : {};
  const farmerTotalsBySize = useOwnershipFilter
    ? sizeColumns.reduce(
        (acc, col) => ({
          ...acc,
          [col]: farmerReceiptRows.reduce(
            (s, r) =>
              s +
              (r.sizeQtys[col] ?? []).reduce((sum, x) => sum + x.qty, 0),
            0
          ),
        }),
        {} as Record<string, number>
      )
    : {};
  const openingTotal = totalReceived;
  const deliveryRows = buildDeliveryRows(outgoing, sizeColumns, openingTotal, {
    includeAcColumn: false,
    includeCustomMarka: showSpecialFields,
  });
  const includeAc = false;
  const recCols = [
    ...receiptTableBaseCols(includeAc, showSpecialFields),
    ...sizeColumns,
    'TOTAL',
    ...(showSpecialFields ? [] : ['G.TOTAL']),
    'REMARKS',
  ];
  const delCols = [
    ...deliveryTableBaseCols(includeAc, showSpecialFields),
    ...sizeColumns,
    'TOTAL',
    ...(showSpecialFields ? [] : ['G.TOTAL']),
  ];
  const farmer = block.farmer;
  function renderReceiptTable(
    title: string,
    rows: ReceiptRow[],
    totalsBySize: Record<string, number>,
    groupTotal: number
  ) {
    return (
      <View style={styles.ledgerContainer} key={title}>
        <Text style={styles.ledgerTitle}>{title}</Text>
        <View style={styles.table}>
          <View style={styles.tableHeaderRow}>
            {recCols.map((col, i) => (
              <Text
                key={col}
                style={[
                  styles.cell,
                  ...(col === 'VARIETY' ? [styles.cellLeft] : []),
                  ...(i === recCols.length - 1 ? [styles.cellLast] : []),
                  ...(col === 'TOTAL' ? [styles.cellTotal] : []),
                  ...(col === 'G.TOTAL' ? [styles.cellGTotal] : []),
                  ...(col === 'REMARKS' ? [styles.cellRemarks] : []),
                  ...(col === 'CUSTOM MARKA' ? [styles.cellLeft] : []),
                  { width: cellWidth(col) },
                ]}
              >
                {col}
              </Text>
            ))}
          </View>
          {rows.map((r, idx) => (
            <View key={`${title}-${r.date}-${r.voucher}-${idx}`} style={styles.tableRow}>
              <Text style={[styles.cell, { width: '10%' }]}>{r.date}</Text>
              <Text style={[styles.cell, { width: '8%' }]}>{r.voucher}</Text>
              <Text style={[styles.cellLeft, { width: '14%' }]}>{r.variety}</Text>
              {showSpecialFields && (
                <Text style={[styles.cellLeft, { width: cellWidth('CUSTOM MARKA') }]}>
                  {r.customMarka ?? '-'}
                </Text>
              )}
              {sizeColumns.map((col) => {
                const list = r.sizeQtys[col] ?? [];
                return (
                  <View key={col} style={[styles.cell, styles.cellQtyLoc, { width: '8%' }]}>
                    {list.length === 0 ? (
                      <Text>-</Text>
                    ) : (
                      list.map((item, i) => (
                        <View
                          key={i}
                          style={[
                            styles.cellQtyLocBlock,
                            i === list.length - 1 ? { marginBottom: 0 } : {},
                          ]}
                        >
                          <Text>{item.qty}</Text>
                          {item.loc ? (
                            <Text style={styles.cellLocText}>{item.loc}</Text>
                          ) : null}
                        </View>
                      ))
                    )}
                  </View>
                );
              })}
              <Text style={[styles.cell, styles.cellTotal, { width: '8%' }]}>
                {r.rowTotal}
              </Text>
              {!showSpecialFields && (
                <Text style={[styles.cell, styles.cellGTotal, { width: '8%' }]}>{r.runningTotal}</Text>
              )}
              <Text style={[styles.cell, styles.cellRemarks, styles.cellLast, { width: '8%' }]}>
                {r.remarks}
              </Text>
            </View>
          ))}
          {rows.length > 0 && (
            <View style={[styles.tableRow, styles.rowTotals]}>
              <Text style={[styles.cell, { width: '10%' }]}>TOTAL</Text>
              <Text style={[styles.cell, { width: '8%' }]}>-</Text>
              <Text style={[styles.cellLeft, { width: '14%' }]}>-</Text>
              {showSpecialFields && (
                <Text style={[styles.cellLeft, { width: cellWidth('CUSTOM MARKA') }]}>-</Text>
              )}
              {sizeColumns.map((col) => (
                <Text key={col} style={[styles.cell, { width: '8%' }]}>
                  {totalsBySize[col] ?? 0}
                </Text>
              ))}
              <Text style={[styles.cell, styles.cellTotal, { width: '8%' }]}>{groupTotal}</Text>
              {!showSpecialFields && (
                <Text style={[styles.cell, styles.cellGTotal, { width: '8%' }]}>{groupTotal}</Text>
              )}
              <Text style={[styles.cell, styles.cellRemarks, styles.cellLast, { width: '8%' }]}>-</Text>
            </View>
          )}
        </View>
      </View>
    );
  }

  return (
    <Page size="A4" orientation="landscape" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.companyName}>{companyName}</Text>
        <Text style={styles.reportTitle}>DAILY REPORTS</Text>
        <Text style={styles.dateRange}>{dateRangeLabel}</Text>
      </View>

      <View style={styles.farmerInfoStrip}>
        <View style={styles.farmerInfoItem}>
          <Text style={styles.farmerInfoLabel}>A/c No</Text>
          <Text style={styles.farmerInfoValue}>{String(farmer.accountNumber)}</Text>
        </View>
        <View style={styles.farmerInfoItem}>
          <Text style={styles.farmerInfoLabel}>Farmer</Text>
          <Text style={styles.farmerInfoValue}>{farmer.name}</Text>
        </View>
        <View style={styles.farmerInfoItem}>
          <Text style={styles.farmerInfoLabel}>Address</Text>
          <Text style={styles.farmerInfoValue}>{farmer.address}</Text>
        </View>
        <View style={styles.farmerInfoItem}>
          <Text style={styles.farmerInfoLabel}>Mobile</Text>
          <Text style={styles.farmerInfoValue}>{farmer.mobileNumber}</Text>
        </View>
        <View style={[styles.farmerInfoItem, styles.farmerInfoItemLast]}>
          <Text style={styles.farmerInfoLabel}>Report Date</Text>
          <Text style={styles.farmerInfoValue}>{dateRangeLabel}</Text>
        </View>
      </View>

      <SummaryTable receiptRows={receiptRows} sizeColumns={sizeColumns} />

      {useOwnershipFilter ? (
        <>
          {renderReceiptTable(
            'Receipt Details (OWNED)',
            ownedReceiptRows,
            ownedTotalsBySize,
            ownedReceiptRows.reduce((s, r) => s + r.rowTotal, 0)
          )}
          {renderReceiptTable(
            'Receipt Details (FARMER)',
            farmerReceiptRows,
            farmerTotalsBySize,
            farmerReceiptRows.reduce((s, r) => s + r.rowTotal, 0)
          )}
        </>
      ) : (
        renderReceiptTable(
          'Receipt Details',
          receiptRows,
          receiptTotalsBySize,
          totalReceived
        )
      )}

      <View style={styles.ledgerContainer}>
        <Text style={styles.ledgerTitle}>Delivery Details</Text>
        <View style={styles.table}>
          <View style={styles.tableHeaderRow}>
            {delCols.map((col, i) => (
              <Text
                key={col}
                style={[
                  styles.cell,
                  ...(col === 'VARIETY' ? [styles.cellLeft] : []),
                  ...(i === delCols.length - 1 ? [styles.cellLast] : []),
                  ...(col === 'TOTAL' ? [styles.cellTotal] : []),
                  ...(col === 'G.TOTAL' ? [styles.cellGTotal] : []),
                  ...(col === 'CUSTOM MARKA' ? [styles.cellLeft] : []),
                  { width: cellWidth(col) },
                ]}
              >
                {col}
              </Text>
            ))}
          </View>
          {openingTotal > 0 && (
            <View style={[styles.tableRow, styles.rowBalance]}>
              <Text style={[styles.cell, { width: '10%' }]}>OPENING</Text>
              <Text style={[styles.cell, { width: '8%' }]}>BALANCE</Text>
              <Text style={[styles.cellLeft, { width: '14%' }]}>-</Text>
              {showSpecialFields && (
                <Text style={[styles.cellLeft, { width: cellWidth('CUSTOM MARKA') }]}>-</Text>
              )}
              {sizeColumns.map((col) => (
                <Text key={col} style={[styles.cell, { width: '8%' }]}>
                  {receiptTotalsBySize[col] ?? 0}
                </Text>
              ))}
              <Text style={[styles.cell, styles.cellTotal, showSpecialFields ? styles.cellLast : {}, { width: '8%' }]}>
                {openingTotal}
              </Text>
              {!showSpecialFields && (
                <Text style={[styles.cell, styles.cellGTotal, styles.cellLast, { width: '8%' }]}>
                  {openingTotal}
                </Text>
              )}
            </View>
          )}
          {deliveryRows.map((r, idx) => (
            <View
              key={`${r.date}-${r.voucher}-${idx}`}
              style={styles.tableRow}
            >
              <Text style={[styles.cell, { width: '10%' }]}>{r.date}</Text>
              <Text style={[styles.cell, { width: '8%' }]}>{r.voucher}</Text>
              <Text style={[styles.cellLeft, { width: '14%' }]}>{r.variety}</Text>
              {showSpecialFields && (
                <Text style={[styles.cellLeft, { width: cellWidth('CUSTOM MARKA') }]}>
                  {r.customMarka ?? '-'}
                </Text>
              )}
              {sizeColumns.map((col) => {
                const list = r.sizeQtys[col] ?? [];
                return (
                  <View key={col} style={[styles.cell, styles.cellQtyLoc, { width: '8%' }]}>
                    {list.length === 0 ? (
                      <Text>-</Text>
                    ) : (
                      list.map((item, i) => (
                        <View
                          key={i}
                          style={[
                            styles.cellQtyLocBlock,
                            i === list.length - 1 ? { marginBottom: 0 } : {},
                          ]}
                        >
                          <Text>{item.qty}</Text>
                          {item.loc ? (
                            <Text style={styles.cellLocText}>{item.loc}</Text>
                          ) : null}
                        </View>
                      ))
                    )}
                  </View>
                );
              })}
              <Text style={[styles.cell, styles.cellTotal, showSpecialFields ? styles.cellLast : {}, { width: '8%' }]}>
                {r.rowTotal}
              </Text>
              {!showSpecialFields && (
                <Text style={[styles.cell, styles.cellGTotal, styles.cellLast, { width: '8%' }]}>
                  {r.runningTotal}
                </Text>
              )}
            </View>
          ))}
        </View>
      </View>

      {showFooter && (
        <View style={styles.footer}>
          <View style={styles.footerCenter}>
            <View style={{ alignItems: 'center' }}>
              <Image
                src="https://res.cloudinary.com/dakh64xhy/image/upload/v1753172868/profile_pictures/lhdlzskpe2gj8dq8jvzl.png"
                style={styles.footerLogo}
              />
              <Text style={styles.poweredBy}>Powered by Coldop</Text>
            </View>
          </View>
        </View>
      )}

      <Text style={styles.pageNumber}>Page {pageIndex + 1}</Text>
    </Page>
  );
}

/* ------------------------------------------------------------------ */
/* Flat report: single page with all incoming + all outgoing */
/* ------------------------------------------------------------------ */

function FlatReportPage({
  companyName,
  dateRangeLabel,
  incoming: incomingList,
  outgoing: outgoingList,
  sizeColumns,
  showSpecialFields,
  showFooter = true,
}: {
  companyName: string;
  dateRangeLabel: string;
  incoming: IncomingGatePassEntry[];
  outgoing: ReportOutgoingEntry[];
  sizeColumns: string[];
  showSpecialFields: boolean;
  showFooter?: boolean;
}) {
  const incoming = incomingList.map(toDaybookEntryIncoming);
  const outgoing = outgoingList.map(toDaybookEntryOutgoing);
  const includeAc = true;
  const receiptRows = buildReceiptRows(incoming, sizeColumns, {
    includeAcColumn: true,
    includeCustomMarka: showSpecialFields,
  });
  const totalReceived = receiptRows.reduce((s, r) => s + r.rowTotal, 0);
  const receiptTotalsBySize = sizeColumns.reduce(
    (acc, col) => ({
      ...acc,
      [col]: receiptRows.reduce(
        (s, r) =>
          s +
          (r.sizeQtys[col] ?? []).reduce((sum, x) => sum + x.qty, 0),
        0
      ),
    }),
    {} as Record<string, number>
  );
  const deliveryRows = buildDeliveryRows(outgoing, sizeColumns, totalReceived, {
    includeAcColumn: true,
    includeCustomMarka: showSpecialFields,
  });
  const recCols = [
    ...receiptTableBaseCols(includeAc, showSpecialFields),
    ...sizeColumns,
    'TOTAL',
    ...(showSpecialFields ? [] : ['G.TOTAL']),
    'REMARKS',
  ];
  const delCols = [
    ...deliveryTableBaseCols(includeAc, showSpecialFields),
    ...sizeColumns,
    'TOTAL',
    ...(showSpecialFields ? [] : ['G.TOTAL']),
  ];

  return (
    <Page size="A4" orientation="landscape" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.companyName}>{companyName}</Text>
        <Text style={styles.reportTitle}>DAILY REPORTS</Text>
        <Text style={styles.dateRange}>{dateRangeLabel}</Text>
      </View>

      <SummaryTable receiptRows={receiptRows} sizeColumns={sizeColumns} />

      <View style={styles.ledgerContainer}>
        <Text style={styles.ledgerTitle}>Receipt Details</Text>
        <View style={styles.table}>
          <View style={styles.tableHeaderRow}>
            {recCols.map((col, i) => (
              <Text
                key={col}
                style={[
                  styles.cell,
                  ...(col === 'VARIETY' ? [styles.cellLeft] : []),
                  ...(i === recCols.length - 1 ? [styles.cellLast] : []),
                  ...(col === 'TOTAL' ? [styles.cellTotal] : []),
                  ...(col === 'G.TOTAL' ? [styles.cellGTotal] : []),
                  ...(col === 'REMARKS' ? [styles.cellRemarks] : []),
                  ...(col === 'Name' || col === 'VARIETY' || col === 'CUSTOM MARKA' ? [styles.cellLeft] : []),
                  { width: cellWidth(col) },
                ]}
              >
                {col}
              </Text>
            ))}
          </View>
          {receiptRows.map((r, idx) => (
            <View
              key={`${r.date}-${r.voucher}-${r.ac}-${idx}`}
              style={styles.tableRow}
            >
              <Text style={[styles.cell, { width: '10%' }]}>{r.date}</Text>
              <Text style={[styles.cell, { width: '8%' }]}>{r.voucher}</Text>
              <Text style={[styles.cell, { width: cellWidth('A/c') }]}>{r.ac ?? '-'}</Text>
              <Text style={[styles.cellLeft, { width: cellWidth('Name') }]}>{r.farmerName ?? '-'}</Text>
              <Text style={[styles.cellLeft, { width: '14%' }]}>{r.variety}</Text>
              {showSpecialFields && (
                <Text style={[styles.cellLeft, { width: cellWidth('CUSTOM MARKA') }]}>
                  {r.customMarka ?? '-'}
                </Text>
              )}
              {sizeColumns.map((col) => {
                const list = r.sizeQtys[col] ?? [];
                return (
                  <View key={col} style={[styles.cell, styles.cellQtyLoc, { width: '8%' }]}>
                    {list.length === 0 ? (
                      <Text>-</Text>
                    ) : (
                      list.map((item, i) => (
                        <View
                          key={i}
                          style={[
                            styles.cellQtyLocBlock,
                            i === list.length - 1 ? { marginBottom: 0 } : {},
                          ]}
                        >
                          <Text>{item.qty}</Text>
                          {item.loc ? (
                            <Text style={styles.cellLocText}>{item.loc}</Text>
                          ) : null}
                        </View>
                      ))
                    )}
                  </View>
                );
              })}
              <Text style={[styles.cell, styles.cellTotal, { width: '8%' }]}>{r.rowTotal}</Text>
              {!showSpecialFields && (
                <Text style={[styles.cell, styles.cellGTotal, { width: '8%' }]}>{r.runningTotal}</Text>
              )}
              <Text style={[styles.cell, styles.cellRemarks, styles.cellLast, { width: '8%' }]}>{r.remarks}</Text>
            </View>
          ))}
          {receiptRows.length > 0 && (
            <View style={[styles.tableRow, styles.rowTotals]}>
              <Text style={[styles.cell, { width: '10%' }]}>TOTAL</Text>
              <Text style={[styles.cell, { width: '8%' }]}>-</Text>
              <Text style={[styles.cell, { width: cellWidth('A/c') }]}>-</Text>
              <Text style={[styles.cellLeft, { width: cellWidth('Name') }]}>-</Text>
              <Text style={[styles.cellLeft, { width: '14%' }]}>-</Text>
              {showSpecialFields && (
                <Text style={[styles.cellLeft, { width: cellWidth('CUSTOM MARKA') }]}>-</Text>
              )}
              {sizeColumns.map((col) => (
                <Text key={col} style={[styles.cell, { width: '8%' }]}>
                  {receiptTotalsBySize[col] ?? 0}
                </Text>
              ))}
              <Text style={[styles.cell, styles.cellTotal, { width: '8%' }]}>{totalReceived}</Text>
              {!showSpecialFields && (
                <Text style={[styles.cell, styles.cellGTotal, { width: '8%' }]}>{totalReceived}</Text>
              )}
              <Text style={[styles.cell, styles.cellRemarks, styles.cellLast, { width: '8%' }]}>-</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.ledgerContainer}>
        <Text style={styles.ledgerTitle}>Delivery Details</Text>
        <View style={styles.table}>
          <View style={styles.tableHeaderRow}>
            {delCols.map((col, i) => (
              <Text
                key={col}
                style={[
                  styles.cell,
                  ...(col === 'VARIETY' || col === 'Name' || col === 'CUSTOM MARKA' ? [styles.cellLeft] : []),
                  ...(i === delCols.length - 1 ? [styles.cellLast] : []),
                  ...(col === 'TOTAL' ? [styles.cellTotal] : []),
                  ...(col === 'G.TOTAL' ? [styles.cellGTotal] : []),
                  { width: cellWidth(col) },
                ]}
              >
                {col}
              </Text>
            ))}
          </View>
          {totalReceived > 0 && (
            <View style={[styles.tableRow, styles.rowBalance]}>
              <Text style={[styles.cell, { width: '10%' }]}>OPENING</Text>
              <Text style={[styles.cell, { width: '8%' }]}>BALANCE</Text>
              <Text style={[styles.cell, { width: cellWidth('A/c') }]}>-</Text>
              <Text style={[styles.cellLeft, { width: cellWidth('Name') }]}>-</Text>
              <Text style={[styles.cellLeft, { width: '14%' }]}>-</Text>
              {showSpecialFields && (
                <Text style={[styles.cellLeft, { width: cellWidth('CUSTOM MARKA') }]}>-</Text>
              )}
              {sizeColumns.map((col) => (
                <Text key={col} style={[styles.cell, { width: '8%' }]}>
                  {receiptTotalsBySize[col] ?? 0}
                </Text>
              ))}
              <Text style={[styles.cell, styles.cellTotal, showSpecialFields ? styles.cellLast : {}, { width: '8%' }]}>
                {totalReceived}
              </Text>
              {!showSpecialFields && (
                <Text style={[styles.cell, styles.cellGTotal, styles.cellLast, { width: '8%' }]}>
                  {totalReceived}
                </Text>
              )}
            </View>
          )}
          {deliveryRows.map((r, idx) => (
            <View
              key={`${r.date}-${r.voucher}-${r.ac}-${idx}`}
              style={styles.tableRow}
            >
              <Text style={[styles.cell, { width: '10%' }]}>{r.date}</Text>
              <Text style={[styles.cell, { width: '8%' }]}>{r.voucher}</Text>
              <Text style={[styles.cell, { width: cellWidth('A/c') }]}>{r.ac ?? '-'}</Text>
              <Text style={[styles.cellLeft, { width: cellWidth('Name') }]}>{r.farmerName ?? '-'}</Text>
              <Text style={[styles.cellLeft, { width: '14%' }]}>{r.variety}</Text>
              {showSpecialFields && (
                <Text style={[styles.cellLeft, { width: cellWidth('CUSTOM MARKA') }]}>
                  {r.customMarka ?? '-'}
                </Text>
              )}
              {sizeColumns.map((col) => {
                const list = r.sizeQtys[col] ?? [];
                return (
                  <View key={col} style={[styles.cell, styles.cellQtyLoc, { width: '8%' }]}>
                    {list.length === 0 ? (
                      <Text>-</Text>
                    ) : (
                      list.map((item, i) => (
                        <View
                          key={i}
                          style={[
                            styles.cellQtyLocBlock,
                            i === list.length - 1 ? { marginBottom: 0 } : {},
                          ]}
                        >
                          <Text>{item.qty}</Text>
                          {item.loc ? (
                            <Text style={styles.cellLocText}>{item.loc}</Text>
                          ) : null}
                        </View>
                      ))
                    )}
                  </View>
                );
              })}
              <Text style={[styles.cell, styles.cellTotal, showSpecialFields ? styles.cellLast : {}, { width: '8%' }]}>
                {r.rowTotal}
              </Text>
              {!showSpecialFields && (
                <Text style={[styles.cell, styles.cellGTotal, styles.cellLast, { width: '8%' }]}>
                  {r.runningTotal}
                </Text>
              )}
            </View>
          ))}
        </View>
      </View>

      {showFooter && (
        <View style={styles.footer}>
          <View style={styles.footerCenter}>
            <View style={{ alignItems: 'center' }}>
              <Image
                src="https://res.cloudinary.com/dakh64xhy/image/upload/v1753172868/profile_pictures/lhdlzskpe2gj8dq8jvzl.png"
                style={styles.footerLogo}
              />
              <Text style={styles.poweredBy}>Powered by Coldop</Text>
            </View>
          </View>
        </View>
      )}

      <Text style={styles.pageNumber}>Page 1</Text>
    </Page>
  );
}

/* ------------------------------------------------------------------ */
/* Flat report with receipts grouped by ownership (OWNED / FARMER) – when filterByOwnership + showSpecialFields */
/* ------------------------------------------------------------------ */

function FlatReportPageFilteredByOwnership({
  companyName,
  dateRangeLabel,
  incoming: incomingList,
  outgoing: outgoingList,
  sizeColumns,
  showSpecialFields,
  showFooter = true,
}: {
  companyName: string;
  dateRangeLabel: string;
  incoming: IncomingGatePassEntry[];
  outgoing: ReportOutgoingEntry[];
  sizeColumns: string[];
  showSpecialFields: boolean;
  showFooter?: boolean;
}) {
  const ownedIncoming = incomingList.filter((e) => e.stockFilter === 'OWNED');
  const farmerIncoming = incomingList.filter((e) => e.stockFilter !== 'OWNED');

  const ownedAsDaybook = ownedIncoming.map(toDaybookEntryIncoming);
  const farmerAsDaybook = farmerIncoming.map(toDaybookEntryIncoming);
  const outgoing = outgoingList.map(toDaybookEntryOutgoing);

  const includeAc = true;
  const receiptOptions = { includeAcColumn: true, includeCustomMarka: showSpecialFields };

  const ownedReceiptRows = buildReceiptRows(ownedAsDaybook, sizeColumns, receiptOptions);
  const farmerReceiptRows = buildReceiptRows(farmerAsDaybook, sizeColumns, receiptOptions);

  const totalOwned = ownedReceiptRows.reduce((s, r) => s + r.rowTotal, 0);
  const totalFarmer = farmerReceiptRows.reduce((s, r) => s + r.rowTotal, 0);
  const totalReceived = totalOwned + totalFarmer;

  const ownedTotalsBySize = sizeColumns.reduce(
    (acc, col) => ({
      ...acc,
      [col]: ownedReceiptRows.reduce(
        (s, r) => s + (r.sizeQtys[col] ?? []).reduce((sum, x) => sum + x.qty, 0),
        0
      ),
    }),
    {} as Record<string, number>
  );
  const farmerTotalsBySize = sizeColumns.reduce(
    (acc, col) => ({
      ...acc,
      [col]: farmerReceiptRows.reduce(
        (s, r) => s + (r.sizeQtys[col] ?? []).reduce((sum, x) => sum + x.qty, 0),
        0
      ),
    }),
    {} as Record<string, number>
  );
  const receiptTotalsBySize = sizeColumns.reduce(
    (acc, col) => ({ ...acc, [col]: (ownedTotalsBySize[col] ?? 0) + (farmerTotalsBySize[col] ?? 0) }),
    {} as Record<string, number>
  );

  const deliveryRows = buildDeliveryRows(outgoing, sizeColumns, totalReceived, receiptOptions);

  const recCols = [
    ...receiptTableBaseCols(includeAc, showSpecialFields),
    ...sizeColumns,
    'TOTAL',
    ...(showSpecialFields ? [] : ['G.TOTAL']),
    'REMARKS',
  ];
  const delCols = [
    ...deliveryTableBaseCols(includeAc, showSpecialFields),
    ...sizeColumns,
    'TOTAL',
    ...(showSpecialFields ? [] : ['G.TOTAL']),
  ];

  function renderReceiptTable(
    title: string,
    rows: ReceiptRow[],
    groupTotal: number,
    totalsBySize: Record<string, number>
  ) {
    return (
      <View style={styles.ledgerContainer} key={title}>
        <Text style={styles.ledgerTitle}>{title}</Text>
        <View style={styles.table}>
          <View style={styles.tableHeaderRow}>
            {recCols.map((col, i) => (
              <Text
                key={col}
                style={[
                  styles.cell,
                  ...(col === 'VARIETY' ? [styles.cellLeft] : []),
                  ...(i === recCols.length - 1 ? [styles.cellLast] : []),
                  ...(col === 'TOTAL' ? [styles.cellTotal] : []),
                  ...(col === 'G.TOTAL' ? [styles.cellGTotal] : []),
                  ...(col === 'REMARKS' ? [styles.cellRemarks] : []),
                  ...(col === 'Name' || col === 'VARIETY' || col === 'CUSTOM MARKA' ? [styles.cellLeft] : []),
                  { width: cellWidth(col) },
                ]}
              >
                {col}
              </Text>
            ))}
          </View>
          {rows.map((r, idx) => (
            <View key={`${r.date}-${r.voucher}-${r.ac}-${idx}`} style={styles.tableRow}>
              <Text style={[styles.cell, { width: '10%' }]}>{r.date}</Text>
              <Text style={[styles.cell, { width: '8%' }]}>{r.voucher}</Text>
              <Text style={[styles.cell, { width: cellWidth('A/c') }]}>{r.ac ?? '-'}</Text>
              <Text style={[styles.cellLeft, { width: cellWidth('Name') }]}>{r.farmerName ?? '-'}</Text>
              <Text style={[styles.cellLeft, { width: '14%' }]}>{r.variety}</Text>
              {showSpecialFields && (
                <Text style={[styles.cellLeft, { width: cellWidth('CUSTOM MARKA') }]}>{r.customMarka ?? '-'}</Text>
              )}
              {sizeColumns.map((col) => {
                const list = r.sizeQtys[col] ?? [];
                return (
                  <View key={col} style={[styles.cell, styles.cellQtyLoc, { width: '8%' }]}>
                    {list.length === 0 ? (
                      <Text>-</Text>
                    ) : (
                      list.map((item, i) => (
                        <View
                          key={i}
                          style={[styles.cellQtyLocBlock, i === list.length - 1 ? { marginBottom: 0 } : {}]}
                        >
                          <Text>{item.qty}</Text>
                          {item.loc ? <Text style={styles.cellLocText}>{item.loc}</Text> : null}
                        </View>
                      ))
                    )}
                  </View>
                );
              })}
              <Text style={[styles.cell, styles.cellTotal, { width: '8%' }]}>{r.rowTotal}</Text>
              {!showSpecialFields && (
                <Text style={[styles.cell, styles.cellGTotal, { width: '8%' }]}>{r.runningTotal}</Text>
              )}
              <Text style={[styles.cell, styles.cellRemarks, styles.cellLast, { width: '8%' }]}>{r.remarks}</Text>
            </View>
          ))}
          {rows.length > 0 && (
            <View style={[styles.tableRow, styles.rowTotals]}>
              <Text style={[styles.cell, { width: '10%' }]}>TOTAL</Text>
              <Text style={[styles.cell, { width: '8%' }]}>-</Text>
              <Text style={[styles.cell, { width: cellWidth('A/c') }]}>-</Text>
              <Text style={[styles.cellLeft, { width: cellWidth('Name') }]}>-</Text>
              <Text style={[styles.cellLeft, { width: '14%' }]}>-</Text>
              {showSpecialFields && (
                <Text style={[styles.cellLeft, { width: cellWidth('CUSTOM MARKA') }]}>-</Text>
              )}
              {sizeColumns.map((col) => (
                <Text key={col} style={[styles.cell, { width: '8%' }]}>{totalsBySize[col] ?? 0}</Text>
              ))}
              <Text style={[styles.cell, styles.cellTotal, { width: '8%' }]}>{groupTotal}</Text>
              {!showSpecialFields && (
                <Text style={[styles.cell, styles.cellGTotal, { width: '8%' }]}>{groupTotal}</Text>
              )}
              <Text style={[styles.cell, styles.cellRemarks, styles.cellLast, { width: '8%' }]}>-</Text>
            </View>
          )}
        </View>
      </View>
    );
  }

  return (
    <Page size="A4" orientation="landscape" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.companyName}>{companyName}</Text>
        <Text style={styles.reportTitle}>DAILY REPORTS</Text>
        <Text style={styles.dateRange}>{dateRangeLabel}</Text>
      </View>

      <SummaryTable receiptRows={[...ownedReceiptRows, ...farmerReceiptRows]} sizeColumns={sizeColumns} />

      {renderReceiptTable('Receipt Details (OWNED)', ownedReceiptRows, totalOwned, ownedTotalsBySize)}
      {renderReceiptTable('Receipt Details (FARMER)', farmerReceiptRows, totalFarmer, farmerTotalsBySize)}

      <View style={styles.ledgerContainer}>
        <Text style={styles.ledgerTitle}>Delivery Details</Text>
        <View style={styles.table}>
          <View style={styles.tableHeaderRow}>
            {delCols.map((col, i) => (
              <Text
                key={col}
                style={[
                  styles.cell,
                  ...(col === 'VARIETY' || col === 'Name' || col === 'CUSTOM MARKA' ? [styles.cellLeft] : []),
                  ...(i === delCols.length - 1 ? [styles.cellLast] : []),
                  ...(col === 'TOTAL' ? [styles.cellTotal] : []),
                  ...(col === 'G.TOTAL' ? [styles.cellGTotal] : []),
                  { width: cellWidth(col) },
                ]}
              >
                {col}
              </Text>
            ))}
          </View>
          {totalReceived > 0 && (
            <View style={[styles.tableRow, styles.rowBalance]}>
              <Text style={[styles.cell, { width: '10%' }]}>OPENING</Text>
              <Text style={[styles.cell, { width: '8%' }]}>BALANCE</Text>
              <Text style={[styles.cell, { width: cellWidth('A/c') }]}>-</Text>
              <Text style={[styles.cellLeft, { width: cellWidth('Name') }]}>-</Text>
              <Text style={[styles.cellLeft, { width: '14%' }]}>-</Text>
              {showSpecialFields && (
                <Text style={[styles.cellLeft, { width: cellWidth('CUSTOM MARKA') }]}>-</Text>
              )}
              {sizeColumns.map((col) => (
                <Text key={col} style={[styles.cell, { width: '8%' }]}>
                  {receiptTotalsBySize[col] ?? 0}
                </Text>
              ))}
              <Text style={[styles.cell, styles.cellTotal, showSpecialFields ? styles.cellLast : {}, { width: '8%' }]}>
                {totalReceived}
              </Text>
              {!showSpecialFields && (
                <Text style={[styles.cell, styles.cellGTotal, styles.cellLast, { width: '8%' }]}>
                  {totalReceived}
                </Text>
              )}
            </View>
          )}
          {deliveryRows.map((r, idx) => (
            <View key={`${r.date}-${r.voucher}-${r.ac}-${idx}`} style={styles.tableRow}>
              <Text style={[styles.cell, { width: '10%' }]}>{r.date}</Text>
              <Text style={[styles.cell, { width: '8%' }]}>{r.voucher}</Text>
              <Text style={[styles.cell, { width: cellWidth('A/c') }]}>{r.ac ?? '-'}</Text>
              <Text style={[styles.cellLeft, { width: cellWidth('Name') }]}>{r.farmerName ?? '-'}</Text>
              <Text style={[styles.cellLeft, { width: '14%' }]}>{r.variety}</Text>
              {showSpecialFields && (
                <Text style={[styles.cellLeft, { width: cellWidth('CUSTOM MARKA') }]}>
                  {r.customMarka ?? '-'}
                </Text>
              )}
              {sizeColumns.map((col) => {
                const list = r.sizeQtys[col] ?? [];
                return (
                  <View key={col} style={[styles.cell, styles.cellQtyLoc, { width: '8%' }]}>
                    {list.length === 0 ? (
                      <Text>-</Text>
                    ) : (
                      list.map((item, i) => (
                        <View
                          key={i}
                          style={[
                            styles.cellQtyLocBlock,
                            i === list.length - 1 ? { marginBottom: 0 } : {},
                          ]}
                        >
                          <Text>{item.qty}</Text>
                          {item.loc ? (
                            <Text style={styles.cellLocText}>{item.loc}</Text>
                          ) : null}
                        </View>
                      ))
                    )}
                  </View>
                );
              })}
              <Text style={[styles.cell, styles.cellTotal, showSpecialFields ? styles.cellLast : {}, { width: '8%' }]}>
                {r.rowTotal}
              </Text>
              {!showSpecialFields && (
                <Text style={[styles.cell, styles.cellGTotal, styles.cellLast, { width: '8%' }]}>
                  {r.runningTotal}
                </Text>
              )}
            </View>
          ))}
        </View>
      </View>

      {showFooter && (
        <View style={styles.footer}>
          <View style={styles.footerCenter}>
            <View style={{ alignItems: 'center' }}>
              <Image
                src="https://res.cloudinary.com/dakh64xhy/image/upload/v1753172868/profile_pictures/lhdlzskpe2gj8dq8jvzl.png"
                style={styles.footerLogo}
              />
              <Text style={styles.poweredBy}>Powered by Coldop</Text>
            </View>
          </View>
        </View>
      )}

      <Text style={styles.pageNumber}>Page 1</Text>
    </Page>
  );
}

export function DailyReportPdf({
  companyName,
  dateRangeLabel,
  data,
  sizeColumns,
  admin,
  filterByOwnership,
}: DailyReportPdfProps) {
  const showSpecialFields = shouldShowSpecialFields(admin?.mobileNumber);

  if (isReportsDataGrouped(data)) {
    const grouped = data as GetReportsDataGrouped;
    if (grouped.farmers.length === 0) {
      return (
        <Document>
          <Page size="A4" orientation="landscape" style={styles.page}>
            <View style={styles.header}>
              <Text style={styles.companyName}>{companyName}</Text>
              <Text style={styles.reportTitle}>DAILY REPORTS</Text>
              <Text style={styles.dateRange}>{dateRangeLabel}</Text>
            </View>
            <View style={{ padding: 24 }}>
              <Text style={styles.emptyStateText}>No report data for this period.</Text>
            </View>
          </Page>
        </Document>
      );
    }
    return (
      <Document>
        {grouped.farmers.map((block, i) => (
          <FarmerBlockPage
            key={i}
            companyName={companyName}
            dateRangeLabel={dateRangeLabel}
            block={block}
            sizeColumns={sizeColumns}
            pageIndex={i}
            showSpecialFields={showSpecialFields}
            filterByOwnership={filterByOwnership}
            showFooter={i === grouped.farmers.length - 1}
          />
        ))}
      </Document>
    );
  }

  const flatData = data as Extract<GetReportsData, { incoming: IncomingGatePassEntry[]; outgoing: ReportOutgoingEntry[] }>;
  const useOwnershipFilter = showSpecialFields && filterByOwnership === true;

  return (
    <Document>
      {useOwnershipFilter ? (
        <FlatReportPageFilteredByOwnership
          companyName={companyName}
          dateRangeLabel={dateRangeLabel}
          incoming={flatData.incoming}
          outgoing={flatData.outgoing}
          sizeColumns={sizeColumns}
          showSpecialFields={showSpecialFields}
        />
      ) : (
        <FlatReportPage
          companyName={companyName}
          dateRangeLabel={dateRangeLabel}
          incoming={flatData.incoming}
          outgoing={flatData.outgoing}
          sizeColumns={sizeColumns}
          showSpecialFields={showSpecialFields}
        />
      )}
    </Document>
  );
}
