import {
  Text,
  Page,
  View,
  Document,
  StyleSheet,
  Image,
  Svg,
  Path,
} from '@react-pdf/renderer';

import type {
  FarmerStockLedgerPdfData,
  PdfLedgerItem,
  PdfLedgerVarietyValue,
} from '@/features/people-report/utils/build-farmer-stock-ledger-pdf-data';
import {
  getExportLayout,
  getGroupCellValue,
  getLeafCellValue,
} from '@/features/people-report/utils/build-farmer-stock-ledger-excel';
import type { LedgerExportColumn } from '@/features/people-report/utils/export-cell-value';
import type { StockSummaryMatrix } from '@/features/people/utils/build-farmer-stock-summary';
import { registerColdopPdfFonts } from '@/lib/pdf/register-pdf-fonts';

registerColdopPdfFonts();

export type FarmerStockLedgerReportProps = FarmerStockLedgerPdfData & {
  coldStorageName: string;
  coldStorageAddress?: string;
  coldStorageLogo?: string;
  coldopLogo?: string;
};

const COLOR = {
  ink: '#09090b',
  inkSoft: '#71717a',
  inkMuted: '#a1a1aa',
  hairline: '#e4e4e7',
  hairlineStrong: '#27272a',
  paper: '#ffffff',
  wash: '#f4f4f5',
  accent: '#008235',
  accentWash: '#dcfce7',
  borderLight: '#f4f4f5',
};

