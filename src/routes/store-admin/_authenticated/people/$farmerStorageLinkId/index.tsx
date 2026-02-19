/* eslint-disable react-refresh/only-export-components -- route file exports Route config, not only components */
import { lazy, Suspense } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { queryClient } from '@/lib/queryClient';
import { farmerGatePassesQueryOptions } from '@/services/store-admin/functions/useGetFarmerGatePasses';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

const FarmerProfilePage = lazy(
  () => import('@/components/people/farmer-profile')
);

/** Lightweight fallback while the farmer-profile chunk loads */
function FarmerProfileFallback() {
  return (
    <main className="mx-auto max-w-7xl p-2 sm:p-4 lg:p-6">
      <div className="space-y-6">
        <Card className="overflow-hidden rounded-xl shadow-sm">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center gap-4">
              <Skeleton className="h-16 w-16 rounded-full sm:h-20 sm:w-20" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-5 w-24" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Skeleton className="h-24 w-full rounded-xl" />
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>
      </div>
    </main>
  );
}

export const Route = createFileRoute(
  '/store-admin/_authenticated/people/$farmerStorageLinkId/'
)({
  loader: ({ params }) => {
    // Start prefetch in background; do not block navigation
    queryClient.prefetchQuery(
      farmerGatePassesQueryOptions(params.farmerStorageLinkId)
    );
  },
  component: function FarmerProfileRoute() {
    const { farmerStorageLinkId } = Route.useParams();
    return (
      <Suspense fallback={<FarmerProfileFallback />}>
        <FarmerProfilePage farmerStorageLinkId={farmerStorageLinkId} />
      </Suspense>
    );
  },
});
