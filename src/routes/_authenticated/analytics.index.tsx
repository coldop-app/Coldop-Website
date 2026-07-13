import { createFileRoute } from '@tanstack/react-router';

import AnalyticsPage from '@/features/analytics';
import { analyticsSearchSchema } from '@/features/analytics/search';

export const Route = createFileRoute('/_authenticated/analytics/')({
  validateSearch: analyticsSearchSchema,
  component: AnalyticsPage,
});
