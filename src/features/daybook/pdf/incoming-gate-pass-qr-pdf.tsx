import { Document, Page, Path, StyleSheet, Svg, Text, View } from '@react-pdf/renderer';

import { COLDOP_BRANDING } from '@/lib/export-branding';

/**
 * Vector QR module data: `size` modules per side and a single SVG path drawing
 * every dark module in a `size × size` unit grid (quiet zone excluded).
 */
export type QrVectorData = {
  size: number;
  path: string;
};

export type IncomingGatePassQrPdfProps = {
  coldStorageName: string;
  gatePassNo: number;
  farmerName: string;
  lotNo: string;
  qr: QrVectorData;
};

// 8.9 cm × 11.4 cm label stock for 4-inch thermal label printers (TSC TH series etc).
// 1 in = 72 pt = 2.54 cm.
const CM = 72 / 2.54;
const LABEL_WIDTH_PT = 8.9 * CM;
const LABEL_HEIGHT_PT = 11.4 * CM;

// Printer-safe margin so nothing lands in the unprintable edge of the label.
const LABEL_MARGIN_PT = 12;

// QR quiet zone per ISO/IEC 18004: at least 4 modules on every side.
const QR_QUIET_ZONE_MODULES = 4;

// QR side length. ~5.3 cm leaves room for a two-line farmer name, marka and
// footer on an 11.4 cm label while keeping ≥8 printer dots per module at
// 203 dpi for a version-7 (45-module) code plus quiet zone.
const QR_RENDER_SIZE_PT = 150;

// Pure black on white only. Thermal printers cannot render grey; any tint
// becomes dithering noise that hurts scan reliability.
const INK = '#000000';
const PAPER = '#ffffff';

const HAIRLINE_PT = 0.75;

const styles = StyleSheet.create({
  page: {
    padding: LABEL_MARGIN_PT,
    fontFamily: 'Inter',
    backgroundColor: PAPER,
    color: INK,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  block: {
    width: '100%',
    alignItems: 'center',
  },
  rule: {
    width: '100%',
    height: HAIRLINE_PT,
    backgroundColor: INK,
  },
  store: {
    fontSize: 7.5,
    fontWeight: 700,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    textAlign: 'center',
    maxLines: 1,
    textOverflow: 'ellipsis',
  },
  headerRule: {
    marginTop: 5,
    marginBottom: 6,
  },
  title: {
    fontFamily: 'Outfit',
    fontSize: 26,
    fontWeight: 700,
    letterSpacing: -0.3,
    textAlign: 'center',
    maxLines: 1,
    textOverflow: 'ellipsis',
  },
  farmer: {
    marginTop: 3,
    fontSize: 10,
    fontWeight: 400,
    lineHeight: 1.25,
    textAlign: 'center',
    maxLines: 2,
    textOverflow: 'ellipsis',
  },
  qrWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  markaLabel: {
    fontSize: 7,
    fontWeight: 700,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  marka: {
    marginTop: 2,
    fontFamily: 'Outfit',
    fontSize: 28,
    fontWeight: 700,
    letterSpacing: -0.4,
    textAlign: 'center',
    maxLines: 1,
    textOverflow: 'ellipsis',
  },
  footerRule: {
    marginBottom: 4,
  },
  footer: {
    fontSize: 6.5,
    fontWeight: 400,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  footerBrand: {
    fontWeight: 700,
  },
});

function QrSymbol({ qr }: { qr: QrVectorData }) {
  const total = qr.size + QR_QUIET_ZONE_MODULES * 2;

  return (
    <View style={styles.qrWrap}>
      <Svg
        width={QR_RENDER_SIZE_PT}
        height={QR_RENDER_SIZE_PT}
        viewBox={`${-QR_QUIET_ZONE_MODULES} ${-QR_QUIET_ZONE_MODULES} ${total} ${total}`}
      >
        {/* Vector path: scales to the printer's native dots without resampling. */}
        <Path d={qr.path} fill={INK} stroke="none" />
      </Svg>
    </View>
  );
}

export default function IncomingGatePassQrPdf({
  coldStorageName,
  gatePassNo,
  farmerName,
  lotNo,
  qr,
}: IncomingGatePassQrPdfProps) {
  return (
    <Document title={`IGP ${gatePassNo} QR`}>
      {/*
        One tag = one label. The page stays a true 8.9 × 11.4 cm (a non-wrapping
        Page would shrink to its content and confuse the printer's media size),
        and every text block is capped to a fixed line count so the content
        height is bounded and can never spill onto a second label.
      */}
      <Page size={[LABEL_WIDTH_PT, LABEL_HEIGHT_PT]} style={styles.page}>
        <View style={styles.block}>
          <Text style={styles.store}>{coldStorageName}</Text>
          <View style={[styles.rule, styles.headerRule]} />
          <Text style={styles.title}>IGP #{gatePassNo}</Text>
          <Text style={styles.farmer}>{farmerName}</Text>
        </View>

        <QrSymbol qr={qr} />

        <View style={styles.block}>
          <Text style={styles.markaLabel}>Marka</Text>
          <Text style={styles.marka}>{lotNo}</Text>
        </View>

        <View style={styles.block}>
          <View style={[styles.rule, styles.footerRule]} />
          <Text style={styles.footer}>
            {COLDOP_BRANDING.label}
            <Text style={styles.footerBrand}>{COLDOP_BRANDING.name}</Text>
          </Text>
        </View>
      </Page>
    </Document>
  );
}
