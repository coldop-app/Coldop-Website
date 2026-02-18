import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import type { DaybookEntry } from '@/services/store-admin/functions/useGetDaybook';
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

export interface DailyReportPdfProps {
  companyName: string;
  dateRangeLabel: string;
  data: GetReportsData;
  sizeColumns: string[];
}

interface ReceiptRow {
  date: string;
  voucher: string;
  variety: string;
  ac?: string;
  chamber: string;
  floor: string;
  row: string;
  sizeQtys: Record<string, number>;
  rowTotal: number;
  runningTotal: number;
  remarks: string;
}

interface DeliveryRow {
  date: string;
  voucher: string;
  variety: string;
  ac?: string;
  chamber: string;
  floor: string;
  row: string;
  sizeQtys: Record<string, number>;
  rowTotal: number;
  runningTotal: number;
}

function locKey(loc: { chamber?: string; floor?: string; row?: string }): string {
  const c = loc?.chamber ?? '';
  const f = loc?.floor ?? '';
  const r = loc?.row ?? '';
  return `${c}|${f}|${r}`;
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
  return { ...e, type: 'RECEIPT' };
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
  options?: { includeAcColumn: boolean }
): ReceiptRow[] {
  const rows: ReceiptRow[] = [];
  let runningTotal = 0;
  const sorted = [...incoming].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  const includeAc = options?.includeAcColumn ?? false;

  for (const entry of sorted) {
    if (entry.type !== 'RECEIPT' || !entry.bagSizes?.length) continue;
    const variety = entry.variety ?? '-';
    const remarks = entry.remarks ?? '-';
    const dateStr = formatPdfDate(entry.date);
    const voucherStr = String(entry.gatePassNo ?? '');
    const acStr = includeAc
      ? String(entry.farmerStorageLinkId?.accountNumber ?? '')
      : undefined;

    const byLoc = new Map<string, { size: string; qty: number }[]>();
    for (const bag of entry.bagSizes) {
      const key = locKey(bag.location ?? {});
      if (!byLoc.has(key)) byLoc.set(key, []);
      byLoc.get(key)!.push({ size: bag.name, qty: bag.initialQuantity ?? 0 });
    }

    const locations = Array.from(byLoc.entries()).sort(([a], [b]) =>
      a.localeCompare(b)
    );
    let firstInVoucher = true;
    for (const [key, sizeList] of locations) {
      const [c, f, r] = key.split('|');
      const sizeQtys: Record<string, number> = sizeColumns.reduce(
        (acc, col) => ({
          ...acc,
          [col]: sizeList.filter((x) => x.size === col).reduce((s, x) => s + x.qty, 0),
        }),
        {} as Record<string, number>
      );
      const rowTotal = sizeList.reduce((s, { qty }) => s + qty, 0);
      runningTotal += rowTotal;
      rows.push({
        date: dateStr,
        voucher: voucherStr,
        variety,
        ...(includeAc && acStr !== undefined ? { ac: acStr } : {}),
        chamber: c,
        floor: f,
        row: r,
        sizeQtys,
        rowTotal,
        runningTotal,
        remarks: firstInVoucher ? remarks : '-',
      });
      firstInVoucher = false;
    }
  }
  return rows;
}

