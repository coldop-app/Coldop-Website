import { createFileRoute } from '@tanstack/react-router';
import { gatePassEditSearchSchema } from '@/features/daybook/gate-pass-edit-search';
import EditIncomingForm from '@/features/incoming/forms/edit-incoming-form';

export const Route = createFileRoute('/_authenticated/incoming/$id')({
  validateSearch: gatePassEditSearchSchema,
  component: RouteComponent,
});

// eslint-disable-next-line react-refresh/only-export-components
function RouteComponent() {
  const { id } = Route.useParams();
  const search = Route.useSearch();
  return <EditIncomingForm gatePassId={id} search={search} />;
}
