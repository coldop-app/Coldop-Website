import { createFileRoute } from '@tanstack/react-router';

import { FarmerProfilePage } from '@/features/people/components/farmer-profile-page';

export const Route = createFileRoute('/_authenticated/people/$id/')({
  component: RouteComponent,
});

// eslint-disable-next-line react-refresh/only-export-components
function RouteComponent() {
  const { id } = Route.useParams();
  const search = Route.useSearch();

  return <FarmerProfilePage linkId={id} search={search} />;
}
