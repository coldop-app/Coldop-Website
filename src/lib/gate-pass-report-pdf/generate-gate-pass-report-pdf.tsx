import { pdf } from '@react-pdf/renderer';

import GatePassReportPdf from '@/lib/gate-pass-report-pdf/gate-pass-report-pdf';
import type { GenerateGatePassReportPdfInput } from '@/lib/gate-pass-report-pdf/types';

export async function generateGatePassReportPdf(
  input: GenerateGatePassReportPdfInput,
): Promise<Blob> {
  const doc = <GatePassReportPdf {...input} />;
  return pdf(doc).toBlob();
}
