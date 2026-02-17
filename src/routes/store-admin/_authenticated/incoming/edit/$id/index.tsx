import { createFileRoute, useLocation } from '@tanstack/react-router';
import { EditIncomingForm } from '@/components/forms/incoming';
import type { DaybookEntry } from '@/services/store-admin/functions/useGetDaybook';

type IncomingEditState = { entry?: DaybookEntry };

export const Route = createFileRoute(
  '/store-admin/_authenticated/incoming/edit/$id/'
)({
  component: IncomingEditPage,
});

function IncomingEditPage() {
  const { id } = Route.useParams();
  const location = useLocation();
  const entry = (location.state as IncomingEditState | undefined)?.entry;

  if (!entry) {
    return (
      <main className="font-custom mx-auto max-w-2xl px-4 py-6 sm:px-8 sm:py-12">
        <p className="text-muted-foreground font-custom text-sm">
          No incoming order data. Please open edit from the daybook.
        </p>
      </main>
    );
  }

  return <EditIncomingForm editEntry={entry} editId={id} />;
}
