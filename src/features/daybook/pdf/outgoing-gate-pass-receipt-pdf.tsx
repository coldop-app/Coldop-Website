import { Document, Image, Page, StyleSheet, Text, View } from '@react-pdf/renderer';

import type { OutgoingGatePassReceiptPdfData } from '@/features/daybook/utils/build-outgoing-gate-pass-pdf-data';
import { registerGatePassReportPdfFonts } from '@/lib/gate-pass-report-pdf/register-pdf-fonts';
import { COLDOP_BRANDING } from '@/lib/export-report-theme';

registerGatePassReportPdfFonts();

export type OutgoingGatePassReceiptPdfProps = OutgoingGatePassReceiptPdfData & {
  coldStorageName: string;
  coldStorageAddress?: string;
  coldStorageLogo?: string;
};

const COLOR = {
  ink: '#09090b',
  inkSoft: '#71717a',
  inkMuted: '#a1a1aa',
  hairline: '#e4e4e7',
  hairlineStrong: '#09090b',
  paper: '#ffffff',
  wash: '#f8f9fa',
  accent: '#008235',
  accentWash: '#ecfdf5',
  zebra: '#fafafa',
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
    fontSize: 24,
    fontFamily: 'Outfit',
    fontWeight: 700,
    color: COLOR.ink,
    letterSpacing: -0.5,
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
    color: COLOR.accent,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
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
    fontSize: 11,
    color: COLOR.accent,
    fontFamily: 'Inter',
    fontWeight: 700,
    letterSpacing: 0.3,
    marginTop: 2,
  },
  docRefSub: {
    fontSize: 8,
    color: COLOR.inkSoft,
    marginTop: 4,
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
  panel: {
    borderWidth: 1,
    borderColor: COLOR.hairline,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 24,
  },
  voucherRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: COLOR.hairline,
  },
  vLabel: {
    backgroundColor: COLOR.wash,
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderRightWidth: 1,
    borderRightColor: COLOR.hairline,
    justifyContent: 'center',
  },
  vLabelText: {
    fontSize: 7.5,
    fontFamily: 'Inter',
    fontWeight: 700,
    color: COLOR.inkMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  vValue: {
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderRightWidth: 1,
    borderRightColor: COLOR.hairline,
    justifyContent: 'center',
    backgroundColor: COLOR.paper,
  },
  vValueText: {
    fontSize: 9.5,
    fontFamily: 'Inter',
    fontWeight: 400,
    color: COLOR.ink,
  },
  w15: { width: '15%' },
  w35: { width: '35%' },
  w85: { width: '85%' },
  noBorderRight: { borderRightWidth: 0 },
  noBorderBottom: { borderBottomWidth: 0 },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
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
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: COLOR.wash,
    borderTopWidth: 0.75,
    borderTopColor: COLOR.ink,
    borderBottomWidth: 1.25,
    borderBottomColor: COLOR.ink,
    paddingVertical: 9,
    paddingHorizontal: 10,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: COLOR.hairline,
    alignItems: 'center',
  },
  tableRowAlt: {
    backgroundColor: COLOR.zebra,
  },
  tableTotalRow: {
    flexDirection: 'row',
    backgroundColor: COLOR.accentWash,
    borderLeftWidth: 3,
    borderLeftColor: COLOR.accent,
    borderTopWidth: 0.75,
    borderTopColor: COLOR.ink,
    paddingVertical: 9,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  colSize: { flex: 1.4 },
  colVariety: { flex: 1.4 },
  colLocation: { flex: 1.2 },
  colRef: { flex: 0.9 },
  colNumeric: { flex: 0.9, textAlign: 'right' },
  colTextHeader: {
    fontSize: 7,
    fontFamily: 'Inter',
    fontWeight: 700,
    color: COLOR.ink,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  colTextData: {
    fontSize: 9,
    color: COLOR.ink,
  },
  colTextMuted: {
    fontSize: 9,
    color: COLOR.inkSoft,
  },
  colTextRef: {
    fontSize: 9,
    fontFamily: 'Inter',
    fontWeight: 700,
    color: COLOR.ink,
  },
  colTextTotal: {
    fontSize: 9,
    fontFamily: 'Inter',
    fontWeight: 700,
    color: COLOR.ink,
  },
  colTextTotalAccent: {
    fontSize: 9,
    fontFamily: 'Inter',
    fontWeight: 700,
    color: COLOR.accent,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  remarksText: {
    fontSize: 9,
    color: COLOR.inkSoft,
    lineHeight: 1.5,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 34,
    right: 34,
  },
  footerRule: {
    borderTopWidth: 0.5,
    borderTopColor: COLOR.hairline,
    marginBottom: 8,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
  footerDisclosure: {
    fontSize: 7,
    color: COLOR.inkMuted,
  },
  footerBrandText: {
    fontSize: 7,
    color: COLOR.inkMuted,
    letterSpacing: 0.4,
  },
  footerBrandHighlight: {
    fontFamily: 'Inter',
    fontWeight: 700,
    color: COLOR.inkSoft,
  },
  footerPage: {
    fontSize: 7,
    color: COLOR.inkMuted,
  },
});

function SectionHeader({ title }: { title: string }) {
  return (
    <View style={styles.sectionHeaderRow}>
      <View style={styles.sectionTick} />
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionRule} />
    </View>
  );
}

function CenteredLetterhead({
  storageName,
  storageLocation,
  coldStorageLogo,
  gatePassLabel,
  manualParchi,
}: {
  storageName: string;
  storageLocation?: string;
  coldStorageLogo?: string;
  gatePassLabel: string;
  manualParchi: string | null;
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
          <Text style={styles.reportTitleHeader}>Outgoing Gate Pass</Text>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.docRefBlock}>
            <Text style={styles.docRefLabel}>Gate Pass No.</Text>
            <Text style={styles.docRefValue}>{gatePassLabel}</Text>
            {manualParchi ? <Text style={styles.docRefSub}>Manual: {manualParchi}</Text> : null}
          </View>
        </View>
      </View>
      <View style={styles.headerDivider} />
      <View style={styles.headerDividerThin} />
    </View>
  );
}

