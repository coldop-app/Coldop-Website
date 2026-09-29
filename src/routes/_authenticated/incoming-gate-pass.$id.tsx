import { createFileRoute } from '@tanstack/react-router';

import { gatePassEditSearchSchema } from '@/features/daybook/gate-pass-edit-search';
import { IncomingGatePassDetailPage } from '@/features/incoming/components/incoming-gate-pass-detail-page';

export const Route = createFileRoute('/_authenticated/incoming-gate-pass/$id')({
  validateSearch: gatePassEditSearchSchema,
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();
  const search = Route.useSearch();

  return <IncomingGatePassDetailPage id={id} search={search} />;
}
