import { createFileRoute } from '@tanstack/react-router';
import EditHistoryPage from '@/components/edit-history';

export const Route = createFileRoute(
  '/store-admin/_authenticated/edit-history/'
)({
  component: EditHistoryPage,
});
