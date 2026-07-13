import { createFileRoute } from '@tanstack/react-router';
import EditIncomingForm from '@/features/incoming/forms/edit-incoming-form';

export const Route = createFileRoute('/_authenticated/incoming/$id')({
  component: RouteComponent,
});

// eslint-disable-next-line react-refresh/only-export-components
function RouteComponent() {
  const { id } = Route.useParams();
  return <EditIncomingForm gatePassId={id} />;
}
