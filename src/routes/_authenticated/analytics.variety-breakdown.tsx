import { createFileRoute } from '@tanstack/react-router';

import VarietyBreakdownPage from '@/features/variety-breakdown';
import { varietyBreakdownSearchSchema } from '@/features/variety-breakdown/search';

export const Route = createFileRoute('/_authenticated/analytics/variety-breakdown')({
  validateSearch: varietyBreakdownSearchSchema,
  component: VarietyBreakdownPage,
});
