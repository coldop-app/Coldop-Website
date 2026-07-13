import { createFileRoute } from '@tanstack/react-router';

import ChamberAnalyticsPage from '@/features/chamber-analytics';
import { chamberAnalyticsSearchSchema } from '@/features/chamber-analytics/search';

export const Route = createFileRoute('/_authenticated/analytics/advanced')({
  validateSearch: chamberAnalyticsSearchSchema,
  component: ChamberAnalyticsPage,
});
