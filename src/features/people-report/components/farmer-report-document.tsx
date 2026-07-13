import { FarmerReportGatePassesSection } from '@/features/people-report/components/farmer-report-gate-passes-section';
import type { PersonDetailSearch } from '@/features/people/search';

type FarmerReportDocumentProps = {
  linkId: string;
  search: PersonDetailSearch;
};

export function FarmerReportDocument({ linkId, search }: FarmerReportDocumentProps) {
  return <FarmerReportGatePassesSection linkId={linkId} search={search} />;
}
