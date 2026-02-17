import { createFileRoute, useLocation } from '@tanstack/react-router';
import OutgoingForm from '@/components/forms/outgoing';
import type { DaybookEntry } from '@/services/store-admin/functions/useGetDaybook';

type OutgoingEditState = { entry?: DaybookEntry };

export const Route = createFileRoute(
  '/store-admin/_authenticated/outgoing/edit/$id/'
)({
  component: OutgoingEditPage,
});

function OutgoingEditPage() {
  const { id } = Route.useParams();
  const location = useLocation();
  const entry = (location.state as OutgoingEditState | undefined)?.entry;

  if (!entry) {
    return (
      <main className="font-custom mx-auto max-w-2xl px-4 py-6 sm:px-8 sm:py-12">
        <p className="text-muted-foreground font-custom text-sm">
          No outgoing order data. Please open edit from the daybook.
        </p>
      </main>
    );
  }

  return <OutgoingForm editEntry={entry} editId={id} />;
}