function buildDeliveryRows(
  outgoing: DaybookEntry[],
  sizeColumns: string[],
  openingTotal: number,
  options?: { includeAcColumn: boolean }
): DeliveryRow[] {
  const rows: DeliveryRow[] = [];
  let runningTotal = openingTotal;
  const sorted = [...outgoing].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  const includeAc = options?.includeAcColumn ?? false;

  for (const entry of sorted) {
    if (entry.type !== 'DELIVERY') continue;
    const variety = entry.variety ?? '-';
    const dateStr = formatPdfDate(entry.date);
    const voucherStr = String(entry.gatePassNo ?? '');
    const acStr = includeAc
      ? String(entry.farmerStorageLinkId?.accountNumber ?? '')
      : undefined;
    const orderDetails = entry.orderDetails ?? [];

    const byLoc = new Map<string, { size: string; qty: number }[]>();
    for (const od of orderDetails) {
      const key = locKey(od.location ?? {});
      if (!byLoc.has(key)) byLoc.set(key, []);
      byLoc.get(key)!.push({ size: od.size, qty: od.quantityIssued ?? 0 });
    }

    if (byLoc.size === 0) {
      const rowTotal = orderDetails.reduce((s, d) => s + (d.quantityIssued ?? 0), 0);
      runningTotal -= rowTotal;
      rows.push({
        date: dateStr,
        voucher: voucherStr,
        variety,
        ...(includeAc && acStr !== undefined ? { ac: acStr } : {}),
        chamber: '-',
        floor: '-',
        row: '-',
        sizeQtys: sizeColumns.reduce((acc, col) => {
          acc[col] = orderDetails.filter((d) => d.size === col).reduce((s, d) => s + (d.quantityIssued ?? 0), 0);
          return acc;
        }, {} as Record<string, number>),
        rowTotal,
        runningTotal,
      });
      continue;
    }

    const locations = Array.from(byLoc.entries()).sort(([a], [b]) =>
      a.localeCompare(b)
    );
    for (const [key, sizeList] of locations) {
      const [c, f, r] = key.split('|');
      const sizeQtys: Record<string, number> = {};
      for (const col of sizeColumns) {
        sizeQtys[col] = sizeList.filter((x) => x.size === col).reduce((s, x) => s + x.qty, 0);
      }
      const rowTotal = sizeList.reduce((s, x) => s + x.qty, 0);
      runningTotal -= rowTotal;
      rows.push({
        date: dateStr,
        voucher: voucherStr,
        variety,
        ...(includeAc && acStr !== undefined ? { ac: acStr } : {}),
        chamber: c,
        floor: f,
        row: r,
        sizeQtys,
        rowTotal,
        runningTotal,
      });
    }
  }
  return rows;
}

function totalBagsOutgoing(entry: DaybookEntry): number {
  const orderDetails = entry.orderDetails ?? [];
  return orderDetails.reduce((s, d) => s + (d.quantityIssued ?? 0), 0);
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
    fontSize: 8,
  },
  header: {
    borderBottomWidth: 2,
    borderBottomColor: '#000',
    paddingBottom: 6,
    marginBottom: 12,
    textAlign: 'center',
  },
  companyName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 3,
  },
  reportTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  dateRange: {
    fontSize: 9,
    marginBottom: 6,
  },
  farmerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  farmerInfoCol: {
    width: '48%',
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 3,
    fontSize: 8,
  },
  infoLabel: {
    width: '40%',
    fontWeight: 'bold',
  },
  infoValue: {
    width: '60%',
  },
  ledgerContainer: {
    marginVertical: 12,
  },
  ledgerTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 6,
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
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    paddingVertical: 3,
  },
  cell: {
    padding: 2,
    fontSize: 7,
    textAlign: 'center',
    borderRightWidth: 0.5,
    borderRightColor: '#666',
  },
  cellLeft: {
    padding: 2,
    fontSize: 7,
    textAlign: 'left',
    borderRightWidth: 0.5,
    borderRightColor: '#666',
  },
  cellLast: {
    borderRightWidth: 0,
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
    padding: 8,
    borderWidth: 2,
    borderColor: '#000',
    backgroundColor: '#F5F5F5',
  },
  summaryTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  summaryRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: '#666',
    paddingVertical: 3,
    paddingHorizontal: 4,
    fontSize: 8,
    fontWeight: 'bold',
  },
  summaryLabel: {
    width: '70%',
  },
  summaryValue: {
    width: '30%',
    textAlign: 'right',
    borderLeftWidth: 0.5,
    borderLeftColor: '#666',
    paddingLeft: 4,
  },
  summaryRowClosing: {
    backgroundColor: '#D0D0D0',
  },
  footer: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#000',
    paddingTop: 6,
    fontSize: 7,
  },
  footerLeft: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  footerCenter: {
    flex: 1,
    marginLeft: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerRight: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  footerLogo: {
    width: 24,
    height: 24,
    marginBottom: 3,
  },
  poweredBy: {
    fontSize: 6,
    color: '#555',
    fontStyle: 'italic',
  },
  pageNumber: {
    textAlign: 'center',
    fontSize: 7,
    color: '#666',
    marginTop: 8,
  },
});

