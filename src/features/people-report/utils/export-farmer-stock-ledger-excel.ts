import { downloadBlob } from '@/lib/download-blob';

import {
  buildFarmerStockLedgerExcelPackage,
  type BuildFarmerStockLedgerExcelPackageInput,
} from './build-farmer-stock-ledger-excel';

export type ExportFarmerStockLedgerExcelInput = BuildFarmerStockLedgerExcelPackageInput;

export {
  buildFarmerStockLedgerExcelPackage,
  buildFarmerStockLedgerPreviewData,
  getExportDateLabel,
  hasFarmerStockLedgerExportRows,
} from './build-farmer-stock-ledger-excel';

export async function exportFarmerStockLedgerExcel(
  input: ExportFarmerStockLedgerExcelInput,
): Promise<void> {
  const { buffer, fileName } = await buildFarmerStockLedgerExcelPackage(input);

  downloadBlob(
    new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    }),
    fileName,
  );
}
