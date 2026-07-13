function readBooleanFlag(value: string | undefined): boolean {
  if (!value) return false;
  return ['true', '1', 'yes', 'on'].includes(value.trim().toLowerCase());
}

function readOptionalString(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api',
  appName: import.meta.env.VITE_APP_NAME ?? 'Kapur Frontend',
  siteUrl: import.meta.env.VITE_SITE_URL ?? 'https://coldop.in',
  enableDevtools: readBooleanFlag(import.meta.env.VITE_ENABLE_DEVTOOLS),
  gtmId: readOptionalString(import.meta.env.VITE_GTM_ID),
  gaMeasurementId: readOptionalString(import.meta.env.VITE_GA_MEASUREMENT_ID),
  clarityId: readOptionalString(import.meta.env.VITE_CLARITY_ID),
  posthogKey: readOptionalString(import.meta.env.VITE_POSTHOG_KEY),
  posthogHost: readOptionalString(import.meta.env.VITE_POSTHOG_HOST),
} as const;
