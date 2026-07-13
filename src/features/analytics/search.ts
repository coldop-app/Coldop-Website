import { z } from 'zod';

export const ANALYTICS_TAB_VALUES = ['current', 'initial', 'outgoing'] as const;

export const analyticsTabSchema = z.enum(ANALYTICS_TAB_VALUES);

export const analyticsSearchSchema = z.object({
  tab: analyticsTabSchema.catch('current'),
});

export type AnalyticsTab = z.infer<typeof analyticsTabSchema>;
