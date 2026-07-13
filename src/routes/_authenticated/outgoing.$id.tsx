import { createFileRoute } from '@tanstack/react-router';
import EditOutgoingForm from '@/features/outgoing/forms/edit-outgoing-form';

export const Route = createFileRoute('/_authenticated/outgoing/$id')({
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();
  return <EditOutgoingForm gatePassId={id} />;
}
