import { createFileRoute } from '@tanstack/react-router';
import FarmerProfilePage from '@/components/people/farmer-profile';
import { prefetchFarmerGatePasses } from '@/services/store-admin/functions/useGetFarmerGatePasses';

export const Route = createFileRoute(
  '/store-admin/_authenticated/people/$farmerStorageLinkId/'
)({
  loader: async ({ params }) => {
    await prefetchFarmerGatePasses(params.farmerStorageLinkId);
  },
  component: function FarmerProfileRoute() {
    const { farmerStorageLinkId } = Route.useParams();
    return <FarmerProfilePage farmerStorageLinkId={farmerStorageLinkId} />;
  },
});
