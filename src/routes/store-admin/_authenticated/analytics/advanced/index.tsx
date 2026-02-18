import { createFileRoute } from '@tanstack/react-router'
import AdvancedAnalyticsPage from '@/components/analytics/advanced'

export const Route = createFileRoute(
  '/store-admin/_authenticated/analytics/advanced/',
)({
  component: AdvancedAnalyticsPage,
})
