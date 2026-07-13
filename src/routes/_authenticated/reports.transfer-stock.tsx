import { createFileRoute } from '@tanstack/react-router';
import TransferStockReportPage from '@/features/transfer-stock-report';

export const Route = createFileRoute('/_authenticated/reports/transfer-stock')({
  component: TransferStockReportPage,
});
