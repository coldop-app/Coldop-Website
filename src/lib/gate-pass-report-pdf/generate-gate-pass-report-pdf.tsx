import { pdf } from '@react-pdf/renderer';

import GatePassReportPdf from '@/lib/gate-pass-report-pdf/gate-pass-report-pdf';
import { registerGatePassReportPdfFonts } from '@/lib/gate-pass-report-pdf/register-pdf-fonts';
import type { GenerateGatePassReportPdfInput } from '@/lib/gate-pass-report-pdf/types';

export async function generateGatePassReportPdf(
  input: GenerateGatePassReportPdfInput,
): Promise<Blob> {
  await registerGatePassReportPdfFonts();
  const doc = <GatePassReportPdf {...input} />;
  return pdf(doc).toBlob();
}
