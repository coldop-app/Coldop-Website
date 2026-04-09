import { createFileRoute } from '@tanstack/react-router'
import VarietyBreakdownScreen from '@/components/analytics/variety-breakdown'

export const Route = createFileRoute(
  '/store-admin/_authenticated/analytics/variety-breakdown/',
)({
  validateSearch: (search: Record<string, unknown>) => {
    const stockFilterRaw = search.stockFilter as string | undefined
    const stockFilter =
      stockFilterRaw === 'OWNED' || stockFilterRaw === 'FARMER'
        ? stockFilterRaw
        : undefined

    return {
      variety: (search.variety as string | undefined) ?? undefined,
      bagSize: (search.bagSize as string | undefined) ?? undefined,
      stockFilter,
    }
  },
  component: VarietyBreakdownScreen,
})
