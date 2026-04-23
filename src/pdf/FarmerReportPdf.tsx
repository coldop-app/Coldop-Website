import { Document, Page, StyleSheet, View } from '@react-pdf/renderer';
import type { DaybookEntry } from '@/services/store-admin/functions/useGetDaybook';
import { buildFarmerReportData } from './farmerReportCalculations';
import {
  DeliveryLedgerSection,
  FarmerInfoSection,
  FooterSection,
  HeaderSection,
  ReceiptLedgerSection,
  SummarySection,
} from './FarmerReportPdfComponents';

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
  /**
   * Canonical bag-size order from store preferences (e.g. `preferences.commodities[0].sizes`).
   * When set, table columns follow this order; sizes not listed in preferences stay at the end
   * in their original relative order.
   */
  preferenceSizeOrder?: string[];
  /** When true, group receipt and delivery tables by variety (only when not using special fields layout). */
  groupByVariety?: boolean;
  /** When true and special fields are shown, receipt details are grouped by ownership (OWNED / FARMER). */
  filterByOwnership?: boolean;
  /** Ownership report view when ownership filter is enabled. */
  ownershipReportView?: 'ALL' | 'OWNED' | 'FARMER';
}


/* ------------------------------------------------------------------ */
/* Styles */
/* ------------------------------------------------------------------ */

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#FEFDF8',
    padding: 16,
    paddingBottom: 24,
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
    marginVertical: 16,
  },
  ledgerTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  /** Section title after another table (e.g. incoming transfer) — extra top air */
  ledgerSubsectionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 18,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  varietySubtitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 6,
    backgroundColor: '#E9F3EC',
    borderWidth: 0.75,
    borderColor: '#8EAE97',
    borderRadius: 2,
    paddingVertical: 4,
    paddingHorizontal: 8,
    textTransform: 'uppercase',
  },
  varietySectionBlock: {
    marginTop: 4,
    marginBottom: 20,
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
  varietyGroupCell: {
    width: '100%',
    textAlign: 'left',
    fontWeight: 'bold',
    backgroundColor: '#DDEBDD',
    borderLeftWidth: 2,
    borderLeftColor: '#6D9473',
  },
  summary: {
    marginTop: 18,
    marginBottom: 10,
  },
  summaryGroupContainer: {
    marginBottom: 14,
  },
  summaryGroupContainerLast: {
    marginBottom: 0,
  },
  summaryOwnershipTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    backgroundColor: '#E3EDE5',
    borderWidth: 0.75,
    borderColor: '#8EAE97',
    borderRadius: 2,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginBottom: 6,
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
  summaryTableLabel: {
    width: '78%',
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 9,
    textTransform: 'uppercase',
    color: '#444',
    borderRightWidth: 0.5,
    borderRightColor: '#999',
  },
  summaryTableValue: {
    width: '22%',
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 11,
    textAlign: 'right',
    fontWeight: 'bold',
  },
  summaryTableClosingLabel: {
    fontWeight: 'bold',
    color: '#111',
  },
  summaryTableClosingValue: {
    fontSize: 12,
    color: '#111',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopWidth: 1.5,
    borderTopColor: '#000',
    backgroundColor: '#F2F2F2',
    borderRadius: 4,
    marginTop: 0,
    paddingTop: 8,
    paddingBottom: 8,
    fontSize: 10,
  },
  footerSpacer: {
    flexGrow: 1,
    minHeight: 8,
  },
  footerBrandWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  footerLogo: {
    width: 26,
    height: 26,
  },
  poweredBy: {
    fontSize: 10,
    color: '#2B2B2B',
    fontWeight: 'bold',
  },
});

export type FarmerReportPdfStyles = typeof styles;

export function FarmerReportPdf({
  companyName,
  farmer,
  storeAdmin,
  reportDate,
  incoming,
  outgoing,
  sizeColumns,
  preferenceSizeOrder,
  groupByVariety = false,
  filterByOwnership = false,
  ownershipReportView = 'ALL',
}: FarmerReportPdfProps) {
  const computedData = buildFarmerReportData({
    storeAdminMobileNumber: storeAdmin?.mobileNumber,
    incoming,
    outgoing,
    sizeColumns,
    preferenceSizeOrder,
    groupByVariety,
    filterByOwnership,
    ownershipReportView,
  });

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <HeaderSection companyName={companyName} styles={styles} />
        <FarmerInfoSection farmer={farmer} reportDate={reportDate} styles={styles} />
        <SummarySection data={computedData} styles={styles} />
        <ReceiptLedgerSection data={computedData} groupByVariety={groupByVariety} styles={styles} />
        <DeliveryLedgerSection data={computedData} groupByVariety={groupByVariety} styles={styles} />
        <View style={styles.footerSpacer} />
        <FooterSection styles={styles} />

      </Page>
    </Document>
  );
}
