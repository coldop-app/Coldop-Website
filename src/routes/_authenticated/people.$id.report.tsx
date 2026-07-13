import { createFileRoute } from '@tanstack/react-router';

import PeopleReportPage from '@/features/people-report';
import { personDetailSearchSchema } from '@/features/people/search';

export const Route = createFileRoute('/_authenticated/people/$id/report')({
  validateSearch: personDetailSearchSchema,
  component: PeopleReportPage,
});
