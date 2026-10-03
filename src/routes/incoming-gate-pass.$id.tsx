import { createFileRoute } from '@tanstack/react-router';

import { gatePassEditSearchSchema } from '@/features/daybook/gate-pass-edit-search';
import { IncomingGatePassDetailPage } from '@/features/incoming/components/incoming-gate-pass-detail-page';
import { asRouteHead, buildNoIndexHead } from '@/lib/seo/meta';

const gatePassHead = asRouteHead(buildNoIndexHead('Incoming Gate Pass', '/incoming-gate-pass'));

export const Route = createFileRoute('/incoming-gate-pass/$id')({
  validateSearch: gatePassEditSearchSchema,
  head: () => gatePassHead,
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();
  const search = Route.useSearch();

  return (
    <main className="min-h-svh overflow-y-auto p-4 sm:p-6">
      <div className="mx-auto flex w-full max-w-7xl min-w-0 flex-col gap-4 sm:gap-6">
        <IncomingGatePassDetailPage id={id} search={search} />
      </div>
    </main>
  );
}
