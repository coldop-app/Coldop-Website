import { createFileRoute } from '@tanstack/react-router';
import CreateTransferStock from '@/features/transfer-stock/forms/create-transfer-stock';
import { transferStockSearchSchema } from '@/features/transfer-stock/search';

export const Route = createFileRoute('/_authenticated/transfer/')({
  validateSearch: transferStockSearchSchema,
  component: CreateTransferStock,
});
