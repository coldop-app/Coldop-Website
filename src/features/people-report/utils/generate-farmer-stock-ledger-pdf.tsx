import { pdf } from '@react-pdf/renderer';

import FarmerStockLedgerReport from '@/features/people-report/pdf/farmer-stock-ledger-report-pdf';
import {
  buildFarmerStockLedgerPdfData,
  type BuildFarmerStockLedgerPdfDataInput,
} from '@/features/people-report/utils/build-farmer-stock-ledger-pdf-data';

export type GenerateFarmerStockLedgerPdfInput = BuildFarmerStockLedgerPdfDataInput & {
  coldStorageName: string;
  coldStorageAddress?: string;
  coldStorageLogo?: string;
};

export async function generateFarmerStockLedgerPdf({
  coldStorageName,
  coldStorageAddress,
  coldStorageLogo,
  ...buildInput
}: GenerateFarmerStockLedgerPdfInput): Promise<Blob> {
  const pdfData = buildFarmerStockLedgerPdfData({
    ...buildInput,
    generatedAt: new Date(),
  });

  const doc = (
    <FarmerStockLedgerReport
      {...pdfData}
      coldStorageName={coldStorageName}
      coldStorageAddress={coldStorageAddress}
      coldStorageLogo={coldStorageLogo}
    />
  );

  return pdf(doc).toBlob();
}
