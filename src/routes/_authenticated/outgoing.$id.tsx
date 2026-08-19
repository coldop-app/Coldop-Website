import { createFileRoute } from '@tanstack/react-router';
import { gatePassEditSearchSchema } from '@/features/daybook/gate-pass-edit-search';
import EditOutgoingForm from '@/features/outgoing/forms/edit-outgoing-form';

export const Route = createFileRoute('/_authenticated/outgoing/$id')({
  validateSearch: gatePassEditSearchSchema,
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();
  const search = Route.useSearch();
  return <EditOutgoingForm gatePassId={id} search={search} />;
}
