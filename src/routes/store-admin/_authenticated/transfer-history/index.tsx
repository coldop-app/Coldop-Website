import { createFileRoute } from '@tanstack/react-router';
import TransferHistoryPage from '@/components/transfer-history';

export const Route = createFileRoute(
  '/store-admin/_authenticated/transfer-history/'
)({
  component: TransferHistoryPage,
});
