import { createFileRoute } from '@tanstack/react-router'
import VarietyBreakdownScreen from '@/components/analytics/variety-breakdown'

export const Route = createFileRoute(
  '/store-admin/_authenticated/analytics/variety-breakdown/',
)({
  validateSearch: (search: Record<string, unknown>) => ({
    variety: (search.variety as string | undefined) ?? undefined,
    bagSize: (search.bagSize as string | undefined) ?? undefined,
  }),
  component: VarietyBreakdownScreen,
})
