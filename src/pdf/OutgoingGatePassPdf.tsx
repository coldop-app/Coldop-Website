import { memo, useMemo } from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from '@react-pdf/renderer';
import type { OutgoingGatePassEntry } from '@/services/store-admin/functions/useGetDaybook';
import { format } from 'date-fns';

/* -------------------------------------------------
   Colors: only OGP # (red) and Manual # (muted) are colored; rest B&W
------------------------------------------------- */
const PRIMARY = '#dc2626';
const MUTED = '#6f6f6f';
const BORDER = '#e5e7eb';
const HEADER_BG = '#f9fafb';
const TEXT = '#111';

export interface ColdStoragePdfProps {
  name: string;
  address: string;
  imageUrl?: string;
}

export interface OutgoingGatePassPdfProps {
  entry: OutgoingGatePassEntry;
  coldStorage: ColdStoragePdfProps | null;
}

function formatVoucherDate(date: string | undefined): string {
  if (!date) return '—';
  return format(new Date(date), 'dd MMM yyyy');
}

function formatNumber(value: number | undefined | null): string {
  if (value == null || Number.isNaN(value)) return '—';
  return value.toLocaleString('en-IN');
}

const styles = StyleSheet.create({
  page: {
    padding: 36,
    paddingBottom: 56,
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderBottomColor: TEXT,
    paddingBottom: 12,
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  headerLogo: {
    width: 56,
    height: 56,
    marginRight: 16,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerStorageName: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: TEXT,
    marginBottom: 4,
  },
  headerStorageAddress: {
    fontSize: 9,
    color: TEXT,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  headerGatePassNo: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: PRIMARY,
    marginBottom: 2,
  },
  headerManualNo: {
    fontSize: 9,
    color: MUTED,
  },
  sectionTitle: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: TEXT,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  detailsGrid: {
    flexDirection: 'row',
    paddingTop: 10,
    marginBottom: 20,
  },
  detailsColumn: {
    flex: 1,
    paddingRight: 24,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: TEXT,
    marginRight: 4,
  },
  detailValue: {
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: TEXT,
    flex: 1,
  },
  table: {
    marginBottom: 20,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 4,
    overflow: 'hidden',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    alignItems: 'center',
    minHeight: 28,
  },
  tableRowHeader: {
    backgroundColor: HEADER_BG,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  tableRowTotal: {
    backgroundColor: HEADER_BG,
    borderTopWidth: 2,
    borderTopColor: TEXT,
    fontFamily: 'Helvetica-Bold',
  },
  tableCell: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 9,
    color: TEXT,
  },
  tableCellRight: {
    textAlign: 'right',
  },
  headerText: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: TEXT,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  totalText: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: TEXT,
  },
  summaryBox: {
    backgroundColor: HEADER_BG,
    borderLeftWidth: 4,
    borderLeftColor: BORDER,
    padding: 12,
    marginBottom: 16,
    flexDirection: 'row',
    gap: 24,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  summaryLabel: {
    fontSize: 10,
    color: TEXT,
  },
  summaryValue: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: TEXT,
  },
  remarksBox: {
    backgroundColor: HEADER_BG,
    padding: 12,
    marginBottom: 16,
    borderRadius: 4,
  },
  remarksText: {
    fontSize: 10,
    color: TEXT,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 12,
    paddingHorizontal: 36,
    borderTopWidth: 1,
    borderTopColor: BORDER,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  footerText: {
    fontSize: 8,
    color: TEXT,
  },
});

/* New format row (incomingGatePassEntries) */
interface BreakdownRowNew {
  size: string;
  variety: string;
  refNo: number | string;
  issuedQty: number;
}

/* Legacy format row (snapshots / orderDetails) */
interface BreakdownRowLegacy {
  size: string;
  variety: string;
  location: string;
  refNo: number;
  initialQty: number;
  issuedQty: number;
  availableQty: number;
}

function useBreakdown(entry: OutgoingGatePassEntry) {
  const orderDetails = entry.orderDetails ?? [];
  const incomingEntries = entry.incomingGatePassEntries ?? [];
  const snapshots = entry.incomingGatePassSnapshots ?? [];

  const breakdownRowsNew = useMemo((): BreakdownRowNew[] => {
    const rows: BreakdownRowNew[] = [];
    for (const ent of incomingEntries) {
      const ref = ent.gatePassNo ?? ent.incomingGatePassId?.slice(-6) ?? '—';
      for (const alloc of ent.allocations ?? []) {
        const size = (alloc.size ?? '').trim();
        if (!size) continue;
        rows.push({
          size,
          variety: ent.variety?.trim() ?? '—',
          refNo: ref,
          issuedQty: alloc.quantityToAllocate ?? 0,
        });
      }
    }
    return rows.sort(
      (a, b) =>
        a.size.localeCompare(b.size) || a.variety.localeCompare(b.variety)
    );
  }, [incomingEntries]);

  const breakdownRowsLegacy = useMemo((): BreakdownRowLegacy[] => {
    const rows: BreakdownRowLegacy[] = [];
    for (const snap of snapshots) {
      const variety = snap.variety?.trim() ?? '—';
      for (const bs of snap.bagSizes ?? []) {
        const size = (bs.name ?? '').trim();
        if (!size) continue;
        const loc = bs.location;
        const locationStr = loc
          ? `${loc.chamber ?? ''}-${loc.floor ?? ''}-${loc.row ?? ''}`.replace(
              /^-+$/,
              ''
            ) || '—'
          : '—';
        const init = bs.initialQuantity ?? 0;
        const current = bs.currentQuantity ?? 0;
        const issued = Math.max(0, init - current);
        rows.push({
          size,
          variety,
          location: locationStr,
          refNo: snap.gatePassNo ?? 0,
          initialQty: init,
          issuedQty: issued,
          availableQty: current,
        });
      }
    }
    return rows.sort(
      (a, b) =>
        a.size.localeCompare(b.size) ||
        a.variety.localeCompare(b.variety) ||
        a.location.localeCompare(b.location)
    );
  }, [snapshots]);

  const useNewFormat = breakdownRowsNew.length > 0;

  const { totalIssued, totalAvailable } = useMemo(() => {
    if (useNewFormat) {
      return {
        totalIssued: breakdownRowsNew.reduce((s, r) => s + r.issuedQty, 0),
        totalAvailable: 0,
      };
    }
    if (breakdownRowsLegacy.length > 0) {
      return {
        totalIssued: breakdownRowsLegacy.reduce((s, r) => s + r.issuedQty, 0),
        totalAvailable: breakdownRowsLegacy.reduce(
          (s, r) => s + r.availableQty,
          0
        ),
      };
    }
    let issued = 0;
    let available = 0;
    for (const od of orderDetails) {
      issued += od.quantityIssued ?? 0;
      available += od.quantityAvailable ?? 0;
    }
    return { totalIssued: issued, totalAvailable: available };
  }, [
    useNewFormat,
    breakdownRowsNew,
    breakdownRowsLegacy,
    orderDetails,
  ]);

  const displayVariety = useMemo(() => {
    if (incomingEntries.length > 0) {
      const varieties = [
        ...new Set(
          incomingEntries
            .map((e) => e.variety?.trim())
            .filter((v): v is string => Boolean(v))
        ),
      ];
      return varieties.length > 0 ? varieties.join(', ') : '—';
    }
    if (snapshots.length > 0) {
      const varieties = [
        ...new Set(
          snapshots
            .map((s) => s.variety?.trim())
            .filter((v): v is string => Boolean(v))
        ),
      ];
      return varieties.length > 0 ? varieties.join(', ') : '—';
    }
    return entry.variety ?? '—';
  }, [entry.variety, snapshots, incomingEntries]);

  return {
    useNewFormat,
    breakdownRowsNew,
    breakdownRowsLegacy,
    orderDetails,
    totalIssued,
    totalAvailable,
    displayVariety,
  };
}

export const OutgoingGatePassPdf = memo(function OutgoingGatePassPdf({
  entry,
  coldStorage,
}: OutgoingGatePassPdfProps) {
  const farmerName = entry.farmerStorageLinkId?.farmerId?.name ?? '—';
  const farmerAccount = entry.farmerStorageLinkId?.accountNumber ?? '—';
  const createdByDisplay = entry.createdBy?.name ?? '—';
  const fromTo =
    entry.from != null || entry.to != null
      ? `${entry.from ?? '—'} → ${entry.to ?? '—'}`
      : '—';

  const {
    useNewFormat: useNewFormatFlag,
    breakdownRowsNew,
    breakdownRowsLegacy,
    orderDetails,
    totalIssued,
    displayVariety,
  } = useBreakdown(entry);

  const newColWidths = ['33%', '33%', '34%'];
  const hasBreakdown =
    breakdownRowsNew.length > 0 ||
    breakdownRowsLegacy.length > 0 ||
    orderDetails.length > 0;

  return (
    <Document title={`OGP #${entry.gatePassNo ?? '—'}`} creator="Coldop">
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          {coldStorage?.imageUrl ? (
            <Image src={coldStorage.imageUrl} style={styles.headerLogo} />
          ) : (
            <View style={[styles.headerLogo, { backgroundColor: HEADER_BG }]} />
          )}
          <View style={styles.headerCenter}>
            <Text style={styles.headerStorageName}>
              {coldStorage?.name ?? 'Cold Storage'}
            </Text>
            <Text style={styles.headerStorageAddress}>
              {coldStorage?.address ?? '—'}
            </Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.headerGatePassNo}>
              OGP #{entry.gatePassNo ?? '—'}
            </Text>
            {entry.manualParchiNumber != null &&
              entry.manualParchiNumber !== '' && (
                <Text style={styles.headerManualNo}>
                  Manual #{entry.manualParchiNumber}
                </Text>
              )}
          </View>
        </View>

        {/* Details grid */}
        <View style={styles.detailsGrid}>
          <View style={styles.detailsColumn}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>A/c No.:</Text>
              <Text style={styles.detailValue}>#{farmerAccount ?? '—'}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Name:</Text>
              <Text style={styles.detailValue}>{farmerName}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Variety:</Text>
              <Text style={styles.detailValue}>{displayVariety}</Text>
            </View>
          </View>
          <View style={styles.detailsColumn}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Dated:</Text>
              <Text style={styles.detailValue}>
                {formatVoucherDate(entry.date)}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>From → To:</Text>
              <Text style={styles.detailValue}>{fromTo}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Created By:</Text>
              <Text style={styles.detailValue}>{createdByDisplay}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Bags Issued:</Text>
              <Text style={styles.detailValue}>
                {formatNumber(totalIssued)}
              </Text>
            </View>
          </View>
        </View>

        {/* Breakdown table */}
        {hasBreakdown && (
          <>
            <Text style={styles.sectionTitle}>Detailed Breakdown</Text>
            <View style={styles.table}>
              {useNewFormatFlag ? (
            <>
              <View style={[styles.tableRow, styles.tableRowHeader]}>
                <Text style={[styles.tableCell, styles.headerText, { width: newColWidths[0] }]}>Type</Text>
                <Text style={[styles.tableCell, styles.headerText, { width: newColWidths[1] }]}>Variety</Text>
                <Text style={[styles.tableCell, styles.tableCellRight, styles.headerText, { width: newColWidths[2] }]}>Issued</Text>
              </View>
              {breakdownRowsNew.map((row, idx) => (
                <View key={idx} style={styles.tableRow}>
                  <Text style={[styles.tableCell, { width: newColWidths[0] }]}>{row.size}</Text>
                  <Text style={[styles.tableCell, { width: newColWidths[1] }]}>{row.variety}</Text>
                  <Text style={[styles.tableCell, styles.tableCellRight, styles.totalText, { width: newColWidths[2] }]}>
                    {row.issuedQty.toLocaleString('en-IN')}
                  </Text>
                </View>
              ))}
              <View style={[styles.tableRow, styles.tableRowTotal]}>
                <Text style={[styles.tableCell, styles.totalText, { width: newColWidths[0] }]}>Total</Text>
                <Text style={[styles.tableCell, { width: newColWidths[1] }]} />
                <Text style={[styles.tableCell, styles.tableCellRight, styles.totalText, { width: newColWidths[2] }]}>
                  {totalIssued.toLocaleString('en-IN')}
                </Text>
              </View>
            </>
          ) : breakdownRowsLegacy.length > 0 ? (
            <>
              <View style={[styles.tableRow, styles.tableRowHeader]}>
                <Text style={[styles.tableCell, styles.headerText, { width: '25%' }]}>Type</Text>
                <Text style={[styles.tableCell, styles.headerText, { width: '25%' }]}>Variety</Text>
                <Text style={[styles.tableCell, styles.headerText, { width: '25%' }]}>Location</Text>
                <Text style={[styles.tableCell, styles.tableCellRight, styles.headerText, { width: '25%' }]}>Issued</Text>
              </View>
              {breakdownRowsLegacy.map((row, idx) => (
                <View key={idx} style={styles.tableRow}>
                  <Text style={[styles.tableCell, { width: '25%' }]}>{row.size}</Text>
                  <Text style={[styles.tableCell, { width: '25%' }]}>{row.variety}</Text>
                  <Text style={[styles.tableCell, { width: '25%' }]}>{row.location}</Text>
                  <Text style={[styles.tableCell, styles.tableCellRight, styles.totalText, { width: '25%' }]}>
                    {row.issuedQty.toLocaleString('en-IN')}
                  </Text>
                </View>
              ))}
              <View style={[styles.tableRow, styles.tableRowTotal]}>
                <Text style={[styles.tableCell, styles.totalText, { width: '25%' }]}>Total</Text>
                <Text style={[styles.tableCell, { width: '25%' }]} />
                <Text style={[styles.tableCell, { width: '25%' }]} />
                <Text style={[styles.tableCell, styles.tableCellRight, styles.totalText, { width: '25%' }]}>
                  {totalIssued.toLocaleString('en-IN')}
                </Text>
              </View>
            </>
          ) : (
            <>
              <View style={[styles.tableRow, styles.tableRowHeader]}>
                <Text style={[styles.tableCell, styles.headerText, { width: '25%' }]}>Type</Text>
                <Text style={[styles.tableCell, styles.headerText, { width: '25%' }]}>Variety</Text>
                <Text style={[styles.tableCell, styles.headerText, { width: '25%' }]}>Location</Text>
                <Text style={[styles.tableCell, styles.tableCellRight, styles.headerText, { width: '25%' }]}>Issued</Text>
              </View>
              {orderDetails.map((od, idx) => (
                <View key={idx} style={styles.tableRow}>
                  <Text style={[styles.tableCell, { width: '25%' }]}>{od.size ?? '—'}</Text>
                  <Text style={[styles.tableCell, { width: '25%' }]}>—</Text>
                  <Text style={[styles.tableCell, { width: '25%' }]}>—</Text>
                  <Text style={[styles.tableCell, styles.tableCellRight, styles.totalText, { width: '25%' }]}>
                    {(od.quantityIssued ?? 0).toLocaleString('en-IN')}
                  </Text>
                </View>
              ))}
              {orderDetails.length > 0 && (
                <View style={[styles.tableRow, styles.tableRowTotal]}>
                  <Text style={[styles.tableCell, styles.totalText, { width: '25%' }]}>Total</Text>
                  <Text style={[styles.tableCell, { width: '25%' }]} />
                  <Text style={[styles.tableCell, { width: '25%' }]} />
                  <Text style={[styles.tableCell, styles.tableCellRight, styles.totalText, { width: '25%' }]}>
                    {totalIssued.toLocaleString('en-IN')}
                  </Text>
                </View>
              )}
            </>
          )}
            </View>
          </>
        )}

        {/* Summary */}
        <View style={styles.summaryBox}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Bags issued</Text>
            <Text style={styles.summaryValue}>
              {formatNumber(totalIssued)}
            </Text>
          </View>
        </View>

        {/* Remarks */}
        {entry.remarks != null && entry.remarks.trim() !== '' && (
          <>
            <Text style={styles.sectionTitle}>Remarks</Text>
            <View style={styles.remarksBox}>
              <Text style={styles.remarksText}>{entry.remarks}</Text>
            </View>
          </>
        )}

        {/* Footer */}
        <View style={styles.footer} fixed>
          {coldStorage?.imageUrl ? (
            <Image
              src={coldStorage.imageUrl}
              style={{ width: 24, height: 24 }}
            />
          ) : null}
          <Text style={styles.footerText}>Powered By Coldop</Text>
        </View>
      </Page>
    </Document>
  );
});
