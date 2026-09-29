import { pdf } from '@react-pdf/renderer';
import QRCode from 'qrcode';

import IncomingGatePassQrPdf from '@/features/daybook/pdf/incoming-gate-pass-qr-pdf';
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

export async function generateIncomingGatePassQrPdf({
  gatePassId,
  gatePassNo,
  farmerName,
  lotNo,
  coldStorageName,
}: GenerateIncomingGatePassQrPdfInput): Promise<Blob> {
  await registerGatePassReportPdfFonts();

  const url = incomingGatePassDetailUrl(gatePassId);
  const qrDataUrl = await QRCode.toDataURL(url, {
    errorCorrectionLevel: 'M',
    margin: 1,
    width: 512,
  });

  return pdf(
    <IncomingGatePassQrPdf
      coldStorageName={coldStorageName}
      gatePassNo={gatePassNo}
      farmerName={farmerName}
      lotNo={lotNo}
      qrDataUrl={qrDataUrl}
    />,
  ).toBlob();
}
