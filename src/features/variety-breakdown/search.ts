import { z } from 'zod';

import { analyticsTabSchema } from '@/features/analytics/search';

export const varietyBreakdownSearchSchema = z.object({
  variety: z.string(),
  bagSize: z.string(),
  tab: analyticsTabSchema.catch('current'),
  stockFilter: z.boolean().optional(),
  stockFilterTab: z.string().optional(),
});

export type VarietyBreakdownSearch = z.infer<typeof varietyBreakdownSearchSchema>;