function OutgoingGatePassReceiptPage({
  coldStorageName,
  coldStorageAddress,
  coldStorageLogo,
  gatePassLabel,
  manualParchi,
  accountNo,
  farmerName,
  variety,
  date,
  createdBy,
  truckNo,
  fromLocation,
  toLocation,
  isNull,
  nulledBy,
  orderRows,
  totalIssued,
  remarks,
}: OutgoingGatePassReceiptPdfProps) {
  const hasTruckNo = Boolean(truckNo);
  const hasFrom = Boolean(fromLocation);
  const hasTo = Boolean(toLocation);
  const showRoute = hasFrom || hasTo;
  const varietyIsLast = !showRoute && !isNull;
  const routeIsLast = showRoute && !isNull;

  return (
    <Page size="A4" style={styles.page}>
      <CenteredLetterhead
        storageName={coldStorageName}
        storageLocation={coldStorageAddress}
        coldStorageLogo={coldStorageLogo}
        gatePassLabel={gatePassLabel}
        manualParchi={manualParchi}
      />

      <View>
        <SectionHeader title="Delivery Information" />

        <View style={styles.panel}>
          <View style={styles.voucherRow}>
            <View style={[styles.vLabel, styles.w15]}>
              <Text style={styles.vLabelText}>Name</Text>
            </View>
            <View style={[styles.vValue, styles.w35]}>
              <Text style={styles.vValueText}>{farmerName}</Text>
            </View>
            <View style={[styles.vLabel, styles.w15]}>
              <Text style={styles.vLabelText}>A/c No</Text>
            </View>
            <View style={[styles.vValue, styles.w35, styles.noBorderRight]}>
              <Text style={styles.vValueText}>{accountNo}</Text>
            </View>
          </View>

          <View style={styles.voucherRow}>
            <View style={[styles.vLabel, styles.w15]}>
              <Text style={styles.vLabelText}>Date</Text>
            </View>
            <View style={[styles.vValue, styles.w35]}>
              <Text style={styles.vValueText}>{date}</Text>
            </View>
            <View style={[styles.vLabel, styles.w15]}>
              <Text style={styles.vLabelText}>Created By</Text>
            </View>
            <View style={[styles.vValue, styles.w35, styles.noBorderRight]}>
              <Text style={styles.vValueText}>{createdBy}</Text>
            </View>
          </View>

          {hasTruckNo ? (
            <View style={[styles.voucherRow, ...(varietyIsLast ? [styles.noBorderBottom] : [])]}>
              <View style={[styles.vLabel, styles.w15]}>
                <Text style={styles.vLabelText}>Variety</Text>
              </View>
              <View style={[styles.vValue, styles.w35]}>
                <Text style={styles.vValueText}>{variety}</Text>
              </View>
              <View style={[styles.vLabel, styles.w15]}>
                <Text style={styles.vLabelText}>Truck No</Text>
              </View>
              <View style={[styles.vValue, styles.w35, styles.noBorderRight]}>
                <Text style={styles.vValueText}>{truckNo}</Text>
              </View>
            </View>
          ) : (
            <View style={[styles.voucherRow, ...(varietyIsLast ? [styles.noBorderBottom] : [])]}>
              <View style={[styles.vLabel, styles.w15]}>
                <Text style={styles.vLabelText}>Variety</Text>
              </View>
              <View style={[styles.vValue, styles.w85, styles.noBorderRight]}>
                <Text style={styles.vValueText}>{variety}</Text>
              </View>
            </View>
          )}

          {showRoute && hasFrom && hasTo ? (
            <View style={[styles.voucherRow, ...(routeIsLast ? [styles.noBorderBottom] : [])]}>
              <View style={[styles.vLabel, styles.w15]}>
                <Text style={styles.vLabelText}>From</Text>
              </View>
              <View style={[styles.vValue, styles.w35]}>
                <Text style={styles.vValueText}>{fromLocation}</Text>
              </View>
              <View style={[styles.vLabel, styles.w15]}>
                <Text style={styles.vLabelText}>To</Text>
              </View>
              <View style={[styles.vValue, styles.w35, styles.noBorderRight]}>
                <Text style={styles.vValueText}>{toLocation}</Text>
              </View>
            </View>
          ) : null}

          {showRoute && hasFrom && !hasTo ? (
            <View style={[styles.voucherRow, ...(routeIsLast ? [styles.noBorderBottom] : [])]}>
              <View style={[styles.vLabel, styles.w15]}>
                <Text style={styles.vLabelText}>From</Text>
              </View>
              <View style={[styles.vValue, styles.w85, styles.noBorderRight]}>
                <Text style={styles.vValueText}>{fromLocation}</Text>
              </View>
            </View>
          ) : null}

          {showRoute && !hasFrom && hasTo ? (
            <View style={[styles.voucherRow, ...(routeIsLast ? [styles.noBorderBottom] : [])]}>
              <View style={[styles.vLabel, styles.w15]}>
                <Text style={styles.vLabelText}>To</Text>
              </View>
              <View style={[styles.vValue, styles.w85, styles.noBorderRight]}>
                <Text style={styles.vValueText}>{toLocation}</Text>
              </View>
            </View>
          ) : null}

          {isNull ? (
            <View style={[styles.voucherRow, styles.noBorderBottom]}>
              <View style={[styles.vLabel, styles.w15]}>
                <Text style={styles.vLabelText}>Status</Text>
              </View>
              <View style={[styles.vValue, styles.w35]}>
                <Text style={styles.vValueText}>Null</Text>
              </View>
              <View style={[styles.vLabel, styles.w15]}>
                <Text style={styles.vLabelText}>Nulled By</Text>
              </View>
              <View style={[styles.vValue, styles.w35, styles.noBorderRight]}>
                <Text style={styles.vValueText}>{nulledBy ?? '—'}</Text>
              </View>
            </View>
          ) : null}
        </View>

        <SectionHeader title="Order Details" />

        <View style={styles.panel}>
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.colSize, styles.colTextHeader]}>Size</Text>
            <Text style={[styles.colVariety, styles.colTextHeader]}>Variety</Text>
            <Text style={[styles.colLocation, styles.colTextHeader]}>Location</Text>
            <Text style={[styles.colRef, styles.colTextHeader]}>Ref</Text>
            <Text style={[styles.colNumeric, styles.colTextHeader]}>Issued</Text>
          </View>

          {orderRows.map((row, index) => (
            <View
              key={`${row.bagSize}-${row.location}-${index}`}
              style={[styles.tableRow, ...(index % 2 === 1 ? [styles.tableRowAlt] : [])]}
            >
              <Text style={[styles.colSize, styles.colTextData]}>{row.bagSize}</Text>
              <Text style={[styles.colVariety, styles.colTextData]}>{row.variety}</Text>
              <Text style={[styles.colLocation, styles.colTextMuted]}>{row.location}</Text>
              <Text style={[styles.colRef, styles.colTextRef]}>
                {row.refGatePassNo !== null ? `#${row.refGatePassNo}` : '—'}
              </Text>
              <Text style={[styles.colNumeric, styles.colTextData]}>
                {row.issuedQty.toLocaleString('en-IN')}
              </Text>
            </View>
          ))}

          <View style={styles.tableTotalRow}>
            <Text style={[styles.colSize, styles.colTextTotalAccent]}>Total</Text>
            <Text style={[styles.colVariety, styles.colTextTotal]} />
            <Text style={[styles.colLocation, styles.colTextTotal]} />
            <Text style={[styles.colRef, styles.colTextTotal]} />
            <Text style={[styles.colNumeric, styles.colTextTotal]}>
              {totalIssued.toLocaleString('en-IN')}
            </Text>
          </View>
        </View>

        {remarks ? (
          <>
            <SectionHeader title="Remarks" />
            <View style={styles.panel}>
              <Text style={styles.remarksText}>{remarks}</Text>
            </View>
          </>
        ) : null}
      </View>

      <View style={styles.footer} fixed>
        <View style={styles.footerRule} />
        <View style={styles.footerRow}>
          <View style={styles.footerColLeft}>
            <Text style={styles.footerDisclosure}>Computer-generated receipt.</Text>
          </View>
          <View style={styles.footerColCenter}>
            <Text style={styles.footerBrandText}>
              {COLDOP_BRANDING.label}
              <Text style={styles.footerBrandHighlight}>{COLDOP_BRANDING.name}</Text>
            </Text>
          </View>
          <View style={styles.footerColRight}>
            <Text
              style={styles.footerPage}
              render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
            />
          </View>
        </View>
      </View>
    </Page>
  );
}

export default function OutgoingGatePassReceiptPdf(props: OutgoingGatePassReceiptPdfProps) {
  return (
    <Document
      author="Coldop"
      keywords="cold storage, outgoing gate pass, receipt"
      subject="Outgoing Gate Pass Receipt"
      title={`${props.coldStorageName} - ${props.gatePassLabel}`}
    >
      <OutgoingGatePassReceiptPage {...props} />
    </Document>
  );
}
