import { createFileRoute } from '@tanstack/react-router';
import MyFinancesPage from '@/components/my-finances';

export const Route = createFileRoute(
  '/store-admin/_authenticated/my-finances/'
)({
  validateSearch: (search: Record<string, unknown>) => ({
    tab: (search.tab as string | undefined) ?? undefined,
    farmerStorageLinkId: (search.farmerStorageLinkId as string | undefined) ?? undefined,
    farmerName: (search.farmerName as string | undefined) ?? undefined,
  }),
  component: MyFinancesPage,
});
