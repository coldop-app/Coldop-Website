import { memo } from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from '@react-pdf/renderer';
import type { IncomingGatePassEntry } from '@/services/store-admin/functions/useGetDaybook';
import { format } from 'date-fns';

/* -------------------------------------------------
   Colors: only IGP # (green) and Manual # (muted) are colored; rest B&W
------------------------------------------------- */
const PRIMARY = '#18a44b';
const MUTED = '#6b7280';
const BORDER = '#e5e7eb';
const HEADER_BG = '#f3f4f6';
const TEXT = '#111';

export interface ColdStoragePdfProps {
  name: string;
  address: string;
  imageUrl?: string;
}

export interface IncomingGatePassPdfProps {
  entry: IncomingGatePassEntry;
  coldStorage: ColdStoragePdfProps | null;
}

function formatVoucherDate(date?: string): string {
  if (!date) return '—';
  return format(new Date(date), 'dd MMM yyyy');
}

function formatNumber(value?: number | null): string {
  if (value == null || Number.isNaN(value)) return '—';
  return value.toLocaleString('en-IN');
}

function formatLocation(loc?: {
  chamber?: string;
  floor?: string;
  row?: string;
}): string {
  if (!loc) return '—';
  return (
    `${loc.chamber ?? ''}/${loc.floor ?? ''}/${loc.row ?? ''}`.replace(
      /\/+$/,
      ''
    ) || '—'
  );
}

/* -------------------------------------------------
   Styles
------------------------------------------------- */
const styles = StyleSheet.create({
  page: {
    padding: 40,
    paddingBottom: 70,
    fontSize: 10.5,
    fontFamily: 'Helvetica',
  },

  /* Header – only IGP # and Manual # keep color */
  header: {
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderBottomColor: TEXT,
    paddingBottom: 14,
    marginBottom: 14,
    alignItems: 'center',
  },
  headerLogo: {
    width: 60,
    height: 60,
    marginRight: 16,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerStorageName: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    color: TEXT,
    marginBottom: 4,
  },
  headerStorageAddress: {
    fontSize: 9,
    color: TEXT,
    textAlign: 'center',
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  headerGatePassNo: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: PRIMARY,
  },
  headerManualNo: {
    fontSize: 9,
    color: MUTED,
    marginTop: 2,
  },

  /* Title */
  documentTitle: {
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
    color: TEXT,
    letterSpacing: 1,
    marginBottom: 6,
  },
  divider: {
    height: 1,
    backgroundColor: BORDER,
    marginVertical: 14,
  },

  /* Meta Card */
  metaCard: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 4,
    padding: 16,
    marginBottom: 22,
  },
  detailsGrid: {
    flexDirection: 'row',
  },
  detailsColumn: {
    flex: 1,
    paddingRight: 20,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  detailLabel: {
    fontFamily: 'Helvetica-Bold',
    marginRight: 4,
    color: TEXT,
  },
  detailValue: {
    flex: 1,
    color: TEXT,
  },

  /* Section Title */
  sectionTitle: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: TEXT,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  },

  /* Table */
  table: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 24,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    minHeight: 30,
    alignItems: 'center',
  },
  tableRowHeader: {
    backgroundColor: HEADER_BG,
  },
  tableRowTotal: {
    backgroundColor: HEADER_BG,
    borderTopWidth: 2,
    borderTopColor: TEXT,
  },
  tableCell: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 9,
    color: TEXT,
  },
  tableCellRight: {
    textAlign: 'right',
  },
  headerText: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
    color: TEXT,
  },
  totalText: {
    fontFamily: 'Helvetica-Bold',
    color: TEXT,
  },
  colSize: { width: '30%' },
  colLocation: { width: '30%' },
  colQty: { width: '20%' },
  colInitial: { width: '20%' },

  /* Summary */
  summaryBox: {
    backgroundColor: HEADER_BG,
    borderLeftWidth: 4,
    borderLeftColor: BORDER,
    padding: 12,
    marginBottom: 24,
  },
  summaryLabel: {
    fontSize: 10,
    color: TEXT,
  },
  summaryValue: {
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    color: TEXT,
  },

  /* Remarks */
  remarksBox: {
    backgroundColor: HEADER_BG,
    padding: 12,
    borderRadius: 4,
    marginBottom: 24,
  },

  /* Signature */
  signatureSection: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  signatureBox: {
    width: '40%',
    alignItems: 'center',
  },
  signatureLine: {
    borderTopWidth: 1,
    borderTopColor: TEXT,
    width: '100%',
    marginBottom: 6,
  },
  signatureLabel: {
    fontSize: 9,
    color: TEXT,
  },

  /* Footer */
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

