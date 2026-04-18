import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import type { DaybookEntry } from '@/services/store-admin/functions/useGetDaybook';
import { shouldShowSpecialFields } from '@/lib/special-fields';

/* ------------------------------------------------------------------ */
/* Types */
/* ------------------------------------------------------------------ */

export interface FarmerReportPdfFarmer {
  accountNumber: number | string;
  name: string;
  address: string;
  mobileNumber: string;
}

export interface FarmerReportPdfStoreAdmin {
  name?: string;
  mobileNumber?: string;
}

export interface FarmerReportPdfProps {
  companyName: string;
  farmer: FarmerReportPdfFarmer;
  storeAdmin?: FarmerReportPdfStoreAdmin;
  reportDate: string;
  incoming: DaybookEntry[];
  outgoing: DaybookEntry[];
  sizeColumns: string[];
  /** When true, group receipt and delivery tables by variety (only when not using special fields layout). */
  groupByVariety?: boolean;
  /** When true and special fields are shown, receipt details are grouped by ownership (OWNED / FARMER). */
  filterByOwnership?: boolean;
  /** Ownership report view when ownership filter is enabled. */
  ownershipReportView?: 'ALL' | 'OWNED' | 'FARMER';
}

/** Per-size list of (quantity, location) for one gate pass row */
export type SizeQtyLocList = Record<string, { qty: number; loc: string }[]>;

interface ReceiptRow {
  date: string;
  voucher: string;
  variety: string;
  customMarka: string;
  sizeQtys: SizeQtyLocList;
  rowTotal: number;
  runningTotal: number;
  remarks: string;
}

interface DeliveryRow {
  date: string;
  voucher: string;
  variety: string;
  customMarka: string;
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

/** Ascending gate pass order; tie-break by date for identical numbers. */
function compareDaybookByGatePassAsc(a: DaybookEntry, b: DaybookEntry): number {
  const ga = a.gatePassNo ?? 0;
  const gb = b.gatePassNo ?? 0;
  if (ga !== gb) return ga - gb;
  return new Date(a.date).getTime() - new Date(b.date).getTime();
}

function buildReceiptRows(
  incoming: DaybookEntry[],
  sizeColumns: string[],
  startingRunningTotal = 0
): ReceiptRow[] {
  const rows: ReceiptRow[] = [];
  let runningTotal = startingRunningTotal;
  const sorted = [...incoming].sort(compareDaybookByGatePassAsc);

  for (const entry of sorted) {
    if (entry.type !== 'RECEIPT' || !entry.bagSizes?.length) continue;
    const variety = entry.variety ?? '-';
    const customMarka = entry.customMarka ?? '-';
    const remarks = entry.remarks ?? '-';
    const dateStr = formatPdfDate(entry.date);
    const voucherStr = String(entry.gatePassNo ?? '');

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
      customMarka,
      sizeQtys,
      rowTotal,
      runningTotal,
      remarks,
    });
  }
  return rows;
}

/** Same row shape as farm receipts; used for stock bought from other farmers via incoming transfer. */
function buildIncomingTransferRows(
  entries: DaybookEntry[],
  sizeColumns: string[],
  startingRunningTotal = 0
): ReceiptRow[] {
  const rows: ReceiptRow[] = [];
  let runningTotal = startingRunningTotal;
  const sorted = [...entries].sort(compareDaybookByGatePassAsc);

  for (const entry of sorted) {
    if (entry.type !== 'Incoming-transfer' || !entry.bagSizes?.length) continue;
    const variety = entry.variety ?? '-';
    const customMarka = entry.customMarka ?? '-';
    const remarks = entry.remarks ?? '-';
    const dateStr = formatPdfDate(entry.date);
    const voucherStr = String(entry.gatePassNo ?? '');

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
      customMarka,
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
  openingTotal: number
): DeliveryRow[] {
  const rows: DeliveryRow[] = [];
  let runningTotal = openingTotal;
  const sorted = [...outgoing].sort(compareDaybookByGatePassAsc);

  for (const entry of sorted) {
    if (entry.type !== 'DELIVERY') continue;
    const variety = getOutgoingEntryVariety(entry);
    const customMarka = entry.customMarka ?? '-';
    const dateStr = formatPdfDate(entry.date);
    const voucherStr = String(entry.gatePassNo ?? '');
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
      customMarka,
      sizeQtys,
      rowTotal,
      runningTotal,
    });
  }
  return rows;
}

function totalBagsOutgoing(entry: DaybookEntry): number {
  const orderDetails = entry.orderDetails ?? [];
  return orderDetails.reduce((s, d) => s + (d.quantityIssued ?? 0), 0);
}

/**
 * Derive display variety for an outgoing (DELIVERY) entry – same logic as outgoing-gate-pass-card:
 * from incomingGatePassEntries, else incomingGatePassSnapshots, else top-level entry.variety.
 */
