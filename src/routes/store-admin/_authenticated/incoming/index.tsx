import { createFileRoute } from '@tanstack/react-router';
import { CreateIncomingForm } from '@/components/forms/incoming';

export const Route = createFileRoute('/store-admin/_authenticated/incoming/')({
  component: RouteComponent,
});

function RouteComponent() {
  return <CreateIncomingForm />;
}
