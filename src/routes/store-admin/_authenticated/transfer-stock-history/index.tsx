import { createFileRoute } from '@tanstack/react-router'
import TransferStockHistoryPage from '@/components/transfer-stock-history'

export const Route = createFileRoute(
  '/store-admin/_authenticated/transfer-stock-history/',
)({
  component: TransferStockHistoryPage,
})
