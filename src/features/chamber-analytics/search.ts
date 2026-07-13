import { z } from 'zod';

export const LOCATION_ANALYTICS_TAB_VALUES = ['current', 'initial'] as const;

export const locationAnalyticsTabSchema = z.enum(LOCATION_ANALYTICS_TAB_VALUES);

export const LOCATION_ANALYTICS_VIEW_VALUES = ['location', 'farmer'] as const;

export const locationAnalyticsViewSchema = z.enum(LOCATION_ANALYTICS_VIEW_VALUES);

export const chamberAnalyticsSearchSchema = z.object({
  tab: locationAnalyticsTabSchema.catch('current'),
  view: locationAnalyticsViewSchema.catch('location'),
  chamber: z.string().optional(),
  floor: z.string().catch(''),
});

export type ChamberAnalyticsSearch = z.infer<typeof chamberAnalyticsSearchSchema>;

export type LocationAnalyticsTab = z.infer<typeof locationAnalyticsTabSchema>;

export type LocationAnalyticsView = z.infer<typeof locationAnalyticsViewSchema>;