/* -------------------------------------------------
   Component
------------------------------------------------- */

export const IncomingGatePassPdf = memo(function IncomingGatePassPdf({
  entry,
  coldStorage,
}: IncomingGatePassPdfProps) {
  const bagSizes = entry.bagSizes ?? [];
  const totalBags = bagSizes.reduce(
    (sum, b) => sum + (b.initialQuantity ?? 0),
    0
  );

  const farmerName = entry.farmerStorageLinkId?.farmerId?.name ?? '—';
  const farmerAccount = entry.farmerStorageLinkId?.accountNumber ?? '—';
  const createdBy = entry.createdBy?.name ?? '—';

  return (
    <Document title={`IGP #${entry.gatePassNo ?? '—'}`} creator="Coldop">
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
              IGP #{entry.gatePassNo ?? '—'}
            </Text>
            {entry.manualParchiNumber && (
              <Text style={styles.headerManualNo}>
                Manual #{entry.manualParchiNumber}
              </Text>
            )}
          </View>
        </View>

        {/* Meta Card */}
        <View style={styles.metaCard}>
          <View style={styles.detailsGrid}>
            <View style={styles.detailsColumn}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>A/c No:</Text>
                <Text style={styles.detailValue}>#{farmerAccount}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Name:</Text>
                <Text style={styles.detailValue}>{farmerName}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Variety:</Text>
                <Text style={styles.detailValue}>{entry.variety ?? '—'}</Text>
              </View>
            </View>

            <View style={styles.detailsColumn}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Date:</Text>
                <Text style={styles.detailValue}>
                  {formatVoucherDate(entry.date)}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Bags:</Text>
                <Text style={styles.detailValue}>
                  {formatNumber(totalBags)}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Created By:</Text>
                <Text style={styles.detailValue}>{createdBy}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Truck No:</Text>
                <Text style={styles.detailValue}>
                  {entry.truckNumber?.trim() ?? '—'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Table */}
        <Text style={styles.sectionTitle}>Order Details</Text>
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableRowHeader]}>
            <Text style={[styles.tableCell, styles.colSize, styles.headerText]}>
              Bag Size
            </Text>
            <Text
              style={[styles.tableCell, styles.colLocation, styles.headerText]}
            >
              Storage Location
            </Text>
            <Text
              style={[
                styles.tableCell,
                styles.colQty,
                styles.tableCellRight,
                styles.headerText,
              ]}
            >
              Current Qty
            </Text>
            <Text
              style={[
                styles.tableCell,
                styles.colInitial,
                styles.tableCellRight,
                styles.headerText,
              ]}
            >
              Initial Qty
            </Text>
          </View>

          {bagSizes.map((bag, idx) => (
            <View key={idx} style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.colSize]}>
                {bag.name ?? '—'}
              </Text>
              <Text style={[styles.tableCell, styles.colLocation]}>
                {formatLocation(bag.location)}
              </Text>
              <Text
                style={[styles.tableCell, styles.colQty, styles.tableCellRight]}
              >
                {formatNumber(bag.currentQuantity ?? 0)}
              </Text>
              <Text
                style={[
                  styles.tableCell,
                  styles.colInitial,
                  styles.tableCellRight,
                ]}
              >
                {formatNumber(bag.initialQuantity ?? 0)}
              </Text>
            </View>
          ))}

          <View style={[styles.tableRow, styles.tableRowTotal]}>
            <Text style={[styles.tableCell, styles.colSize, styles.totalText]}>
              Total
            </Text>
            <Text style={[styles.tableCell, styles.colLocation]} />
            <Text
              style={[
                styles.tableCell,
                styles.colQty,
                styles.tableCellRight,
                styles.totalText,
              ]}
            >
              {formatNumber(totalBags)}
            </Text>
            <Text
              style={[
                styles.tableCell,
                styles.colInitial,
                styles.tableCellRight,
                styles.totalText,
              ]}
            >
              {formatNumber(totalBags)}
            </Text>
          </View>
        </View>

        {/* Summary */}
        <View style={styles.summaryBox}>
          <Text style={styles.summaryLabel}>Total Bags Received</Text>
          <Text style={styles.summaryValue}>{formatNumber(totalBags)}</Text>
        </View>

        {/* Remarks */}
        {entry.remarks?.trim() && (
          <>
            <Text style={styles.sectionTitle}>Remarks</Text>
            <View style={styles.remarksBox}>
              <Text>{entry.remarks}</Text>
            </View>
          </>
        )}

        {/* Signatures */}
        <View style={styles.signatureSection}>
          <View style={styles.signatureBox}>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>Received By</Text>
          </View>
        </View>

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
