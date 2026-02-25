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

function buildReceiptRows(
  incoming: DaybookEntry[],
  sizeColumns: string[]
): ReceiptRow[] {
  const rows: ReceiptRow[] = [];
  let runningTotal = 0;
  const sorted = [...incoming].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

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

function buildDeliveryRows(
  outgoing: DaybookEntry[],
  sizeColumns: string[],
  openingTotal: number
): DeliveryRow[] {
  const rows: DeliveryRow[] = [];
  let runningTotal = openingTotal;
  const sorted = [...outgoing].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  for (const entry of sorted) {
    if (entry.type !== 'DELIVERY') continue;
    const variety = entry.variety ?? '-';
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

export function FarmerReportPdf({
  companyName,
  farmer,
  storeAdmin,
  reportDate,
  incoming,
  outgoing,
  sizeColumns,
}: FarmerReportPdfProps) {
  const showSpecialFields = shouldShowSpecialFields(storeAdmin?.mobileNumber);

  const receiptRows = buildReceiptRows(incoming, sizeColumns);
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
  const openingTotal = totalReceived;
  const deliveryRows = buildDeliveryRows(outgoing, sizeColumns, openingTotal);
  const totalDelivered = outgoing.reduce((s, e) => s + totalBagsOutgoing(e), 0);
  const closingBalance = openingTotal - totalDelivered;

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

        {/* Receipt Table */}
        <View style={styles.ledgerContainer}>
          <Text style={styles.ledgerTitle}>Receipt Details</Text>
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
                    {receiptTotalsBySize[col] ?? 0}
                  </Text>
                ))}
                <Text style={[styles.cell, styles.cellTotal, { width: '8%' }]}>
                  {totalReceived}
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
            )}
          </View>
        </View>

        {/* Delivery Table */}
        <View style={styles.ledgerContainer}>
          <Text style={styles.ledgerTitle}>Delivery Details</Text>
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
        </View>

        {/* Summary */}
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
