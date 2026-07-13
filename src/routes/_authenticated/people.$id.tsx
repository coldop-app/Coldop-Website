import { createFileRoute, Outlet } from '@tanstack/react-router';

import { personDetailSearchSchema } from '@/features/people/search';

export const Route = createFileRoute('/_authenticated/people/$id')({
  validateSearch: personDetailSearchSchema,
  component: () => <Outlet />,
});
