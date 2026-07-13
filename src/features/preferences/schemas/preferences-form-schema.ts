import * as z from 'zod';
import type { Preferences } from '@/features/auth/types';
import type { UpdatePreferencesPayload } from '../types';

export const REPORT_FORMAT_OPTIONS = ['default', 'pdf', 'excel'] as const;
export const MARKA_TYPE_OPTIONS = ['GatePass', 'AccountNumber'] as const;

const commodityFormSchema = z.object({
  name: z.string().trim().min(1, 'Commodity name is required'),
  varieties: z
    .array(z.string().trim().min(1, 'Variety name is required'))
    .min(1, 'At least one variety is required'),
  sizes: z
    .array(z.string().trim().min(1, 'Size is required'))
    .min(1, 'At least one size is required'),
});

const customFieldFormSchema = z.object({
  key: z.string().trim().min(1, 'Field name is required'),
  value: z.string(),
});

const stockFilterFormSchema = z.object({
  enabled: z.boolean(),
  options: z.array(z.string().trim().min(1, 'Filter option is required')),
});

export const preferencesFormSchema = z.object({
  reportFormat: z.enum(REPORT_FORMAT_OPTIONS, {
    message: 'Select a report format',
  }),
  showFinances: z.boolean(),
  labourCost: z
    .number({ message: 'Labour cost is required' })
    .min(0, 'Labour cost must be 0 or greater'),
  stockFilter: stockFilterFormSchema,
  customMarka: z.boolean(),
  markaType: z.enum(MARKA_TYPE_OPTIONS, {
    message: 'Select a marka type',
  }),
  commodities: z.array(commodityFormSchema),
  customFields: z.array(customFieldFormSchema),
});

export type PreferencesFormValues = z.infer<typeof preferencesFormSchema>;

export type CommodityFormValues = z.infer<typeof commodityFormSchema>;

export const emptyCommodity = (): CommodityFormValues => ({
  name: '',
  varieties: [''],
  sizes: [''],
});

export const emptyCustomField = () => ({
  key: '',
  value: '',
});

function normalizeStringList(values: string[]) {
  return values.map((value) => value.trim()).filter(Boolean);
}

function normalizeStockFilter(
  stockFilter?: Preferences['stockFilter'],
): PreferencesFormValues['stockFilter'] {
  return {
    enabled: stockFilter?.enabled ?? false,
    options: stockFilter?.options && stockFilter.options.length > 0 ? [...stockFilter.options] : [],
  };
}

export function preferencesToFormValues(preferences: Preferences): PreferencesFormValues {
  return {
    reportFormat: REPORT_FORMAT_OPTIONS.includes(
      preferences.reportFormat as (typeof REPORT_FORMAT_OPTIONS)[number],
    )
      ? (preferences.reportFormat as PreferencesFormValues['reportFormat'])
      : 'default',
    showFinances: preferences.showFinances,
    labourCost: preferences.labourCost ?? 0,
    stockFilter: normalizeStockFilter(preferences.stockFilter),
    customMarka: preferences.customMarka ?? false,
    markaType: MARKA_TYPE_OPTIONS.includes(
      preferences.markaType as (typeof MARKA_TYPE_OPTIONS)[number],
    )
      ? (preferences.markaType as PreferencesFormValues['markaType'])
      : 'GatePass',
    commodities: preferences.commodities.map((commodity) => ({
      name: commodity.name,
      varieties: commodity.varieties.length > 0 ? [...commodity.varieties] : [''],
      sizes: commodity.sizes.length > 0 ? [...commodity.sizes] : [''],
    })),
    customFields: Object.entries(preferences.customFields ?? {}).map(([key, value]) => ({
      key,
      value: typeof value === 'string' ? value : JSON.stringify(value ?? ''),
    })),
  };
}

export function formValuesToUpdatePayload(values: PreferencesFormValues): UpdatePreferencesPayload {
  return {
    reportFormat: values.reportFormat,
    showFinances: values.showFinances,
    labourCost: values.labourCost,
    stockFilter: {
      enabled: values.stockFilter.enabled,
      options: normalizeStringList(values.stockFilter.options),
    },
    customMarka: values.customMarka,
    markaType: values.customMarka ? undefined : values.markaType,
    commodities: values.commodities.map((commodity) => ({
      name: commodity.name.trim(),
      varieties: normalizeStringList(commodity.varieties),
      sizes: normalizeStringList(commodity.sizes),
    })),
    customFields: Object.fromEntries(
      values.customFields
        .filter((field) => field.key.trim())
        .map((field) => [field.key.trim(), field.value]),
    ),
  };
}