const styles = StyleSheet.create({
  page: {
    paddingTop: 36,
    paddingBottom: 48,
    paddingHorizontal: 34,
    fontFamily: 'Inter',
    fontWeight: 400,
    backgroundColor: COLOR.paper,
    color: COLOR.ink,
  },
  letterhead: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 16,
  },
  headerLeft: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerRight: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  logoMark: {
    width: 48,
    height: 48,
  },
  logoFallback: {
    width: 48,
    height: 48,
    borderRadius: 6,
    backgroundColor: COLOR.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoFallbackText: {
    color: COLOR.paper,
    fontSize: 20,
    fontFamily: 'Inter',
    fontWeight: 700,
  },
  storageName: {
    fontSize: 28,
    fontFamily: 'Outfit',
    fontWeight: 700,
    color: COLOR.ink,
    letterSpacing: -0.75,
    textAlign: 'center',
  },
  storageMeta: {
    fontSize: 9,
    color: COLOR.inkSoft,
    marginTop: 4,
    letterSpacing: 0.5,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  reportTitleHeader: {
    fontSize: 11,
    color: COLOR.inkSoft,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginTop: 8,
    fontFamily: 'Inter',
    fontWeight: 700,
    textAlign: 'center',
  },
  docRefBlock: {
    alignItems: 'flex-end',
  },
  docRefLabel: {
    fontSize: 7,
    color: COLOR.inkMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  docRefValue: {
    fontSize: 9,
    color: COLOR.ink,
    fontFamily: 'Inter',
    fontWeight: 700,
    letterSpacing: 0.3,
    marginTop: 2,
  },
  headerDivider: {
    borderBottomWidth: 2,
    borderBottomColor: COLOR.hairlineStrong,
    marginBottom: 2,
  },
  headerDividerThin: {
    borderBottomWidth: 0.5,
    borderBottomColor: COLOR.hairline,
    marginBottom: 20,
  },
  farmerSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 16,
    marginBottom: 24,
    borderTopWidth: 0.5,
    borderTopColor: COLOR.hairline,
    borderBottomWidth: 0.5,
    borderBottomColor: COLOR.hairline,
  },
  farmerCol: {
    flexDirection: 'column',
    flex: 1,
  },
  farmerColRight: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    flex: 1,
  },
  reportEyebrow: {
    fontSize: 7.5,
    color: COLOR.inkMuted,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 6,
    fontFamily: 'Inter',
    fontWeight: 700,
  },
  farmerName: {
    fontSize: 16,
    fontFamily: 'Inter',
    fontWeight: 700,
    color: COLOR.ink,
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  farmerAddress: {
    fontSize: 9,
    color: COLOR.inkSoft,
    lineHeight: 1.4,
  },
  farmerMobile: {
    fontSize: 9,
    fontFamily: 'Inter',
    fontWeight: 700,
    color: COLOR.ink,
    marginTop: 4,
  },
  statBlock: {
    marginLeft: 32,
    minWidth: 100,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  iconBoxIncoming: {
    width: 20,
    height: 20,
    borderRadius: 4,
    backgroundColor: COLOR.accentWash,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  iconBoxOutgoing: {
    width: 20,
    height: 20,
    borderRadius: 4,
    backgroundColor: COLOR.wash,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  statLabel: {
    fontSize: 9,
    color: COLOR.inkSoft,
    fontFamily: 'Inter',
    fontWeight: 700,
  },
  statMainVal: {
    fontSize: 11,
    fontFamily: 'Inter',
    fontWeight: 700,
    color: COLOR.ink,
    marginBottom: 2,
  },
  statSubVal: {
    fontSize: 9,
    color: COLOR.inkSoft,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 9,
  },
  sectionTick: {
    width: 4,
    height: 12,
    backgroundColor: COLOR.accent,
    marginRight: 7,
    borderRadius: 2,
  },
  sectionTitle: {
    fontSize: 10.5,
    fontFamily: 'Inter',
    fontWeight: 700,
    color: COLOR.ink,
    textTransform: 'uppercase',
    letterSpacing: 1.1,
    marginRight: 10,
  },
  sectionRule: {
    flex: 1,
    borderBottomWidth: 0.5,
    borderBottomColor: COLOR.hairline,
  },
  ledgerTableSection: {
    marginBottom: 28,
  },
  outgoingSectionHeader: {
    marginTop: 12,
  },
  sumContainer: {
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLOR.borderLight,
    marginBottom: 24,
    overflow: 'hidden',
  },
  sumRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: COLOR.borderLight,
  },
  sumRowNoBorder: {
    flexDirection: 'row',
  },
  sumHeaderBg: { backgroundColor: COLOR.wash },
  sumTotalRowBg: { backgroundColor: COLOR.wash },
  sumTotalColBg: { backgroundColor: COLOR.wash },
  sumBorderRight: {
    borderRightWidth: 1,
    borderRightColor: COLOR.borderLight,
  },
  sumCellHeaderLeft: {
    fontSize: 8.5,
    fontFamily: 'Inter',
    fontWeight: 700,
    color: COLOR.ink,
  },
  sumCellHeader: {
    fontSize: 8.5,
    fontFamily: 'Inter',
    fontWeight: 700,
    color: COLOR.ink,
    textAlign: 'right',
  },
  sumCellVar: {
    fontSize: 9,
    fontFamily: 'Inter',
    fontWeight: 700,
    color: COLOR.ink,
  },
  sumCellValueBlack: {
    fontSize: 9,
    color: COLOR.ink,
    textAlign: 'right',
  },
  sumCellValueGreen: {
    fontSize: 9,
    fontFamily: 'Inter',
    fontWeight: 700,
    color: COLOR.accent,
    textAlign: 'right',
  },
  sumCellTotalBlack: {
    fontSize: 9,
    fontFamily: 'Inter',
    fontWeight: 700,
    color: COLOR.ink,
    textAlign: 'right',
  },
  table: {
    width: '100%',
    marginBottom: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLOR.hairline,
    overflow: 'hidden',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: COLOR.wash,
    borderBottomWidth: 1,
    borderBottomColor: COLOR.hairline,
    paddingTop: 8,
    paddingBottom: 8,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: COLOR.hairline,
    paddingTop: 9,
    paddingBottom: 9,
    alignItems: 'flex-start',
  },
  highlightRow: {
    backgroundColor: COLOR.accentWash,
    borderLeftWidth: 3,
    borderLeftColor: COLOR.accent,
  },
  groupRow: {
    backgroundColor: COLOR.wash,
    paddingTop: 5,
    paddingBottom: 5,
    alignItems: 'center',
  },
  groupLabel: {
    fontSize: 9.5,
    fontFamily: 'Inter',
    fontWeight: 700,
    color: COLOR.ink,
  },
  highlightFooterRow: {
    backgroundColor: COLOR.accentWash,
    borderLeftWidth: 3,
    borderLeftColor: COLOR.accent,
    borderTopWidth: 0.75,
    borderTopColor: COLOR.hairlineStrong,
    borderBottomWidth: 0,
    paddingTop: 8,
    paddingBottom: 8,
  },
  footerTotalLabel: {
    fontSize: 9,
    fontFamily: 'Inter',
    fontWeight: 700,
    color: COLOR.accent,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  tableCellHeader: {
    fontSize: 7.5,
    fontFamily: 'Inter',
    fontWeight: 700,
    color: COLOR.ink,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  tableCellHeaderCenter: {
    fontSize: 7.5,
    fontFamily: 'Inter',
    fontWeight: 700,
    color: COLOR.ink,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    textAlign: 'center',
  },
  tableCell: { fontSize: 9, color: COLOR.inkSoft },
  tableCellData: {
    fontSize: 9,
    color: COLOR.ink,
    fontFamily: 'Inter',
    fontWeight: 400,
  },
  tableCellMono: {
    fontSize: 9,
    color: COLOR.ink,
    fontFamily: 'Courier',
    fontWeight: 400,
  },
  tableCellBold: {
    fontSize: 9,
    color: COLOR.ink,
    fontFamily: 'Inter',
    fontWeight: 700,
  },
  tableCellAccent: {
    fontSize: 9,
    color: COLOR.accent,
    fontFamily: 'Inter',
    fontWeight: 700,
  },
  tableCellMuted: {
    fontSize: 9,
    color: COLOR.inkMuted,
    textAlign: 'center',
  },
  ledgerCellBase: {
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingVertical: 1,
    paddingLeft: 8,
    paddingRight: 8,
  },
  ledgerCellCenter: {
    alignItems: 'center',
  },
  ledgerHeaderDate: {
    paddingLeft: 8,
  },
  ledgerCellRemarks: {
    paddingRight: 8,
  },
  stackedHeaderCell: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  varietyBreakdownLine: {
    fontSize: 9,
    lineHeight: 1.35,
  },
  varietyBreakdownLineSpacing: {
    marginBottom: 2,
  },
  varietyBreakdownName: {
    color: COLOR.ink,
    fontFamily: 'Inter',
    fontWeight: 700,
  },
  varietyBreakdownQty: {
    color: COLOR.inkSoft,
    fontFamily: 'Inter',
    fontWeight: 400,
  },
  subText: {
    fontSize: 7,
    color: COLOR.inkSoft,
    marginTop: 1.5,
    fontFamily: 'Inter',
    fontWeight: 400,
  },
  totalsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  totalsLabel: {
    fontSize: 8,
    fontFamily: 'Inter',
    fontWeight: 700,
    color: COLOR.accent,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  totalsValue: {
    fontSize: 9,
    fontFamily: 'Inter',
    fontWeight: 700,
    color: COLOR.ink,
    textAlign: 'center',
  },
  totalsSizeValue: {
    fontSize: 9,
    fontFamily: 'Inter',
    fontWeight: 700,
    color: COLOR.ink,
    textAlign: 'center',
  },
  footer: { position: 'absolute', bottom: 20, left: 34, right: 34 },
  footerRule: {
    borderTopWidth: 0.5,
    borderTopColor: COLOR.hairline,
    marginBottom: 8,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerCol: {
    flex: 1,
  },
  footerColLeft: {
    flex: 1,
    alignItems: 'flex-start',
  },
  footerColCenter: {
    flex: 1,
    alignItems: 'center',
  },
  footerColRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  footerDisclosure: { fontSize: 7, color: COLOR.inkMuted },
  footerBrand: { flexDirection: 'row', alignItems: 'center' },
  footerBrandLogo: { width: 11, height: 11, marginRight: 5 },
  footerBrandText: { fontSize: 7, color: COLOR.inkMuted, letterSpacing: 0.4 },
  footerBrandHighlight: {
    fontFamily: 'Inter',
    fontWeight: 700,
    color: COLOR.inkSoft,
  },
  footerPage: { fontSize: 7, color: COLOR.inkMuted },
});

function getSummarySizeWidth(sizeCount: number): string {
  if (sizeCount <= 0) return '0%';
  const remaining = 100 - 18 - 14;
  return `${remaining / sizeCount}%`;
}

const LEDGER_COLUMN_WIDTH_WEIGHTS: Record<string, number> = {
  date: 9,
  gatePassNo: 6,
  manualParchiNumber: 6,
  variety: 10,
  stockFilter: 8,
  customMarka: 8,
  rowBags: 7,
  totalBags: 8,
  remarks: 9,
};

function getDynamicColumnWidths(exportColumns: LedgerExportColumn[]): Record<string, string> {
  const sizeColumns = exportColumns.filter((column) => column.id.startsWith('size-'));
  const fixedWidth = exportColumns
    .filter((column) => !column.id.startsWith('size-'))
    .reduce((sum, column) => sum + (LEDGER_COLUMN_WIDTH_WEIGHTS[column.id] ?? 8), 0);
  const sizeWidth = sizeColumns.length > 0 ? (100 - fixedWidth) / sizeColumns.length : 0;

  return Object.fromEntries(
    exportColumns.map((column) => [
      column.id,
      column.id.startsWith('size-')
        ? `${sizeWidth}%`
        : `${LEDGER_COLUMN_WIDTH_WEIGHTS[column.id] ?? 8}%`,
    ]),
  );
}

function isLedgerEmptyValue(value: string | number): boolean {
  return value === '' || value === '—';
}

function formatLedgerCellDisplay(value: string | number): string {
  if (isLedgerEmptyValue(value)) return '';
  if (typeof value === 'number') return value.toLocaleString('en-IN');
  return value;
}

function isNumericLedgerColumn(column: LedgerExportColumn): boolean {
  return column.id.startsWith('size-') || column.id === 'rowBags' || column.id === 'totalBags';
}

function getLedgerDataCellContainerStyle(
  column: LedgerExportColumn,
  width: string,
  depthPadding: number,
) {
  return [
    styles.ledgerCellBase,
    ...(isNumericLedgerColumn(column) ? [styles.ledgerCellCenter] : []),
    ...(column.id === 'remarks' ? [styles.ledgerCellRemarks] : []),
    { width, paddingLeft: depthPadding },
  ];
}

function getLedgerHeaderCellContainerStyle(column: LedgerExportColumn, width: string) {
  return [
    styles.ledgerCellBase,
    ...(isNumericLedgerColumn(column) ? [styles.ledgerCellCenter] : []),
    ...(column.id === 'date' ? [styles.ledgerHeaderDate] : []),
    ...(column.id === 'remarks' ? [styles.ledgerCellRemarks] : []),
    { width },
  ];
}

function renderVarietyLedgerCell(
  variety: PdfLedgerVarietyValue | null,
  column: LedgerExportColumn,
  columnWidths: Record<string, string>,
  depthPadding: number,
) {
  const width = columnWidths[column.id] ?? '8%';
  const containerStyle = getLedgerDataCellContainerStyle(column, width, depthPadding);

  if (!variety) {
    return <View key={column.id} style={containerStyle} />;
  }

  if (variety.type === 'plain') {
    const display = variety.value === '' || variety.value === '—' ? '' : variety.value;

    return (
      <View key={column.id} style={containerStyle}>
        {display ? <Text style={styles.tableCellBold}>{display}</Text> : null}
      </View>
    );
  }

  return (
    <View key={column.id} style={containerStyle}>
      {variety.lines.map((line, index) => (
        <Text
          key={line.variety}
          style={[
            styles.varietyBreakdownLine,
            ...(index < variety.lines.length - 1 ? [styles.varietyBreakdownLineSpacing] : []),
          ]}
        >
          <Text style={styles.varietyBreakdownName}>{line.variety}</Text>
          <Text style={styles.varietyBreakdownQty}> ({line.quantity})</Text>
        </Text>
      ))}
    </View>
  );
}

function renderLedgerDataCell(
  value: string | number,
  column: LedgerExportColumn,
  columnIndex: number,
  columnWidths: Record<string, string>,
  options: {
    isGroup?: boolean;
    isOpeningBalance?: boolean;
    isFooterTotal?: boolean;
    depthPadding?: number;
  } = {},
) {
  const width = columnWidths[column.id] ?? '8%';
  const depthPadding = columnIndex === 0 && options.depthPadding ? options.depthPadding : 0;
  const containerStyle = getLedgerDataCellContainerStyle(column, width, depthPadding);

  if (typeof value === 'string' && value.includes('\n') && column.id.startsWith('size-')) {
    const [main, sub] = value.split('\n');
    return (
      <View key={column.id} style={containerStyle}>
        <Text style={styles.tableCellBold}>{main}</Text>
        <Text style={styles.subText}>{sub}</Text>
      </View>
    );
  }

  const display = formatLedgerCellDisplay(value);
  const textStyle =
    columnIndex === 0 && options.isFooterTotal
      ? styles.footerTotalLabel
      : columnIndex === 0 && options.isGroup
        ? styles.groupLabel
        : columnIndex === 0 && options.isOpeningBalance
          ? styles.tableCellAccent
          : column.id === 'gatePassNo' || column.id === 'manualParchiNumber'
            ? styles.tableCellMono
            : column.id === 'variety' || column.id === 'rowBags' || column.id === 'totalBags'
              ? styles.tableCellBold
              : styles.tableCellData;

  return (
    <View key={column.id} style={containerStyle}>
      {display ? <Text style={textStyle}>{display}</Text> : null}
    </View>
  );
}

function LedgerTableHeaderRow({
  exportColumns,
  columnWidths,
  fixed,
}: {
  exportColumns: LedgerExportColumn[];
  columnWidths: Record<string, string>;
  fixed?: boolean;
}) {
  return (
    <View style={styles.tableHeaderRow} {...(fixed ? { fixed: true, minPresenceAhead: 28 } : {})}>
      {exportColumns.map((column) => renderLedgerHeaderCell(column, columnWidths))}
    </View>
  );
}

function renderLedgerHeaderCell(column: LedgerExportColumn, columnWidths: Record<string, string>) {
  const width = columnWidths[column.id] ?? '8%';
  const isGatePass = column.id === 'gatePassNo';
  const isManualParchi = column.id === 'manualParchiNumber';
  const isStockFilter = column.id === 'stockFilter';
  const isCustomMarka = column.id === 'customMarka';
  const isRowBags = column.id === 'rowBags';
  const isCumulativeTotal = column.id === 'totalBags';
  const isStackedHeader = isRowBags || isCumulativeTotal;
  const containerStyle = [
    ...getLedgerHeaderCellContainerStyle(column, width),
    ...(isStackedHeader ? [styles.stackedHeaderCell] : []),
  ];

  return (
    <View key={column.id} style={containerStyle}>
      {isGatePass ? (
        <>
          <Text style={styles.tableCellHeader}>Gate</Text>
          <Text style={styles.tableCellHeader}>Pass</Text>
        </>
      ) : isManualParchi ? (
        <>
          <Text style={styles.tableCellHeader}>Manual</Text>
          <Text style={styles.tableCellHeader}>Parchi</Text>
        </>
      ) : isStockFilter ? (
        <>
          <Text style={styles.tableCellHeader}>Stock</Text>
          <Text style={styles.tableCellHeader}>Filter</Text>
        </>
      ) : isCustomMarka ? (
        <>
          <Text style={styles.tableCellHeader}>Custom</Text>
          <Text style={styles.tableCellHeader}>Marka</Text>
        </>
      ) : isRowBags ? (
        <>
          <Text style={styles.tableCellHeaderCenter}>Total</Text>
          <Text style={styles.tableCellHeaderCenter}>Bags</Text>
        </>
      ) : isCumulativeTotal ? (
        <>
          <Text style={styles.tableCellHeaderCenter}>Cumulative</Text>
          <Text style={styles.tableCellHeaderCenter}>Total</Text>
        </>
      ) : (
        <Text
          style={
            isNumericLedgerColumn(column) ? styles.tableCellHeaderCenter : styles.tableCellHeader
          }
        >
          {column.header}
        </Text>
      )}
    </View>
  );
}

function renderSummaryValue(val: number) {
  const num = Number(val);
  if (num > 0) {
    return <Text style={styles.sumCellValueGreen}>{num.toLocaleString('en-IN')}</Text>;
  }
  return <Text style={styles.sumCellValueBlack}>{num}</Text>;
}

function SummaryTable({
  matrix,
  sizeColumns,
}: {
  matrix: StockSummaryMatrix;
  sizeColumns: string[];
}) {
  const sizeWidth = getSummarySizeWidth(sizeColumns.length);

  return (
    <View style={styles.sumContainer}>
      <View style={[styles.sumRow, styles.sumHeaderBg]}>
        <View
          style={[
            { width: '18%' },
            styles.sumBorderRight,
            { paddingVertical: 10, paddingHorizontal: 8, justifyContent: 'center' },
          ]}
        >
          <Text style={styles.sumCellHeaderLeft}>Varieties</Text>
        </View>
        {sizeColumns.map((size) => (
          <View
            key={size}
            style={[
              { width: sizeWidth },
              styles.sumBorderRight,
              { paddingVertical: 10, paddingHorizontal: 8, justifyContent: 'center' },
            ]}
          >
            <Text style={styles.sumCellHeader}>{size}</Text>
          </View>
        ))}
        <View
          style={[
            { width: '14%' },
            styles.sumTotalColBg,
            { paddingVertical: 10, paddingHorizontal: 8, justifyContent: 'center' },
          ]}
        >
          <Text style={styles.sumCellHeader}>Total</Text>
        </View>
      </View>

      {matrix.rows.map((row, index) => (
        <View key={`${row.variety}-${index}`} style={styles.sumRow}>
          <View
            style={[
              { width: '18%' },
              styles.sumBorderRight,
              { paddingVertical: 10, paddingHorizontal: 8, justifyContent: 'center' },
            ]}
          >
            <Text style={styles.sumCellVar}>{row.variety}</Text>
          </View>
          {sizeColumns.map((size) => (
            <View
              key={size}
              style={[
                { width: sizeWidth },
                styles.sumBorderRight,
                { paddingVertical: 10, paddingHorizontal: 8, justifyContent: 'center' },
              ]}
            >
              {renderSummaryValue(row.bySize[size] ?? 0)}
            </View>
          ))}
          <View
            style={[
              { width: '14%' },
              styles.sumTotalColBg,
              { paddingVertical: 10, paddingHorizontal: 8, justifyContent: 'center' },
            ]}
          >
            {renderSummaryValue(row.total)}
          </View>
        </View>
      ))}

      <View style={[styles.sumRowNoBorder, styles.sumTotalRowBg]}>
        <View
          style={[
            { width: '18%' },
            styles.sumBorderRight,
            { paddingVertical: 10, paddingHorizontal: 8, justifyContent: 'center' },
          ]}
        >
          <Text style={styles.sumCellVar}>Bag Total</Text>
        </View>
        {sizeColumns.map((size) => (
          <View
            key={size}
            style={[
              { width: sizeWidth },
              styles.sumBorderRight,
              { paddingVertical: 10, paddingHorizontal: 8, justifyContent: 'center' },
            ]}
          >
            <Text style={styles.sumCellTotalBlack}>
              {(matrix.footerBySize[size] ?? 0).toLocaleString('en-IN')}
            </Text>
          </View>
        ))}
        <View
          style={[
            { width: '14%' },
            styles.sumTotalColBg,
            { paddingVertical: 10, paddingHorizontal: 8, justifyContent: 'center' },
          ]}
        >
          <Text style={styles.sumCellValueGreen}>{matrix.grandTotal.toLocaleString('en-IN')}</Text>
        </View>
      </View>
    </View>
  );
}

type LedgerExportContext = Pick<
  FarmerStockLedgerPdfData,
  'exportColumns' | 'sizeColumns' | 'showStockFilter' | 'showCustomMarka'
>;

function LedgerTable({
  data,
  ledgerExport,
  footerLabel,
  footerSizeTotals,
  closingBalance,
  rowBagsTotal,
}: {
  data: PdfLedgerItem[];
  ledgerExport: LedgerExportContext;
  footerLabel: string;
  footerSizeTotals: Record<string, number>;
  closingBalance: number;
  rowBagsTotal: number;
}) {
  const { exportColumns } = getExportLayout(ledgerExport as FarmerStockLedgerPdfData);
  const columnWidths = getDynamicColumnWidths(exportColumns);

  const getRowStyle = (row: PdfLedgerItem) => {
    if (row.kind === 'group') {
      return [styles.tableRow, styles.groupRow];
    }

    if (row.isOpeningBalance) {
      return [styles.tableRow, styles.highlightRow];
    }

    return [styles.tableRow];
  };

  const getRowKey = (row: PdfLedgerItem, index: number) => {
    if (row.kind === 'group') {
      return `group-${row.columnId}-${row.label}-${row.depth}-${index}`;
    }

    return `leaf-${row.gatePass}-${row.date}-${index}`;
  };

  return (
    <View style={styles.table}>
      <LedgerTableHeaderRow exportColumns={exportColumns} columnWidths={columnWidths} fixed />

      {data.map((row, index) => (
        <View key={getRowKey(row, index)} wrap={false} style={getRowStyle(row)}>
          {exportColumns.map((column, columnIndex) => {
            const depthPadding = row.kind === 'group' ? 8 + row.depth * 10 : 6 + row.depth * 8;

            if (column.id === 'variety' && row.kind === 'leaf') {
              return renderVarietyLedgerCell(
                row.suppressedGroupColumns.includes('variety') ? null : row.variety,
                column,
                columnWidths,
                depthPadding,
              );
            }

            const value =
              row.kind === 'group'
                ? getGroupCellValue(row, column, columnIndex)
                : getLeafCellValue(row, column, columnIndex);

            return renderLedgerDataCell(value, column, columnIndex, columnWidths, {
              isGroup: row.kind === 'group',
              isOpeningBalance: row.kind === 'leaf' ? row.isOpeningBalance : false,
              depthPadding,
            });
          })}
        </View>
      ))}

      {data.length > 0 ? (
        <View wrap={false} style={[styles.totalsRow, styles.highlightFooterRow]}>
          {exportColumns.map((column, columnIndex) => {
            let value: string | number = '';

            if (columnIndex === 0) {
              value = footerLabel;
            } else if (column.id.startsWith('size-')) {
              const size = column.id.replace(/^size-/, '');
              const sizeTotal = footerSizeTotals[size] ?? 0;
              value = sizeTotal !== 0 ? sizeTotal : '';
            } else if (column.id === 'rowBags') {
              value = rowBagsTotal > 0 ? rowBagsTotal : '';
            } else if (column.id === 'totalBags') {
              value = closingBalance;
            }

            return renderLedgerDataCell(value, column, columnIndex, columnWidths, {
              isGroup: columnIndex === 0,
              isFooterTotal: columnIndex === 0,
            });
          })}
        </View>
      ) : null}
    </View>
  );
}

function CenteredLetterhead({
  storageName,
  storageLocation,
  coldStorageLogo,
  generatedAt,
}: {
  storageName: string;
  storageLocation?: string;
  coldStorageLogo?: string;
  generatedAt: string;
}) {
  return (
    <View>
      <View style={styles.letterhead}>
        <View style={styles.headerLeft}>
          {coldStorageLogo ? (
            <Image src={coldStorageLogo} style={styles.logoMark} />
          ) : (
            <View style={styles.logoFallback}>
              <Text style={styles.logoFallbackText}>{storageName?.charAt(0) || 'C'}</Text>
            </View>
          )}
        </View>
        <View style={styles.headerCenter}>
          <Text style={styles.storageName}>{storageName}</Text>
          {storageLocation ? <Text style={styles.storageMeta}>{storageLocation}</Text> : null}
          <Text style={styles.reportTitleHeader}>Farmer Stock Ledger</Text>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.docRefBlock}>
            <Text style={styles.docRefLabel}>Generated On</Text>
            <Text style={styles.docRefValue}>{generatedAt}</Text>
          </View>
        </View>
      </View>
      <View style={styles.headerDivider} />
      <View style={styles.headerDividerThin} />
    </View>
  );
}

function LedgerReportFooter({ coldopLogo }: { coldopLogo?: string }) {
  return (
    <View style={styles.footer} fixed>
      <View style={styles.footerRule} />
      <View style={styles.footerRow}>
        <View style={styles.footerColLeft}>
          <Text style={styles.footerDisclosure}>Computer-generated ledger.</Text>
        </View>
        <View style={styles.footerColCenter}>
          <View style={styles.footerBrand}>
            {coldopLogo ? <Image src={coldopLogo} style={styles.footerBrandLogo} /> : null}
            <Text style={styles.footerBrandText}>
              Powered by <Text style={styles.footerBrandHighlight}>Coldop</Text>
            </Text>
          </View>
        </View>
        <View style={styles.footerColRight}>
          <Text
            style={styles.footerPage}
            render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
          />
        </View>
      </View>
    </View>
  );
}

function FarmerStockLedgerCoverPage({
  coldStorageName,
  coldStorageAddress,
  coldStorageLogo,
  coldopLogo,
  farmer,
  stats,
  stockSummary,
  sizeColumns,
  generatedAt,
}: FarmerStockLedgerReportProps) {
  const farmerAddressLines = farmer.address.split('\n').join('\n');

  return (
    <Page size="A4" orientation="landscape" style={styles.page} wrap>
      <CenteredLetterhead
        storageName={coldStorageName}
        storageLocation={coldStorageAddress}
        coldStorageLogo={coldStorageLogo}
        generatedAt={generatedAt}
      />

      <View style={styles.farmerSection}>
        <View style={styles.farmerCol}>
          <Text style={styles.reportEyebrow}>Account Of</Text>
          <Text style={styles.farmerName}>{farmer.name}</Text>
          <Text style={styles.farmerAddress}>{farmerAddressLines}</Text>
          <Text style={styles.farmerMobile}>{farmer.mobileNumber}</Text>
        </View>

        <View style={styles.farmerColRight}>
          <View style={styles.statBlock}>
            <View style={styles.statHeader}>
              <View style={styles.iconBoxIncoming}>
                <Svg width="10" height="10" viewBox="0 0 24 24">
                  <Path
                    d="M7 17L17 7 M7 17V8 M7 17H16"
                    stroke={COLOR.accent}
                    strokeWidth="2.5"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
              </View>
              <Text style={styles.statLabel}>Incoming</Text>
            </View>
            <Text style={styles.statMainVal}>
              {stats.incomingGatePassCount.toLocaleString('en-IN')} gate passes
            </Text>
            <Text style={[styles.statSubVal, { marginBottom: 2 }]}>
              {stats.incomingBags.toLocaleString('en-IN')} bags
            </Text>
            <Text style={styles.statSubVal}>
              {stats.incomingInternalBags.toLocaleString('en-IN')} bags (internal)
            </Text>
          </View>

          <View style={styles.statBlock}>
            <View style={styles.statHeader}>
              <View style={styles.iconBoxOutgoing}>
                <Svg width="10" height="10" viewBox="0 0 24 24">
                  <Path
                    d="M17 7L7 17 M17 7V16 M17 7H8"
                    stroke={COLOR.inkSoft}
                    strokeWidth="2.5"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
              </View>
              <Text style={styles.statLabel}>Outgoing</Text>
            </View>
            <Text style={styles.statMainVal}>
              {stats.outgoingGatePassCount.toLocaleString('en-IN')} gate passes
            </Text>
            <Text style={[styles.statSubVal, { marginBottom: 2 }]}>
              {stats.outgoingBags.toLocaleString('en-IN')} bags
            </Text>
            <Text style={styles.statSubVal}>
              {stats.outgoingInternalBags.toLocaleString('en-IN')} bags (internal)
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.sectionHeaderRow}>
        <View style={styles.sectionTick} />
        <Text style={styles.sectionTitle}>Stock Summary</Text>
        <View style={styles.sectionRule} />
      </View>
      <SummaryTable matrix={stockSummary} sizeColumns={sizeColumns} />

      <LedgerReportFooter coldopLogo={coldopLogo} />
    </Page>
  );
}

function FarmerStockLedgerIncomingPage({
  coldopLogo,
  incomingLedger,
  ledgerExport,
  incomingFooterSizes,
  incomingClosingBalance,
  stats,
}: {
  coldopLogo?: string;
  incomingLedger: PdfLedgerItem[];
  ledgerExport: LedgerExportContext;
  incomingFooterSizes: Record<string, number>;
  incomingClosingBalance: number;
  stats: FarmerStockLedgerReportProps['stats'];
}) {
  return (
    <Page size="A4" orientation="landscape" style={styles.page} wrap>
      <View style={styles.sectionHeaderRow}>
        <View style={styles.sectionTick} />
        <Text style={styles.sectionTitle}>Incoming Details</Text>
        <View style={styles.sectionRule} />
      </View>
      <View style={styles.ledgerTableSection}>
        <LedgerTable
          data={incomingLedger}
          ledgerExport={ledgerExport}
          footerLabel="Total"
          footerSizeTotals={incomingFooterSizes}
          closingBalance={incomingClosingBalance}
          rowBagsTotal={stats.incomingBags}
        />
      </View>

      <LedgerReportFooter coldopLogo={coldopLogo} />
    </Page>
  );
}

function FarmerStockLedgerOutgoingPage({
  coldopLogo,
  outgoingLedger,
  ledgerExport,
  outgoingFooterSizes,
  outgoingClosingBalance,
  stats,
}: {
  coldopLogo?: string;
  outgoingLedger: PdfLedgerItem[];
  ledgerExport: LedgerExportContext;
  outgoingFooterSizes: Record<string, number>;
  outgoingClosingBalance: number;
  stats: FarmerStockLedgerReportProps['stats'];
}) {
  return (
    <Page size="A4" orientation="landscape" style={styles.page} wrap>
      <View style={styles.sectionHeaderRow}>
        <View style={styles.sectionTick} />
        <Text style={styles.sectionTitle}>Outgoing Details</Text>
        <View style={styles.sectionRule} />
      </View>
      <LedgerTable
        data={outgoingLedger}
        ledgerExport={ledgerExport}
        footerLabel="Closing Balance"
        footerSizeTotals={outgoingFooterSizes}
        closingBalance={outgoingClosingBalance}
        rowBagsTotal={stats.outgoingBags}
      />

      <LedgerReportFooter coldopLogo={coldopLogo} />
    </Page>
  );
}

function FarmerStockLedgerPages(props: FarmerStockLedgerReportProps) {
  const ledgerExport: LedgerExportContext = {
    exportColumns: props.exportColumns,
    sizeColumns: props.sizeColumns,
    showStockFilter: props.showStockFilter,
    showCustomMarka: props.showCustomMarka,
  };

  return (
    <>
      <FarmerStockLedgerCoverPage {...props} />
      <FarmerStockLedgerIncomingPage
        coldopLogo={props.coldopLogo}
        incomingLedger={props.incomingLedger}
        ledgerExport={ledgerExport}
        incomingFooterSizes={props.incomingFooterSizes}
        incomingClosingBalance={props.incomingClosingBalance}
        stats={props.stats}
      />
      <FarmerStockLedgerOutgoingPage
        coldopLogo={props.coldopLogo}
        outgoingLedger={props.outgoingLedger}
        ledgerExport={ledgerExport}
        outgoingFooterSizes={props.outgoingFooterSizes}
        outgoingClosingBalance={props.outgoingClosingBalance}
        stats={props.stats}
      />
    </>
  );
}

export default function FarmerStockLedgerReport(props: FarmerStockLedgerReportProps) {
  return (
    <Document
      author="Coldop"
      keywords="cold storage, stock ledger, farmer report"
      subject="Farmer Stock Ledger"
      title={`${props.coldStorageName} - Ledger`}
    >
      <FarmerStockLedgerPages {...props} />
    </Document>
  );
}