function getOutgoingEntryVariety(entry: DaybookEntry): string {
  const incomingEntries = entry.incomingGatePassEntries ?? [];
  if (incomingEntries.length > 0) {
    const varieties = [
      ...new Set(
        incomingEntries
          .map((e) => e.variety?.trim())
          .filter((v): v is string => Boolean(v))
      ),
    ];
    return varieties.length > 0 ? varieties.join(', ') : '-';
  }
  const snapshots = entry.incomingGatePassSnapshots ?? [];
  if (snapshots.length > 0) {
    const varieties = [
      ...new Set(
        snapshots
          .map((s) => s.variety?.trim())
          .filter((v): v is string => Boolean(v))
      ),
    ];
    return varieties.length > 0 ? varieties.join(', ') : '-';
  }
  return entry.variety?.trim() ?? '-';
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
    marginVertical: 16,
  },
  ledgerTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  /** Section title after another table (e.g. incoming transfer) — extra top air */
  ledgerSubsectionTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 18,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  varietySubtitle: {
    fontSize: 9,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 6,
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
  cellQtyLoc: {
    paddingVertical: 1,
  },
  cellQtyLocBlock: {
    marginBottom: 4,
  },
  cellLocText: {
    fontSize: 6,
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
    marginTop: 18,
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
    marginLeft:28,
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

/** Group incoming (RECEIPT) entries by variety using Object.groupBy. */
function groupIncomingByVariety(
  entries: DaybookEntry[]
): Record<string, DaybookEntry[]> {
  return Object.groupBy(entries, (entry) => String(entry.variety ?? '-')) as Record<string, DaybookEntry[]>;
}

/** Group outgoing (DELIVERY) entries by derived variety (from snapshots/entries). */
function groupOutgoingByVariety(
  entries: DaybookEntry[]
): Record<string, DaybookEntry[]> {
  return Object.groupBy(entries, getOutgoingEntryVariety) as Record<string, DaybookEntry[]>;
}

export function FarmerReportPdf({
  companyName,
  farmer,
  storeAdmin,
  reportDate,
  incoming,
  outgoing,
  sizeColumns,
  groupByVariety = false,
  filterByOwnership = false,
  ownershipReportView = 'ALL',
}: FarmerReportPdfProps) {
  const showSpecialFields = shouldShowSpecialFields(storeAdmin?.mobileNumber);
  const useOwnershipFilter = showSpecialFields && filterByOwnership;

  const ownedIncoming = useOwnershipFilter
    ? incoming.filter((e) => e.stockFilter === 'OWNED')
    : [];
  const farmerIncoming = useOwnershipFilter
    ? incoming.filter((e) => e.stockFilter !== 'OWNED')
    : [];
  const showOwnedSection = useOwnershipFilter && ownershipReportView !== 'FARMER';
  const showFarmerSection = useOwnershipFilter && ownershipReportView !== 'OWNED';

  const ownedReceiptRows = useOwnershipFilter
    ? buildReceiptRows(ownedIncoming, sizeColumns)
    : [];
  const farmerReceiptRows = useOwnershipFilter
    ? buildReceiptRows(farmerIncoming, sizeColumns)
    : [];

  const farmIncomingOnly = incoming.filter((e) => e.type === 'RECEIPT');
  const incomingTransferEntries = incoming.filter((e) => e.type === 'Incoming-transfer');

  const receiptRows = buildReceiptRows(farmIncomingOnly, sizeColumns);
  const totalFarmReceived = receiptRows.reduce((s, r) => s + r.rowTotal, 0);
  const farmReceiptTotalsBySize = sizeColumns.reduce(
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

  const incomingTransferRows = buildIncomingTransferRows(
    incomingTransferEntries,
    sizeColumns,
    totalFarmReceived
  );
  const totalIncomingTransferBags = incomingTransferRows.reduce((s, r) => s + r.rowTotal, 0);
  const incomingTransferTotalsBySize = sizeColumns.reduce(
    (acc, col) => ({
      ...acc,
      [col]: incomingTransferRows.reduce(
        (s, r) =>
          s + (r.sizeQtys[col] ?? []).reduce((sum, x) => sum + x.qty, 0),
        0
      ),
    }),
    {} as Record<string, number>
  );

  /** Per-size bags from all incoming credited to stock (farm receipts + purchases from other farmers). */
  const receiptTotalsBySize = sizeColumns.reduce(
    (acc, col) => ({
      ...acc,
      [col]: (farmReceiptTotalsBySize[col] ?? 0) + (incomingTransferTotalsBySize[col] ?? 0),
    }),
    {} as Record<string, number>
  );
  const totalReceived = totalFarmReceived + totalIncomingTransferBags;
  const openingTotal = totalReceived;
  const deliveryRows = buildDeliveryRows(outgoing, sizeColumns, openingTotal);
  const totalDelivered = outgoing.reduce((s, e) => s + totalBagsOutgoing(e), 0);
  const closingBalance = openingTotal - totalDelivered;

  const farmReceiptTxCount = farmIncomingOnly.length;
  const incomingTransferTxCount = incomingTransferEntries.length;

  const totalOwned = ownedReceiptRows.reduce((s, r) => s + r.rowTotal, 0);
  const totalFarmer = farmerReceiptRows.reduce((s, r) => s + r.rowTotal, 0);

  const ownedTransferRows = useOwnershipFilter
    ? buildIncomingTransferRows(
        ownedIncoming.filter((e) => e.type === 'Incoming-transfer'),
        sizeColumns,
        totalOwned
      )
    : [];
  const farmerTransferRows = useOwnershipFilter
    ? buildIncomingTransferRows(
        farmerIncoming.filter((e) => e.type === 'Incoming-transfer'),
        sizeColumns,
        totalFarmer
      )
    : [];

  const ownedTotalsBySize = useOwnershipFilter
    ? sizeColumns.reduce(
        (acc, col) => ({
          ...acc,
          [col]: ownedReceiptRows.reduce(
            (s, r) => s + (r.sizeQtys[col] ?? []).reduce((a, x) => a + x.qty, 0),
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
            (s, r) => s + (r.sizeQtys[col] ?? []).reduce((a, x) => a + x.qty, 0),
            0
          ),
        }),
        {} as Record<string, number>
      )
    : {};
  const ownedTransferTotalsBySize = useOwnershipFilter
    ? sizeColumns.reduce(
        (acc, col) => ({
          ...acc,
          [col]: ownedTransferRows.reduce(
            (s, r) => s + (r.sizeQtys[col] ?? []).reduce((a, x) => a + x.qty, 0),
            0
          ),
        }),
        {} as Record<string, number>
      )
    : {};
  const totalOwnedTransferBags = ownedTransferRows.reduce((s, r) => s + r.rowTotal, 0);
  const farmerTransferTotalsBySize = useOwnershipFilter
    ? sizeColumns.reduce(
        (acc, col) => ({
          ...acc,
          [col]: farmerTransferRows.reduce(
            (s, r) => s + (r.sizeQtys[col] ?? []).reduce((a, x) => a + x.qty, 0),
            0
          ),
        }),
        {} as Record<string, number>
      )
    : {};
  const totalFarmerTransferBags = farmerTransferRows.reduce((s, r) => s + r.rowTotal, 0);

  const receiptIncomingByVariety = groupByVariety
    ? groupIncomingByVariety(incoming.filter((e) => e.type === 'RECEIPT'))
    : null;
  const transferIncomingByVariety = groupByVariety
    ? groupIncomingByVariety(incoming.filter((e) => e.type === 'Incoming-transfer'))
    : null;
  const outgoingByVariety = groupByVariety ? groupOutgoingByVariety(outgoing) : null;
  const varietyKeys = groupByVariety
    ? [
        ...new Set([
          ...Object.keys(receiptIncomingByVariety ?? {}),
          ...Object.keys(outgoingByVariety ?? {}),
          ...Object.keys(transferIncomingByVariety ?? {}),
        ]),
      ].sort()
    : [];

  const receiptTableCols = showSpecialFields
    ? ['DATE', 'VOUCHER', 'VARIETY', 'CUSTOM MARKA', ...sizeColumns, 'TOTAL', 'REMARKS']
    : ['DATE', 'VOUCHER', 'VARIETY', ...sizeColumns, 'TOTAL', 'G.TOTAL', 'REMARKS'];
  const deliveryTableCols = showSpecialFields
    ? ['DATE', 'VOUCHER', 'VARIETY', 'CUSTOM MARKA', ...sizeColumns, 'TOTAL']
    : ['DATE', 'VOUCHER', 'VARIETY', ...sizeColumns, 'TOTAL', 'G.TOTAL'];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.companyName}>{companyName}</Text>
          <Text style={styles.reportTitle}>FARMER ACCOUNT LEDGER</Text>
        </View>

        {/* Farmer Info */}
        <View style={styles.farmerInfo}>
          <View style={styles.farmerInfoCol}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>A/c No.:</Text>
              <Text style={styles.infoValue}>
                {String(farmer.accountNumber)}
              </Text>
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
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Report Date:</Text>
              <Text style={styles.infoValue}>{reportDate}</Text>
            </View>
          </View>
        </View>

        {/* Receipt Table(s) */}
        <View style={styles.ledgerContainer}>
          {useOwnershipFilter ? (
            <>
              {showOwnedSection && (
                <>
              <Text style={styles.ledgerTitle}>Receipt Details (OWNED)</Text>
              <View style={styles.table}>
                <View style={styles.tableHeaderRow}>
                  {receiptTableCols.map((col, i) => (
                    <Text
                      key={col}
                      style={[
                        styles.cell,
                        ...(col === 'VARIETY' ? [styles.cellLeft] : []),
                        ...(i === receiptTableCols.length - 1 ? [styles.cellLast] : []),
                        ...(col === 'TOTAL' ? [styles.cellTotal] : []),
                        ...(col === 'G.TOTAL' ? [styles.cellGTotal] : []),
                        ...(col === 'REMARKS' ? [styles.cellRemarks] : []),
                        ...(col === 'CUSTOM MARKA' ? [styles.cellLeft] : []),
                        {
                          width:
                            col === 'VARIETY' ? '14%' : col === 'DATE' ? '10%' : col === 'VOUCHER' ? '8%' : col === 'CUSTOM MARKA' ? '10%' : col === 'TOTAL' || col === 'G.TOTAL' ? '8%' : col === 'REMARKS' ? '8%' : '8%',
                        },
                      ]}
                    >
                      {col}
                    </Text>
                  ))}
                </View>
                {ownedReceiptRows.map((r, idx) => (
                  <View key={`owned-${r.date}-${r.voucher}-${idx}`} style={styles.tableRow}>
                    <Text style={[styles.cell, { width: '10%' }]}>{r.date}</Text>
                    <Text style={[styles.cell, { width: '8%' }]}>{r.voucher}</Text>
                    <Text style={[styles.cellLeft, { width: '14%' }]}>{r.variety}</Text>
                    {showSpecialFields && (
                      <Text style={[styles.cellLeft, { width: '10%' }]}>{r.customMarka}</Text>
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
                      <Text style={[styles.cell, styles.cellGTotal, { width: '8%' }]}>
                        {r.runningTotal}
                      </Text>
                    )}
                    <Text style={[styles.cell, styles.cellRemarks, styles.cellLast, { width: '8%' }]}>
                      {r.remarks}
                    </Text>
                  </View>
                ))}
                {ownedReceiptRows.length > 0 && (
                  <View style={[styles.tableRow, styles.rowTotals]}>
                    <Text style={[styles.cell, { width: '10%' }]}>TOTAL</Text>
                    <Text style={[styles.cell, { width: '8%' }]}>-</Text>
                    <Text style={[styles.cellLeft, { width: '14%' }]}>-</Text>
                    {showSpecialFields && (
                      <Text style={[styles.cellLeft, { width: '10%' }]}>-</Text>
                    )}
                    {sizeColumns.map((col) => (
                      <Text key={col} style={[styles.cell, { width: '8%' }]}>
                        {ownedTotalsBySize[col] ?? 0}
                      </Text>
                    ))}
                    <Text style={[styles.cell, styles.cellTotal, { width: '8%' }]}>{totalOwned}</Text>
                    {!showSpecialFields && (
                      <Text style={[styles.cell, styles.cellGTotal, { width: '8%' }]}>
                        {totalOwned}
                      </Text>
                    )}
                    <Text style={[styles.cell, styles.cellRemarks, styles.cellLast, { width: '8%' }]}>-</Text>
                  </View>
                )}
              </View>
              {ownedTransferRows.length > 0 && (
                <>
                  <Text style={styles.ledgerSubsectionTitle}>
                    Purchases from other farmers (incoming transfer) — OWNED
                  </Text>
                  <View style={styles.table}>
                    <View style={styles.tableHeaderRow}>
                      {receiptTableCols.map((col, i) => (
                        <Text
                          key={col}
                          style={[
                            styles.cell,
                            ...(col === 'VARIETY' ? [styles.cellLeft] : []),
                            ...(i === receiptTableCols.length - 1 ? [styles.cellLast] : []),
                            ...(col === 'TOTAL' ? [styles.cellTotal] : []),
                            ...(col === 'G.TOTAL' ? [styles.cellGTotal] : []),
                            ...(col === 'REMARKS' ? [styles.cellRemarks] : []),
                            ...(col === 'CUSTOM MARKA' ? [styles.cellLeft] : []),
                            {
                              width:
                                col === 'VARIETY' ? '14%' : col === 'DATE' ? '10%' : col === 'VOUCHER' ? '8%' : col === 'CUSTOM MARKA' ? '10%' : col === 'TOTAL' || col === 'G.TOTAL' ? '8%' : col === 'REMARKS' ? '8%' : '8%',
                            },
                          ]}
                        >
                          {col}
                        </Text>
                      ))}
                    </View>
                    {ownedTransferRows.map((r, idx) => (
                      <View key={`owned-it-${r.date}-${r.voucher}-${idx}`} style={styles.tableRow}>
                        <Text style={[styles.cell, { width: '10%' }]}>{r.date}</Text>
                        <Text style={[styles.cell, { width: '8%' }]}>{r.voucher}</Text>
                        <Text style={[styles.cellLeft, { width: '14%' }]}>{r.variety}</Text>
                        {showSpecialFields && (
                          <Text style={[styles.cellLeft, { width: '10%' }]}>{r.customMarka}</Text>
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
                          <Text style={[styles.cell, styles.cellGTotal, { width: '8%' }]}>
                            {r.runningTotal}
                          </Text>
                        )}
                        <Text style={[styles.cell, styles.cellRemarks, styles.cellLast, { width: '8%' }]}>
                          {r.remarks}
                        </Text>
                      </View>
                    ))}
                    {ownedTransferRows.length > 0 && (
                      <View style={[styles.tableRow, styles.rowTotals]}>
                        <Text style={[styles.cell, { width: '10%' }]}>TOTAL</Text>
                        <Text style={[styles.cell, { width: '8%' }]}>-</Text>
                        <Text style={[styles.cellLeft, { width: '14%' }]}>-</Text>
                        {showSpecialFields && (
                          <Text style={[styles.cellLeft, { width: '10%' }]}>-</Text>
                        )}
                        {sizeColumns.map((col) => (
                          <Text key={col} style={[styles.cell, { width: '8%' }]}>
                            {ownedTransferTotalsBySize[col] ?? 0}
                          </Text>
                        ))}
                        <Text style={[styles.cell, styles.cellTotal, { width: '8%' }]}>
                          {totalOwnedTransferBags}
                        </Text>
                        {!showSpecialFields && (
                          <Text style={[styles.cell, styles.cellGTotal, { width: '8%' }]}>
                            {totalOwned + totalOwnedTransferBags}
                          </Text>
                        )}
                        <Text style={[styles.cell, styles.cellRemarks, styles.cellLast, { width: '8%' }]}>-</Text>
                      </View>
                    )}
                  </View>
                </>
              )}
                </>
              )}
              {showFarmerSection && (
                <>
              <Text style={styles.ledgerTitle}>Receipt Details (FARMER)</Text>
              <View style={styles.table}>
                <View style={styles.tableHeaderRow}>
                  {receiptTableCols.map((col, i) => (
                    <Text
                      key={col}
                      style={[
                        styles.cell,
                        ...(col === 'VARIETY' ? [styles.cellLeft] : []),
                        ...(i === receiptTableCols.length - 1 ? [styles.cellLast] : []),
                        ...(col === 'TOTAL' ? [styles.cellTotal] : []),
                        ...(col === 'G.TOTAL' ? [styles.cellGTotal] : []),
                        ...(col === 'REMARKS' ? [styles.cellRemarks] : []),
                        ...(col === 'CUSTOM MARKA' ? [styles.cellLeft] : []),
                        {
                          width:
                            col === 'VARIETY' ? '14%' : col === 'DATE' ? '10%' : col === 'VOUCHER' ? '8%' : col === 'CUSTOM MARKA' ? '10%' : col === 'TOTAL' || col === 'G.TOTAL' ? '8%' : col === 'REMARKS' ? '8%' : '8%',
                        },
                      ]}
                    >
                      {col}
                    </Text>
                  ))}
                </View>
                {farmerReceiptRows.map((r, idx) => (
                  <View key={`farmer-${r.date}-${r.voucher}-${idx}`} style={styles.tableRow}>
                    <Text style={[styles.cell, { width: '10%' }]}>{r.date}</Text>
                    <Text style={[styles.cell, { width: '8%' }]}>{r.voucher}</Text>
                    <Text style={[styles.cellLeft, { width: '14%' }]}>{r.variety}</Text>
                    {showSpecialFields && (
                      <Text style={[styles.cellLeft, { width: '10%' }]}>{r.customMarka}</Text>
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
                      <Text style={[styles.cell, styles.cellGTotal, { width: '8%' }]}>
                        {r.runningTotal}
                      </Text>
                    )}
                    <Text style={[styles.cell, styles.cellRemarks, styles.cellLast, { width: '8%' }]}>
                      {r.remarks}
                    </Text>
                  </View>
                ))}
                {farmerReceiptRows.length > 0 && (
                  <View style={[styles.tableRow, styles.rowTotals]}>
                    <Text style={[styles.cell, { width: '10%' }]}>TOTAL</Text>
                    <Text style={[styles.cell, { width: '8%' }]}>-</Text>
                    <Text style={[styles.cellLeft, { width: '14%' }]}>-</Text>
                    {showSpecialFields && (
                      <Text style={[styles.cellLeft, { width: '10%' }]}>-</Text>
                    )}
                    {sizeColumns.map((col) => (
                      <Text key={col} style={[styles.cell, { width: '8%' }]}>
                        {farmerTotalsBySize[col] ?? 0}
                      </Text>
                    ))}
                    <Text style={[styles.cell, styles.cellTotal, { width: '8%' }]}>{totalFarmer}</Text>
                    {!showSpecialFields && (
                      <Text style={[styles.cell, styles.cellGTotal, { width: '8%' }]}>
                        {totalFarmer}
                      </Text>
                    )}
                    <Text style={[styles.cell, styles.cellRemarks, styles.cellLast, { width: '8%' }]}>-</Text>
                  </View>
                )}
              </View>
              {farmerTransferRows.length > 0 && (
                <>
                  <Text style={styles.ledgerSubsectionTitle}>
                    Purchases from other farmers (incoming transfer) — FARMER
                  </Text>
                  <View style={styles.table}>
                    <View style={styles.tableHeaderRow}>
                      {receiptTableCols.map((col, i) => (
                        <Text
                          key={col}
                          style={[
                            styles.cell,
                            ...(col === 'VARIETY' ? [styles.cellLeft] : []),
                            ...(i === receiptTableCols.length - 1 ? [styles.cellLast] : []),
                            ...(col === 'TOTAL' ? [styles.cellTotal] : []),
                            ...(col === 'G.TOTAL' ? [styles.cellGTotal] : []),
                            ...(col === 'REMARKS' ? [styles.cellRemarks] : []),
                            ...(col === 'CUSTOM MARKA' ? [styles.cellLeft] : []),
                            {
                              width:
                                col === 'VARIETY' ? '14%' : col === 'DATE' ? '10%' : col === 'VOUCHER' ? '8%' : col === 'CUSTOM MARKA' ? '10%' : col === 'TOTAL' || col === 'G.TOTAL' ? '8%' : col === 'REMARKS' ? '8%' : '8%',
                            },
                          ]}
                        >
                          {col}
                        </Text>
                      ))}
                    </View>
                    {farmerTransferRows.map((r, idx) => (
                      <View key={`farmer-it-${r.date}-${r.voucher}-${idx}`} style={styles.tableRow}>
                        <Text style={[styles.cell, { width: '10%' }]}>{r.date}</Text>
                        <Text style={[styles.cell, { width: '8%' }]}>{r.voucher}</Text>
                        <Text style={[styles.cellLeft, { width: '14%' }]}>{r.variety}</Text>
                        {showSpecialFields && (
                          <Text style={[styles.cellLeft, { width: '10%' }]}>{r.customMarka}</Text>
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
                          <Text style={[styles.cell, styles.cellGTotal, { width: '8%' }]}>
                            {r.runningTotal}
                          </Text>
                        )}
                        <Text style={[styles.cell, styles.cellRemarks, styles.cellLast, { width: '8%' }]}>
                          {r.remarks}
                        </Text>
                      </View>
                    ))}
                    {farmerTransferRows.length > 0 && (
                      <View style={[styles.tableRow, styles.rowTotals]}>
                        <Text style={[styles.cell, { width: '10%' }]}>TOTAL</Text>
                        <Text style={[styles.cell, { width: '8%' }]}>-</Text>
                        <Text style={[styles.cellLeft, { width: '14%' }]}>-</Text>
                        {showSpecialFields && (
                          <Text style={[styles.cellLeft, { width: '10%' }]}>-</Text>
                        )}
                        {sizeColumns.map((col) => (
                          <Text key={col} style={[styles.cell, { width: '8%' }]}>
                            {farmerTransferTotalsBySize[col] ?? 0}
                          </Text>
                        ))}
                        <Text style={[styles.cell, styles.cellTotal, { width: '8%' }]}>
                          {totalFarmerTransferBags}
                        </Text>
                        {!showSpecialFields && (
                          <Text style={[styles.cell, styles.cellGTotal, { width: '8%' }]}>
                            {totalFarmer + totalFarmerTransferBags}
                          </Text>
                        )}
                        <Text style={[styles.cell, styles.cellRemarks, styles.cellLast, { width: '8%' }]}>-</Text>
                      </View>
                    )}
                  </View>
                </>
              )}
                </>
              )}
            </>
          ) : (
            <>
              <Text style={styles.ledgerTitle}>Receipt Details</Text>
              {groupByVariety && varietyKeys.length > 0 ? (
            <>
            {varietyKeys.map((varietyName) => {
              const varietyIncoming = receiptIncomingByVariety?.[varietyName] ?? [];
              if (varietyIncoming.length === 0) return null;
              const startRun = varietyKeys
                .slice(0, varietyKeys.indexOf(varietyName))
                .reduce(
                  (sum, v) =>
                    sum +
                    (receiptIncomingByVariety?.[v] ?? []).reduce(
                      (s, e) =>
                        s +
                        (e.bagSizes ?? []).reduce(
                          (a, b) => a + (b.initialQuantity ?? 0),
                          0
                        ),
                      0
                    ),
                  0
                );
              const rows = buildReceiptRows(
                varietyIncoming,
                sizeColumns,
                startRun
              );
              const varietyTotal = rows.reduce((s, r) => s + r.rowTotal, 0);
              const totalsBySize = sizeColumns.reduce(
                (acc, col) => ({
                  ...acc,
                  [col]: rows.reduce(
                    (s, r) =>
                      s + (r.sizeQtys[col] ?? []).reduce((a, x) => a + x.qty, 0),
                    0
                  ),
                }),
                {} as Record<string, number>
              );
              return (
                <View key={varietyName}>
                  <Text style={styles.varietySubtitle}>
                    Variety: {varietyName}
                  </Text>
                  <View style={styles.table}>
                    <View style={styles.tableHeaderRow}>
                      {receiptTableCols.map((col, i) => (
                        <Text
                          key={col}
                          style={[
                            styles.cell,
                            ...(col === 'VARIETY' ? [styles.cellLeft] : []),
                            ...(i === receiptTableCols.length - 1 ? [styles.cellLast] : []),
                            ...(col === 'TOTAL' ? [styles.cellTotal] : []),
                            ...(col === 'G.TOTAL' ? [styles.cellGTotal] : []),
                            ...(col === 'REMARKS' ? [styles.cellRemarks] : []),
                            ...(col === 'CUSTOM MARKA' ? [styles.cellLeft] : []),
                            {
                              width:
                                col === 'VARIETY' ? '14%' : col === 'DATE' ? '10%' : col === 'VOUCHER' ? '8%' : col === 'CUSTOM MARKA' ? '10%' : col === 'TOTAL' || col === 'G.TOTAL' ? '8%' : col === 'REMARKS' ? '8%' : '8%',
                            },
                          ]}
                        >
                          {col}
                        </Text>
                      ))}
                    </View>
                    {rows.map((r, idx) => (
                      <View
                        key={`${varietyName}-${r.date}-${r.voucher}-${idx}`}
                        style={styles.tableRow}
                      >
                        <Text style={[styles.cell, { width: '10%' }]}>{r.date}</Text>
                        <Text style={[styles.cell, { width: '8%' }]}>{r.voucher}</Text>
                        <Text style={[styles.cellLeft, { width: '14%' }]}>{r.variety}</Text>
                        {showSpecialFields && (
                          <Text style={[styles.cellLeft, { width: '10%' }]}>{r.customMarka}</Text>
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
                          <Text style={[styles.cell, styles.cellGTotal, { width: '8%' }]}>
                            {r.runningTotal}
                          </Text>
                        )}
                        <Text style={[styles.cell, styles.cellRemarks, styles.cellLast, { width: '8%' }]}>
                          {r.remarks}
                        </Text>
                      </View>
                    ))}
                    <View style={[styles.tableRow, styles.rowTotals]}>
                      <Text style={[styles.cell, { width: '10%' }]}>Subtotal</Text>
                      <Text style={[styles.cell, { width: '8%' }]}>-</Text>
                      <Text style={[styles.cellLeft, { width: '14%' }]}>-</Text>
                      {showSpecialFields && (
                        <Text style={[styles.cellLeft, { width: '10%' }]}>-</Text>
                      )}
                      {sizeColumns.map((col) => (
                        <Text key={col} style={[styles.cell, { width: '8%' }]}>
                          {totalsBySize[col] ?? 0}
                        </Text>
                      ))}
                      <Text style={[styles.cell, styles.cellTotal, { width: '8%' }]}>
                        {varietyTotal}
                      </Text>
                      {!showSpecialFields && (
                        <Text style={[styles.cell, styles.cellGTotal, { width: '8%' }]}>
                          {rows.length > 0 ? rows[rows.length - 1].runningTotal : 0}
                        </Text>
                      )}
                      <Text style={[styles.cell, styles.cellRemarks, styles.cellLast, { width: '8%' }]}>
                        -
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })}
            {incomingTransferTxCount > 0 && (
              <>
                <Text style={styles.ledgerSubsectionTitle}>
                  Purchases from other farmers (incoming transfer)
                </Text>
                {varietyKeys.map((varietyName) => {
                  const varietyTransfer = transferIncomingByVariety?.[varietyName] ?? [];
                  if (varietyTransfer.length === 0) return null;
                  const startRun =
                    totalFarmReceived +
                    varietyKeys
                      .slice(0, varietyKeys.indexOf(varietyName))
                      .reduce(
                        (sum, v) =>
                          sum +
                          (transferIncomingByVariety?.[v] ?? []).reduce(
                            (s, e) =>
                              s +
                              (e.bagSizes ?? []).reduce(
                                (a, b) => a + (b.initialQuantity ?? 0),
                                0
                              ),
                            0
                          ),
                        0
                      );
                  const rows = buildIncomingTransferRows(
                    varietyTransfer,
                    sizeColumns,
                    startRun
                  );
                  const varietyTotal = rows.reduce((s, r) => s + r.rowTotal, 0);
                  const totalsBySize = sizeColumns.reduce(
                    (acc, col) => ({
                      ...acc,
                      [col]: rows.reduce(
                        (s, r) =>
                          s + (r.sizeQtys[col] ?? []).reduce((a, x) => a + x.qty, 0),
                        0
                      ),
                    }),
                    {} as Record<string, number>
                  );
                  return (
                    <View key={`transfer-${varietyName}`}>
                      <Text style={styles.varietySubtitle}>
                        Variety: {varietyName}
                      </Text>
                      <View style={styles.table}>
                        <View style={styles.tableHeaderRow}>
                          {receiptTableCols.map((col, i) => (
                            <Text
                              key={col}
                              style={[
                                styles.cell,
                                ...(col === 'VARIETY' ? [styles.cellLeft] : []),
                                ...(i === receiptTableCols.length - 1 ? [styles.cellLast] : []),
                                ...(col === 'TOTAL' ? [styles.cellTotal] : []),
                                ...(col === 'G.TOTAL' ? [styles.cellGTotal] : []),
                                ...(col === 'REMARKS' ? [styles.cellRemarks] : []),
                                ...(col === 'CUSTOM MARKA' ? [styles.cellLeft] : []),
                                {
                                  width:
                                    col === 'VARIETY' ? '14%' : col === 'DATE' ? '10%' : col === 'VOUCHER' ? '8%' : col === 'CUSTOM MARKA' ? '10%' : col === 'TOTAL' || col === 'G.TOTAL' ? '8%' : col === 'REMARKS' ? '8%' : '8%',
                                },
                              ]}
                            >
                              {col}
                            </Text>
                          ))}
                        </View>
                        {rows.map((r, idx) => (
                          <View
                            key={`transfer-${varietyName}-${r.date}-${r.voucher}-${idx}`}
                            style={styles.tableRow}
                          >
                            <Text style={[styles.cell, { width: '10%' }]}>{r.date}</Text>
                            <Text style={[styles.cell, { width: '8%' }]}>{r.voucher}</Text>
                            <Text style={[styles.cellLeft, { width: '14%' }]}>{r.variety}</Text>
                            {showSpecialFields && (
                              <Text style={[styles.cellLeft, { width: '10%' }]}>{r.customMarka}</Text>
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
                              <Text style={[styles.cell, styles.cellGTotal, { width: '8%' }]}>
                                {r.runningTotal}
                              </Text>
                            )}
                            <Text style={[styles.cell, styles.cellRemarks, styles.cellLast, { width: '8%' }]}>
                              {r.remarks}
                            </Text>
                          </View>
                        ))}
                        <View style={[styles.tableRow, styles.rowTotals]}>
                          <Text style={[styles.cell, { width: '10%' }]}>Subtotal</Text>
                          <Text style={[styles.cell, { width: '8%' }]}>-</Text>
                          <Text style={[styles.cellLeft, { width: '14%' }]}>-</Text>
                          {showSpecialFields && (
                            <Text style={[styles.cellLeft, { width: '10%' }]}>-</Text>
                          )}
                          {sizeColumns.map((col) => (
                            <Text key={col} style={[styles.cell, { width: '8%' }]}>
                              {totalsBySize[col] ?? 0}
                            </Text>
                          ))}
                          <Text style={[styles.cell, styles.cellTotal, { width: '8%' }]}>
                            {varietyTotal}
                          </Text>
                          {!showSpecialFields && (
                            <Text style={[styles.cell, styles.cellGTotal, { width: '8%' }]}>
                              {rows.length > 0 ? rows[rows.length - 1].runningTotal : 0}
                            </Text>
                          )}
                          <Text style={[styles.cell, styles.cellRemarks, styles.cellLast, { width: '8%' }]}>
                            -
                          </Text>
                        </View>
                      </View>
                    </View>
                  );
                })}
              </>
            )}
            </>
          ) : (
            <>
            <View style={styles.table}>
              <View style={styles.tableHeaderRow}>
                {receiptTableCols.map((col, i) => (
                  <Text
                    key={col}
                    style={[
                      styles.cell,
                      ...(col === 'VARIETY' ? [styles.cellLeft] : []),
                      ...(i === receiptTableCols.length - 1 ? [styles.cellLast] : []),
                      ...(col === 'TOTAL' ? [styles.cellTotal] : []),
                      ...(col === 'G.TOTAL' ? [styles.cellGTotal] : []),
                      ...(col === 'REMARKS' ? [styles.cellRemarks] : []),
                      ...(col === 'CUSTOM MARKA' ? [styles.cellLeft] : []),
                      {
                        width:
                          col === 'VARIETY' ? '14%' : col === 'DATE' ? '10%' : col === 'VOUCHER' ? '8%' : col === 'CUSTOM MARKA' ? '10%' : col === 'TOTAL' || col === 'G.TOTAL' ? '8%' : col === 'REMARKS' ? '8%' : '8%',
                      },
                    ]}
                  >
                    {col}
                  </Text>
                ))}
              </View>
              {receiptRows.map((r, idx) => (
                <View
                  key={`${r.date}-${r.voucher}-${idx}`}
                  style={styles.tableRow}
                >
                  <Text style={[styles.cell, { width: '10%' }]}>{r.date}</Text>
                  <Text style={[styles.cell, { width: '8%' }]}>{r.voucher}</Text>
                  <Text style={[styles.cellLeft, { width: '14%' }]}>{r.variety}</Text>
                  {showSpecialFields && (
                    <Text style={[styles.cellLeft, { width: '10%' }]}>{r.customMarka}</Text>
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
                    <Text style={[styles.cell, styles.cellGTotal, { width: '8%' }]}>
                      {r.runningTotal}
                    </Text>
                  )}
                  <Text style={[styles.cell, styles.cellRemarks, styles.cellLast, { width: '8%' }]}>
                    {r.remarks}
                  </Text>
                </View>
              ))}
              {receiptRows.length > 0 && (
                <View style={[styles.tableRow, styles.rowTotals]}>
                  <Text style={[styles.cell, { width: '10%' }]}>TOTAL</Text>
                  <Text style={[styles.cell, { width: '8%' }]}>-</Text>
                  <Text style={[styles.cellLeft, { width: '14%' }]}>-</Text>
                  {showSpecialFields && (
                    <Text style={[styles.cellLeft, { width: '10%' }]}>-</Text>
                  )}
                  {sizeColumns.map((col) => (
                    <Text key={col} style={[styles.cell, { width: '8%' }]}>
                      {farmReceiptTotalsBySize[col] ?? 0}
                    </Text>
                  ))}
                  <Text style={[styles.cell, styles.cellTotal, { width: '8%' }]}>
                    {totalFarmReceived}
                  </Text>
                  {!showSpecialFields && (
                    <Text style={[styles.cell, styles.cellGTotal, { width: '8%' }]}>
                      {totalFarmReceived}
                    </Text>
                  )}
                  <Text style={[styles.cell, styles.cellRemarks, styles.cellLast, { width: '8%' }]}>
                    -
                  </Text>
                </View>
              )}
            </View>
            {incomingTransferTxCount > 0 && (
              <>
                <Text style={styles.ledgerSubsectionTitle}>
                  Purchases from other farmers (incoming transfer)
                </Text>
                <View style={styles.table}>
                  <View style={styles.tableHeaderRow}>
                    {receiptTableCols.map((col, i) => (
                      <Text
                        key={col}
                        style={[
                          styles.cell,
                          ...(col === 'VARIETY' ? [styles.cellLeft] : []),
                          ...(i === receiptTableCols.length - 1 ? [styles.cellLast] : []),
                          ...(col === 'TOTAL' ? [styles.cellTotal] : []),
                          ...(col === 'G.TOTAL' ? [styles.cellGTotal] : []),
                          ...(col === 'REMARKS' ? [styles.cellRemarks] : []),
                          ...(col === 'CUSTOM MARKA' ? [styles.cellLeft] : []),
                          {
                            width:
                              col === 'VARIETY' ? '14%' : col === 'DATE' ? '10%' : col === 'VOUCHER' ? '8%' : col === 'CUSTOM MARKA' ? '10%' : col === 'TOTAL' || col === 'G.TOTAL' ? '8%' : col === 'REMARKS' ? '8%' : '8%',
                          },
                        ]}
                      >
                        {col}
                      </Text>
                    ))}
                  </View>
                  {incomingTransferRows.map((r, idx) => (
                    <View
                      key={`it-${r.date}-${r.voucher}-${idx}`}
                      style={styles.tableRow}
                    >
                      <Text style={[styles.cell, { width: '10%' }]}>{r.date}</Text>
                      <Text style={[styles.cell, { width: '8%' }]}>{r.voucher}</Text>
                      <Text style={[styles.cellLeft, { width: '14%' }]}>{r.variety}</Text>
                      {showSpecialFields && (
                        <Text style={[styles.cellLeft, { width: '10%' }]}>{r.customMarka}</Text>
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
                        <Text style={[styles.cell, styles.cellGTotal, { width: '8%' }]}>
                          {r.runningTotal}
                        </Text>
                      )}
                      <Text style={[styles.cell, styles.cellRemarks, styles.cellLast, { width: '8%' }]}>
                        {r.remarks}
                      </Text>
                    </View>
                  ))}
                  <View style={[styles.tableRow, styles.rowTotals]}>
                    <Text style={[styles.cell, { width: '10%' }]}>TOTAL</Text>
                    <Text style={[styles.cell, { width: '8%' }]}>-</Text>
                    <Text style={[styles.cellLeft, { width: '14%' }]}>-</Text>
                    {showSpecialFields && (
                      <Text style={[styles.cellLeft, { width: '10%' }]}>-</Text>
                    )}
                    {sizeColumns.map((col) => (
                      <Text key={col} style={[styles.cell, { width: '8%' }]}>
                        {incomingTransferTotalsBySize[col] ?? 0}
                      </Text>
                    ))}
                    <Text style={[styles.cell, styles.cellTotal, { width: '8%' }]}>
                      {totalIncomingTransferBags}
                    </Text>
                    {!showSpecialFields && (
                      <Text style={[styles.cell, styles.cellGTotal, { width: '8%' }]}>
                        {totalReceived}
                      </Text>
                    )}
                    <Text style={[styles.cell, styles.cellRemarks, styles.cellLast, { width: '8%' }]}>
                      -
                    </Text>
                  </View>
                </View>
              </>
            )}
            </>
          )}
          </>
        )}
        </View>

        {/* Delivery Table(s) */}
        <View style={styles.ledgerContainer}>
          <Text style={styles.ledgerTitle}>Delivery Details</Text>
          {groupByVariety && varietyKeys.length > 0 ? (
            <>
              {openingTotal > 0 && (
                <View style={styles.table}>
                  <View style={[styles.tableRow, styles.rowBalance]}>
                    <Text style={[styles.cell, { width: '10%' }]}>OPENING</Text>
                    <Text style={[styles.cell, { width: '8%' }]}>BALANCE</Text>
                    <Text style={[styles.cellLeft, { width: '14%' }]}>-</Text>
                    {showSpecialFields && (
                      <Text style={[styles.cellLeft, { width: '10%' }]}>-</Text>
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
                </View>
              )}
              {varietyKeys.map((varietyName) => {
                const varietyOutgoing = outgoingByVariety?.[varietyName] ?? [];
                if (varietyOutgoing.length === 0) return null;
                const runningTotalBefore = openingTotal - varietyKeys
                  .slice(0, varietyKeys.indexOf(varietyName))
                  .reduce(
                    (sum, v) =>
                      sum +
                      (outgoingByVariety?.[v] ?? []).reduce(
                        (s, e) => s + totalBagsOutgoing(e),
                        0
                      ),
                    0
                  );
                const rows = buildDeliveryRows(
                  varietyOutgoing,
                  sizeColumns,
                  runningTotalBefore
                );
                const varietyDelivered = rows.reduce((s, r) => s + r.rowTotal, 0);
                return (
                  <View key={varietyName}>
                    <Text style={styles.varietySubtitle}>
                      Variety: {varietyName}
                    </Text>
                    <View style={styles.table}>
                      <View style={styles.tableHeaderRow}>
                        {deliveryTableCols.map((col, i) => (
                          <Text
                            key={col}
                            style={[
                              styles.cell,
                              ...(col === 'VARIETY' ? [styles.cellLeft] : []),
                              ...(i === deliveryTableCols.length - 1 ? [styles.cellLast] : []),
                              ...(col === 'TOTAL' ? [styles.cellTotal] : []),
                              ...(col === 'G.TOTAL' ? [styles.cellGTotal] : []),
                              ...(col === 'CUSTOM MARKA' ? [styles.cellLeft] : []),
                              {
                                width:
                                  col === 'VARIETY' ? '14%' : col === 'DATE' ? '10%' : col === 'VOUCHER' ? '8%' : col === 'CUSTOM MARKA' ? '10%' : col === 'TOTAL' || col === 'G.TOTAL' ? '8%' : '8%',
                              },
                            ]}
                          >
                            {col}
                          </Text>
                        ))}
                      </View>
                      {rows.map((r, idx) => (
                        <View
                          key={`${varietyName}-${r.date}-${r.voucher}-${idx}`}
                          style={styles.tableRow}
                        >
                          <Text style={[styles.cell, { width: '10%' }]}>{r.date}</Text>
                          <Text style={[styles.cell, { width: '8%' }]}>{r.voucher}</Text>
                          <Text style={[styles.cellLeft, { width: '14%' }]}>{r.variety}</Text>
                          {showSpecialFields && (
                            <Text style={[styles.cellLeft, { width: '10%' }]}>{r.customMarka}</Text>
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
                      <View style={[styles.tableRow, styles.rowTotals]}>
                        <Text style={[styles.cell, { width: '10%' }]}>Subtotal</Text>
                        <Text style={[styles.cell, { width: '8%' }]}>-</Text>
                        <Text style={[styles.cellLeft, { width: '14%' }]}>-</Text>
                        {showSpecialFields && (
                          <Text style={[styles.cellLeft, { width: '10%' }]}>-</Text>
                        )}
                        {sizeColumns.map((col) => (
                          <Text key={col} style={[styles.cell, { width: '8%' }]}>
                            {rows.reduce(
                              (s, r) =>
                                s + (r.sizeQtys[col] ?? []).reduce((a, x) => a + x.qty, 0),
                              0
                            )}
                          </Text>
                        ))}
                        <Text style={[styles.cell, styles.cellTotal, showSpecialFields ? styles.cellLast : {}, { width: '8%' }]}>
                          {varietyDelivered}
                        </Text>
                        {!showSpecialFields && (
                          <Text style={[styles.cell, styles.cellGTotal, styles.cellLast, { width: '8%' }]}>
                            {rows.length > 0 ? rows[rows.length - 1].runningTotal : runningTotalBefore - varietyDelivered}
                          </Text>
                        )}
                      </View>
                    </View>
                  </View>
                );
              })}
            </>
          ) : (
            <View style={styles.table}>
              <View style={styles.tableHeaderRow}>
                {deliveryTableCols.map((col, i) => (
                  <Text
                    key={col}
                    style={[
                      styles.cell,
                      ...(col === 'VARIETY' ? [styles.cellLeft] : []),
                      ...(i === deliveryTableCols.length - 1 ? [styles.cellLast] : []),
                      ...(col === 'TOTAL' ? [styles.cellTotal] : []),
                      ...(col === 'G.TOTAL' ? [styles.cellGTotal] : []),
                      ...(col === 'CUSTOM MARKA' ? [styles.cellLeft] : []),
                      {
                        width:
                          col === 'VARIETY' ? '14%' : col === 'DATE' ? '10%' : col === 'VOUCHER' ? '8%' : col === 'CUSTOM MARKA' ? '10%' : col === 'TOTAL' || col === 'G.TOTAL' ? '8%' : '8%',
                      },
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
                    <Text style={[styles.cellLeft, { width: '10%' }]}>-</Text>
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
                    <Text style={[styles.cellLeft, { width: '10%' }]}>{r.customMarka}</Text>
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
          )}
        </View>

        {/* Summary */}
        <View style={styles.summary}>
          <Text style={styles.summaryTitle}>Account Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Farm receipt transactions (own deposit):</Text>
            <Text style={styles.summaryValue}>{farmReceiptTxCount}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>
              Purchases from other farmers (incoming transfer):
            </Text>
            <Text style={styles.summaryValue}>{incomingTransferTxCount}</Text>
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

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerLeft}>
            <Text style={{ fontSize: 7 }}>
              Authorized Signature: ____________________
            </Text>
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
            <Text style={{ fontSize: 7 }}>Date: {reportDate}</Text>
          </View>
        </View>

        <Text style={styles.pageNumber}>Page 1</Text>
      </Page>
    </Document>
  );
}
