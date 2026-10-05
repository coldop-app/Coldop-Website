import { pdf } from '@react-pdf/renderer';
import QRCode from 'qrcode';

import IncomingGatePassQrPdf, {
  type QrVectorData,
} from '@/features/daybook/pdf/incoming-gate-pass-qr-pdf';
import { registerGatePassReportPdfFonts } from '@/lib/gate-pass-report-pdf/register-pdf-fonts';
import { absoluteUrl } from '@/lib/seo/site';

export type GenerateIncomingGatePassQrPdfInput = {
  gatePassId: string;
  gatePassNo: number;
  farmerName: string;
  lotNo: string;
  coldStorageName: string;
};

export function incomingGatePassDetailUrl(gatePassId: string) {
  return absoluteUrl(`/incoming-gate-pass/${gatePassId}`);
}

/**
 * Builds the QR symbol as vector module data so the PDF can draw it as a path
 * instead of a raster image. Level H lets the code survive up to ~30% damage
 * (frost, scuffing, torn corners) and still scan.
 */
export function buildQrVectorData(text: string): QrVectorData {
  const { modules } = QRCode.create(text, { errorCorrectionLevel: 'H' });
  const { size, data } = modules;

  // One path, one `M x y h1 v1 h-1 z` square per dark module, row-major.
  // Adjacent squares in a row are merged into a single wider rect to keep
  // the path small and avoid hairline seams between modules.
  const commands: string[] = [];
  for (let row = 0; row < size; row += 1) {
    let runStart = -1;
    for (let col = 0; col <= size; col += 1) {
      const dark = col < size && data[row * size + col] === 1;
      if (dark && runStart === -1) {
        runStart = col;
      } else if (!dark && runStart !== -1) {
        const width = col - runStart;
        commands.push(`M${runStart} ${row}h${width}v1h-${width}z`);
        runStart = -1;
      }
    }
  }

  return { size, path: commands.join('') };
}

export async function generateIncomingGatePassQrPdf({
  gatePassId,
  gatePassNo,
  farmerName,
  lotNo,
  coldStorageName,
}: GenerateIncomingGatePassQrPdfInput): Promise<Blob> {
  await registerGatePassReportPdfFonts();

  const qr = buildQrVectorData(incomingGatePassDetailUrl(gatePassId));

  return pdf(
    <IncomingGatePassQrPdf
      coldStorageName={coldStorageName}
      gatePassNo={gatePassNo}
      farmerName={farmerName}
      lotNo={lotNo}
      qr={qr}
    />,
  ).toBlob();
}