const receiptTableCols = (includeAc: boolean) =>
  includeAc
    ? ['DATE', 'VOUCHER', 'A/c', 'VARIETY', 'CH', 'FL', 'ROW']
    : ['DATE', 'VOUCHER', 'VARIETY', 'CH', 'FL', 'ROW'];
const deliveryTableCols = (includeAc: boolean) =>
  includeAc
    ? ['DATE', 'VOUCHER', 'A/c', 'VARIETY', 'CH', 'FL', 'ROW']
    : ['DATE', 'VOUCHER', 'VARIETY', 'CH', 'FL', 'ROW'];

function cellWidth(col: string): string {
  if (col === 'VARIETY') return '14%';
  if (col === 'DATE') return '10%';
  if (col === 'VOUCHER') return '8%';
  if (col === 'A/c') return '6%';
  if (col === 'TOTAL' || col === 'G.TOTAL') return '8%';
  if (col === 'REMARKS') return '8%';
  return '6%';
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
}: {
  companyName: string;
  dateRangeLabel: string;
  block: ReportFarmerBlock;
  sizeColumns: string[];
  pageIndex: number;
}) {
  const incoming = block.incoming.map(toDaybookEntryIncoming);
  const outgoing = block.outgoing.map(toDaybookEntryOutgoing);
  const receiptRows = buildReceiptRows(incoming, sizeColumns, { includeAcColumn: false });
  const totalReceived = receiptRows.reduce((s, r) => s + r.rowTotal, 0);
  const receiptTotalsBySize = sizeColumns.reduce(
    (acc, col) => ({
      ...acc,
      [col]: receiptRows.reduce((s, r) => s + (r.sizeQtys[col] ?? 0), 0),
    }),
    {} as Record<string, number>
  );
  const openingTotal = totalReceived;
  const deliveryRows = buildDeliveryRows(outgoing, sizeColumns, openingTotal, { includeAcColumn: false });
  const totalDelivered = outgoing.reduce((s, entry) => s + totalBagsOutgoing(entry), 0);
  const closingBalance = openingTotal - totalDelivered;
  const includeAc = false;
  const recCols = [...receiptTableCols(includeAc), ...sizeColumns, 'TOTAL', 'G.TOTAL', 'REMARKS'];
  const delCols = [...deliveryTableCols(includeAc), ...sizeColumns, 'TOTAL', 'G.TOTAL'];
  const farmer = block.farmer;

  return (
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.companyName}>{companyName}</Text>
        <Text style={styles.reportTitle}>DAILY REPORTS</Text>
        <Text style={styles.dateRange}>{dateRangeLabel}</Text>
      </View>

      <View style={styles.farmerInfo}>
        <View style={styles.farmerInfoCol}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>A/c No.:</Text>
            <Text style={styles.infoValue}>{String(farmer.accountNumber)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Name:</Text>
            <Text style={styles.infoValue}>{farmer.name}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Address:</Text>
            <Text style={styles.infoValue}>{farmer.address}</Text>
          </View>
        </View>
        <View style={styles.farmerInfoCol}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Mobile:</Text>
            <Text style={styles.infoValue}>{farmer.mobileNumber}</Text>
          </View>
        </View>
      </View>

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
                  { width: cellWidth(col) },
                ]}
              >
                {col}
              </Text>
            ))}
          </View>
          {receiptRows.map((r, idx) => (
            <View
              key={`${r.date}-${r.voucher}-${r.chamber}-${r.floor}-${r.row}-${idx}`}
              style={styles.tableRow}
            >
              <Text style={[styles.cell, { width: '10%' }]}>{r.date}</Text>
              <Text style={[styles.cell, { width: '8%' }]}>{r.voucher}</Text>
              <Text style={[styles.cellLeft, { width: '14%' }]}>{r.variety}</Text>
              <Text style={[styles.cell, { width: '6%' }]}>{r.chamber}</Text>
              <Text style={[styles.cell, { width: '5%' }]}>{r.floor}</Text>
              <Text style={[styles.cell, { width: '5%' }]}>{r.row}</Text>
              {sizeColumns.map((col) => (
                <Text key={col} style={[styles.cell, { width: '6%' }]}>
                  {r.sizeQtys[col] ? String(r.sizeQtys[col]) : '-'}
                </Text>
              ))}
              <Text style={[styles.cell, styles.cellTotal, { width: '8%' }]}>{r.rowTotal}</Text>
              <Text style={[styles.cell, styles.cellGTotal, { width: '8%' }]}>{r.runningTotal}</Text>
              <Text style={[styles.cell, styles.cellRemarks, styles.cellLast, { width: '8%' }]}>{r.remarks}</Text>
            </View>
          ))}
          {receiptRows.length > 0 && (
            <View style={[styles.tableRow, styles.rowTotals]}>
              <Text style={[styles.cell, { width: '10%' }]}>TOTAL</Text>
              <Text style={[styles.cell, { width: '8%' }]}>-</Text>
              <Text style={[styles.cellLeft, { width: '14%' }]}>-</Text>
              <Text style={[styles.cell, { width: '6%' }]}>-</Text>
              <Text style={[styles.cell, { width: '5%' }]}>-</Text>
              <Text style={[styles.cell, { width: '5%' }]}>-</Text>
              {sizeColumns.map((col) => (
                <Text key={col} style={[styles.cell, { width: '6%' }]}>
                  {receiptTotalsBySize[col] ?? 0}
                </Text>
              ))}
              <Text style={[styles.cell, styles.cellTotal, { width: '8%' }]}>{totalReceived}</Text>
              <Text style={[styles.cell, styles.cellGTotal, { width: '8%' }]}>{totalReceived}</Text>
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
                  ...(col === 'VARIETY' ? [styles.cellLeft] : []),
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
          {openingTotal > 0 && (
            <View style={[styles.tableRow, styles.rowBalance]}>
              <Text style={[styles.cell, { width: '10%' }]}>OPENING</Text>
              <Text style={[styles.cell, { width: '8%' }]}>BALANCE</Text>
              <Text style={[styles.cellLeft, { width: '14%' }]}>-</Text>
              <Text style={[styles.cell, { width: '6%' }]}>-</Text>
              <Text style={[styles.cell, { width: '5%' }]}>-</Text>
              <Text style={[styles.cell, { width: '5%' }]}>-</Text>
              {sizeColumns.map((col) => (
                <Text key={col} style={[styles.cell, { width: '6%' }]}>
                  {receiptTotalsBySize[col] ?? 0}
                </Text>
              ))}
              <Text style={[styles.cell, styles.cellTotal, { width: '8%' }]}>{openingTotal}</Text>
              <Text style={[styles.cell, styles.cellGTotal, styles.cellLast, { width: '8%' }]}>{openingTotal}</Text>
            </View>
          )}
          {deliveryRows.map((r, idx) => (
            <View
              key={`${r.date}-${r.voucher}-${r.chamber}-${r.floor}-${r.row}-${idx}`}
              style={styles.tableRow}
            >
              <Text style={[styles.cell, { width: '10%' }]}>{r.date}</Text>
              <Text style={[styles.cell, { width: '8%' }]}>{r.voucher}</Text>
              <Text style={[styles.cellLeft, { width: '14%' }]}>{r.variety}</Text>
              <Text style={[styles.cell, { width: '6%' }]}>{r.chamber}</Text>
              <Text style={[styles.cell, { width: '5%' }]}>{r.floor}</Text>
              <Text style={[styles.cell, { width: '5%' }]}>{r.row}</Text>
              {sizeColumns.map((col) => (
                <Text key={col} style={[styles.cell, { width: '6%' }]}>
                  {r.sizeQtys[col] ? String(r.sizeQtys[col]) : '-'}
                </Text>
              ))}
              <Text style={[styles.cell, styles.cellTotal, { width: '8%' }]}>{r.rowTotal}</Text>
              <Text style={[styles.cell, styles.cellGTotal, styles.cellLast, { width: '8%' }]}>{r.runningTotal}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.summary}>
        <Text style={styles.summaryTitle}>Account Summary</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Total Receipt Transactions:</Text>
          <Text style={styles.summaryValue}>{incoming.length}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Total Delivery Transactions:</Text>
          <Text style={styles.summaryValue}>{outgoing.length}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Total Bags Received:</Text>
          <Text style={styles.summaryValue}>{totalReceived}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Total Bags Delivered:</Text>
          <Text style={styles.summaryValue}>{totalDelivered}</Text>
        </View>
        <View style={[styles.summaryRow, styles.summaryRowClosing]}>
          <Text style={styles.summaryLabel}>CLOSING BALANCE:</Text>
          <Text style={styles.summaryValue}>{closingBalance}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.footerLeft}>
          <Text style={{ fontSize: 7 }}>Authorized Signature: ____________________</Text>
        </View>
        <View style={styles.footerCenter}>
          <View style={{ alignItems: 'center' }}>
            <Image
              src="https://res.cloudinary.com/dakh64xhy/image/upload/v1753172868/profile_pictures/lhdlzskpe2gj8dq8jvzl.png"
              style={styles.footerLogo}
            />
            <Text style={styles.poweredBy}>Powered by Coldop</Text>
          </View>
        </View>
        <View style={styles.footerRight}>
          <Text style={{ fontSize: 7 }}>{dateRangeLabel}</Text>
        </View>
      </View>

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
}: {
  companyName: string;
  dateRangeLabel: string;
  incoming: IncomingGatePassEntry[];
  outgoing: ReportOutgoingEntry[];
  sizeColumns: string[];
}) {
  const incoming = incomingList.map(toDaybookEntryIncoming);
  const outgoing = outgoingList.map(toDaybookEntryOutgoing);
  const includeAc = true;
  const receiptRows = buildReceiptRows(incoming, sizeColumns, { includeAcColumn: true });
  const totalReceived = receiptRows.reduce((s, r) => s + r.rowTotal, 0);
  const receiptTotalsBySize = sizeColumns.reduce(
    (acc, col) => ({
      ...acc,
      [col]: receiptRows.reduce((s, r) => s + (r.sizeQtys[col] ?? 0), 0),
    }),
    {} as Record<string, number>
  );
  const deliveryRows = buildDeliveryRows(outgoing, sizeColumns, totalReceived, { includeAcColumn: true });
  const totalDelivered = outgoing.reduce((s, e) => s + totalBagsOutgoing(e), 0);
  const closingBalance = totalReceived - totalDelivered;
  const recCols = [...receiptTableCols(includeAc), ...sizeColumns, 'TOTAL', 'G.TOTAL', 'REMARKS'];
  const delCols = [...deliveryTableCols(includeAc), ...sizeColumns, 'TOTAL', 'G.TOTAL'];

  return (
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.companyName}>{companyName}</Text>
        <Text style={styles.reportTitle}>DAILY REPORTS</Text>
        <Text style={styles.dateRange}>{dateRangeLabel}</Text>
      </View>

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
                  { width: cellWidth(col) },
                ]}
              >
                {col}
              </Text>
            ))}
          </View>
          {receiptRows.map((r, idx) => (
            <View
              key={`${r.date}-${r.voucher}-${r.ac}-${r.chamber}-${idx}`}
              style={styles.tableRow}
            >
              <Text style={[styles.cell, { width: '10%' }]}>{r.date}</Text>
              <Text style={[styles.cell, { width: '8%' }]}>{r.voucher}</Text>
              <Text style={[styles.cell, { width: '6%' }]}>{r.ac ?? '-'}</Text>
              <Text style={[styles.cellLeft, { width: '14%' }]}>{r.variety}</Text>
              <Text style={[styles.cell, { width: '6%' }]}>{r.chamber}</Text>
              <Text style={[styles.cell, { width: '5%' }]}>{r.floor}</Text>
              <Text style={[styles.cell, { width: '5%' }]}>{r.row}</Text>
              {sizeColumns.map((col) => (
                <Text key={col} style={[styles.cell, { width: '6%' }]}>
                  {r.sizeQtys[col] ? String(r.sizeQtys[col]) : '-'}
                </Text>
              ))}
              <Text style={[styles.cell, styles.cellTotal, { width: '8%' }]}>{r.rowTotal}</Text>
              <Text style={[styles.cell, styles.cellGTotal, { width: '8%' }]}>{r.runningTotal}</Text>
              <Text style={[styles.cell, styles.cellRemarks, styles.cellLast, { width: '8%' }]}>{r.remarks}</Text>
            </View>
          ))}
          {receiptRows.length > 0 && (
            <View style={[styles.tableRow, styles.rowTotals]}>
              <Text style={[styles.cell, { width: '10%' }]}>TOTAL</Text>
              <Text style={[styles.cell, { width: '8%' }]}>-</Text>
              <Text style={[styles.cell, { width: '6%' }]}>-</Text>
              <Text style={[styles.cellLeft, { width: '14%' }]}>-</Text>
              <Text style={[styles.cell, { width: '6%' }]}>-</Text>
              <Text style={[styles.cell, { width: '5%' }]}>-</Text>
              <Text style={[styles.cell, { width: '5%' }]}>-</Text>
              {sizeColumns.map((col) => (
                <Text key={col} style={[styles.cell, { width: '6%' }]}>
                  {receiptTotalsBySize[col] ?? 0}
                </Text>
              ))}
              <Text style={[styles.cell, styles.cellTotal, { width: '8%' }]}>{totalReceived}</Text>
              <Text style={[styles.cell, styles.cellGTotal, { width: '8%' }]}>{totalReceived}</Text>
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
                  ...(col === 'VARIETY' ? [styles.cellLeft] : []),
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
              <Text style={[styles.cell, { width: '6%' }]}>-</Text>
              <Text style={[styles.cellLeft, { width: '14%' }]}>-</Text>
              <Text style={[styles.cell, { width: '6%' }]}>-</Text>
              <Text style={[styles.cell, { width: '5%' }]}>-</Text>
              <Text style={[styles.cell, { width: '5%' }]}>-</Text>
              {sizeColumns.map((col) => (
                <Text key={col} style={[styles.cell, { width: '6%' }]}>
                  {receiptTotalsBySize[col] ?? 0}
                </Text>
              ))}
              <Text style={[styles.cell, styles.cellTotal, { width: '8%' }]}>{totalReceived}</Text>
              <Text style={[styles.cell, styles.cellGTotal, styles.cellLast, { width: '8%' }]}>{totalReceived}</Text>
            </View>
          )}
          {deliveryRows.map((r, idx) => (
            <View
              key={`${r.date}-${r.voucher}-${r.ac}-${r.chamber}-${idx}`}
              style={styles.tableRow}
            >
              <Text style={[styles.cell, { width: '10%' }]}>{r.date}</Text>
              <Text style={[styles.cell, { width: '8%' }]}>{r.voucher}</Text>
              <Text style={[styles.cell, { width: '6%' }]}>{r.ac ?? '-'}</Text>
              <Text style={[styles.cellLeft, { width: '14%' }]}>{r.variety}</Text>
              <Text style={[styles.cell, { width: '6%' }]}>{r.chamber}</Text>
              <Text style={[styles.cell, { width: '5%' }]}>{r.floor}</Text>
              <Text style={[styles.cell, { width: '5%' }]}>{r.row}</Text>
              {sizeColumns.map((col) => (
                <Text key={col} style={[styles.cell, { width: '6%' }]}>
                  {r.sizeQtys[col] ? String(r.sizeQtys[col]) : '-'}
                </Text>
              ))}
              <Text style={[styles.cell, styles.cellTotal, { width: '8%' }]}>{r.rowTotal}</Text>
              <Text style={[styles.cell, styles.cellGTotal, styles.cellLast, { width: '8%' }]}>{r.runningTotal}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.summary}>
        <Text style={styles.summaryTitle}>Summary</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Total Receipt Transactions:</Text>
          <Text style={styles.summaryValue}>{incoming.length}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Total Delivery Transactions:</Text>
          <Text style={styles.summaryValue}>{outgoing.length}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Total Bags Received:</Text>
          <Text style={styles.summaryValue}>{totalReceived}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Total Bags Delivered:</Text>
          <Text style={styles.summaryValue}>{totalDelivered}</Text>
        </View>
        <View style={[styles.summaryRow, styles.summaryRowClosing]}>
          <Text style={styles.summaryLabel}>CLOSING BALANCE:</Text>
          <Text style={styles.summaryValue}>{closingBalance}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.footerLeft}>
          <Text style={{ fontSize: 7 }}>Authorized Signature: ____________________</Text>
        </View>
        <View style={styles.footerCenter}>
          <View style={{ alignItems: 'center' }}>
            <Image
              src="https://res.cloudinary.com/dakh64xhy/image/upload/v1753172868/profile_pictures/lhdlzskpe2gj8dq8jvzl.png"
              style={styles.footerLogo}
            />
            <Text style={styles.poweredBy}>Powered by Coldop</Text>
          </View>
        </View>
        <View style={styles.footerRight}>
          <Text style={{ fontSize: 7 }}>{dateRangeLabel}</Text>
        </View>
      </View>

      <Text style={styles.pageNumber}>Page 1</Text>
    </Page>
  );
}

export function DailyReportPdf({
  companyName,
  dateRangeLabel,
  data,
  sizeColumns,
}: DailyReportPdfProps) {
  if (isReportsDataGrouped(data)) {
    const grouped = data as GetReportsDataGrouped;
    if (grouped.farmers.length === 0) {
      return (
        <Document>
          <Page size="A4" style={styles.page}>
            <View style={styles.header}>
              <Text style={styles.companyName}>{companyName}</Text>
              <Text style={styles.reportTitle}>DAILY REPORTS</Text>
              <Text style={styles.dateRange}>{dateRangeLabel}</Text>
            </View>
            <View style={{ padding: 24 }}>
              <Text style={{ fontSize: 10 }}>No report data for this period.</Text>
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
          />
        ))}
      </Document>
    );
  }

  const flatData = data as Extract<GetReportsData, { incoming: IncomingGatePassEntry[]; outgoing: ReportOutgoingEntry[] }>;
  return (
    <Document>
      <FlatReportPage
        companyName={companyName}
        dateRangeLabel={dateRangeLabel}
        incoming={flatData.incoming}
        outgoing={flatData.outgoing}
        sizeColumns={sizeColumns}
      />
    </Document>
  );
}
