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

// 1 mm = 72/25.4 pt. Page media box is A4 (210 × 297 mm).
const MM = 72 / 25.4;

// Die-cut vinyl, 8 stickers per A4 (Avery L7165 / EU30008 geometry).
// 4.65 + 99.1 + 2.5 + 99.1 + 4.65 = 210
// 13.1 + 67.7 × 4 + 13.1 = 297
const LABEL_W_MM = 99.1;
const LABEL_H_MM = 67.7;
const MARGIN_LEFT_MM = 4.65;
const MARGIN_TOP_MM = 13.1;
const GAP_X_MM = 2.5;
const GAP_Y_MM = 0;
const COLUMNS = 2;
const ROWS = 4;
const LABEL_COUNT = COLUMNS * ROWS;

const LABEL_W_PT = LABEL_W_MM * MM;
const LABEL_H_PT = LABEL_H_MM * MM;
const A4_WIDTH_PT = 210 * MM;
const A4_HEIGHT_PT = 297 * MM;

// QR quiet zone per ISO/IEC 18004: at least 4 modules on every side.
const QR_QUIET_ZONE_MODULES = 4;

// Drawn inside the rotated stack, where the sticker's long edge is the height.
// ~46 mm including quiet zone.
const QR_RENDER_SIZE_PT = 130;

const INK = '#000000';
const PAPER = '#ffffff';

const styles = StyleSheet.create({
  page: {
    padding: 0,
    fontFamily: 'Inter',
    backgroundColor: PAPER,
    color: INK,
  },
  // In-flow box. Absolute stickers do not give the page a height, so without
  // this the media box collapses to 0.
  sheet: {
    width: A4_WIDTH_PT,
    height: A4_HEIGHT_PT,
  },
  sticker: {
    position: 'absolute',
    width: LABEL_W_PT,
    height: LABEL_H_PT,
    overflow: 'hidden',
  },
  // Portrait stack turned 90° so it runs along the 99.1 mm edge.
  // Centered in the landscape sticker, then rotated about its own center.
  rotated: {
    position: 'absolute',
    width: LABEL_H_PT,
    height: LABEL_W_PT,
    left: (LABEL_W_PT - LABEL_H_PT) / 2,
    top: (LABEL_H_PT - LABEL_W_PT) / 2,
    transform: 'rotate(-90deg)',
    paddingHorizontal: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 8,
  },
  store: {
    fontSize: 7,
    lineHeight: 1,
    fontWeight: 700,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    textAlign: 'center',
    maxLines: 1,
    textOverflow: 'ellipsis',
    marginBottom: 7,
  },
  title: {
    fontFamily: 'Outfit',
    fontSize: 16,
    lineHeight: 1,
    fontWeight: 700,
    letterSpacing: -0.2,
    textAlign: 'center',
    maxLines: 1,
    textOverflow: 'ellipsis',
  },
  farmer: {
    marginTop: 3,
    fontSize: 8,
    lineHeight: 1.15,
    fontWeight: 400,
    textAlign: 'center',
    maxLines: 2,
    textOverflow: 'ellipsis',
  },
  qrWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  markaBlock: {
    width: '100%',
    alignItems: 'center',
    marginTop: 8,
  },
  markaLabel: {
    fontSize: 6,
    lineHeight: 1,
    fontWeight: 700,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  marka: {
    marginTop: 2,
    fontFamily: 'Outfit',
    fontSize: 18,
    lineHeight: 1,
    fontWeight: 700,
    letterSpacing: -0.3,
    textAlign: 'center',
    maxLines: 1,
    textOverflow: 'ellipsis',
  },
  footer: {
    marginTop: 8,
    fontSize: 6,
    lineHeight: 1,
    fontWeight: 400,
    letterSpacing: 0.6,
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
        <Path d={qr.path} fill={INK} stroke="none" />
      </Svg>
    </View>
  );
}

function GatePassLabel({
  coldStorageName,
  gatePassNo,
  farmerName,
  lotNo,
  qr,
}: IncomingGatePassQrPdfProps) {
  return (
    <>
      <View style={styles.header}>
        <Text style={styles.store}>{coldStorageName}</Text>
        <Text style={styles.title}>IGP #{gatePassNo}</Text>
        <Text style={styles.farmer}>{farmerName}</Text>
      </View>

      <QrSymbol qr={qr} />

      <View style={styles.markaBlock}>
        <Text style={styles.markaLabel}>Marka</Text>
        <Text style={styles.marka}>{lotNo}</Text>
      </View>

      <Text style={styles.footer}>
        {COLDOP_BRANDING.label}
        <Text style={styles.footerBrand}>{COLDOP_BRANDING.name}</Text>
      </Text>
    </>
  );
}

function stickerOffset(index: number) {
  const column = index % COLUMNS;
  const row = Math.floor(index / COLUMNS);

  return {
    left: (MARGIN_LEFT_MM + column * (LABEL_W_MM + GAP_X_MM)) * MM,
    top: (MARGIN_TOP_MM + row * (LABEL_H_MM + GAP_Y_MM)) * MM,
  };
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
        Eight stickers on portrait A4, placed on the 99.1 × 67.7 mm die-cut.
        Nothing is drawn in the gutters: the sheet's own white gaps separate
        the stickers. Each label is rotated -90° so the stack follows the
        long edge.
      */}
      <Page size="A4" wrap={false} style={styles.page}>
        <View style={styles.sheet} />
        {Array.from({ length: LABEL_COUNT }, (_, index) => (
          <View key={index} style={[styles.sticker, stickerOffset(index)]}>
            <View style={styles.rotated}>
              <GatePassLabel
                coldStorageName={coldStorageName}
                gatePassNo={gatePassNo}
                farmerName={farmerName}
                lotNo={lotNo}
                qr={qr}
              />
            </View>
          </View>
        ))}
      </Page>
    </Document>
  );
}
