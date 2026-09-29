import { Document, Image, Page, StyleSheet, Text, View } from '@react-pdf/renderer';

export type IncomingGatePassQrPdfProps = {
  coldStorageName: string;
  gatePassNo: number;
  farmerName: string;
  lotNo: string;
  qrDataUrl: string;
};

const COLOR = {
  ink: '#09090b',
  muted: '#71717a',
  line: '#e4e4e7',
  accent: '#008235',
  wash: '#f4f4f5',
};

const styles = StyleSheet.create({
  page: {
    paddingTop: 22,
    paddingBottom: 22,
    paddingHorizontal: 24,
    fontFamily: 'Inter',
    backgroundColor: '#ffffff',
    color: COLOR.ink,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    width: '100%',
  },
  store: {
    fontSize: 9,
    fontWeight: 600,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: COLOR.accent,
    textAlign: 'center',
  },
  rule: {
    marginTop: 8,
    width: 36,
    height: 2,
    backgroundColor: COLOR.accent,
  },
  title: {
    marginTop: 10,
    fontSize: 20,
    fontWeight: 600,
    textAlign: 'center',
  },
  farmer: {
    marginTop: 3,
    fontSize: 11,
    color: COLOR.muted,
    textAlign: 'center',
  },
  qrFrame: {
    marginTop: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: COLOR.line,
    borderRadius: 8,
    backgroundColor: COLOR.wash,
  },
  qr: {
    width: 168,
    height: 168,
  },
  markaBlock: {
    marginTop: 14,
    alignItems: 'center',
    width: '100%',
  },
  markaLabel: {
    fontSize: 8,
    fontWeight: 600,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: COLOR.muted,
    textAlign: 'center',
  },
  marka: {
    marginTop: 3,
    fontSize: 16,
    fontWeight: 600,
    textAlign: 'center',
  },
});

export default function IncomingGatePassQrPdf({
  coldStorageName,
  gatePassNo,
  farmerName,
  lotNo,
  qrDataUrl,
}: IncomingGatePassQrPdfProps) {
  return (
    <Document title={`IGP ${gatePassNo} QR`}>
      <Page size="A6" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.store}>{coldStorageName}</Text>
          <View style={styles.rule} />
          <Text style={styles.title}>IGP #{gatePassNo}</Text>
          <Text style={styles.farmer}>{farmerName}</Text>
          <View style={styles.qrFrame}>
            <Image src={qrDataUrl} style={styles.qr} />
          </View>
        </View>
        <View style={styles.markaBlock}>
          <Text style={styles.markaLabel}>Marka</Text>
          <Text style={styles.marka}>{lotNo}</Text>
        </View>
      </Page>
    </Document>
  );
}
