import { pdf } from '@react-pdf/renderer';

import IncomingGatePassReceiptPdf from '@/features/daybook/pdf/incoming-gate-pass-receipt-pdf';
import {
  buildIncomingGatePassPdfData,
  type BuildIncomingGatePassPdfDataInput,
} from '@/features/daybook/utils/build-incoming-gate-pass-pdf-data';
import { registerGatePassReportPdfFonts } from '@/lib/gate-pass-report-pdf/register-pdf-fonts';

export type GenerateIncomingGatePassPdfInput = BuildIncomingGatePassPdfDataInput & {
  coldStorageName: string;
  coldStorageAddress?: string;
  coldStorageLogo?: string;
};

export async function generateIncomingGatePassPdf({
  coldStorageName,
  coldStorageAddress,
  coldStorageLogo,
  ...buildInput
}: GenerateIncomingGatePassPdfInput): Promise<Blob> {
  await registerGatePassReportPdfFonts();

  const pdfData = buildIncomingGatePassPdfData(buildInput);

  const doc = (
    <IncomingGatePassReceiptPdf
      {...pdfData}
      coldStorageName={coldStorageName}
      coldStorageAddress={coldStorageAddress}
      coldStorageLogo={coldStorageLogo}
    />
  );

  return pdf(doc).toBlob();
}
