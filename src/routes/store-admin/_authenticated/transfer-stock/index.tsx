import { createFileRoute } from '@tanstack/react-router';
import { TransferStockForm } from '@/components/forms/transfer-stock';

export const Route = createFileRoute('/store-admin/_authenticated/transfer-stock/')({
  component: TransferStockForm,
});
