import { pdf } from '@react-pdf/renderer';

import OutgoingGatePassReceiptPdf from '@/features/daybook/pdf/outgoing-gate-pass-receipt-pdf';
import {
  buildOutgoingGatePassPdfData,
  type BuildOutgoingGatePassPdfDataInput,
} from '@/features/daybook/utils/build-outgoing-gate-pass-pdf-data';

export type GenerateOutgoingGatePassPdfInput = BuildOutgoingGatePassPdfDataInput & {
  coldStorageName: string;
  coldStorageAddress?: string;
  coldStorageLogo?: string;
};

export async function generateOutgoingGatePassPdf({
  coldStorageName,
  coldStorageAddress,
  coldStorageLogo,
  ...buildInput
}: GenerateOutgoingGatePassPdfInput): Promise<Blob> {
  const pdfData = buildOutgoingGatePassPdfData(buildInput);

  const doc = (
    <OutgoingGatePassReceiptPdf
      {...pdfData}
      coldStorageName={coldStorageName}
      coldStorageAddress={coldStorageAddress}
      coldStorageLogo={coldStorageLogo}
    />
  );

  return pdf(doc).toBlob();
}
