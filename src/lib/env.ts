function readBooleanFlag(value: string | undefined): boolean {
  if (!value) return false;
  return ['true', '1', 'yes', 'on'].includes(value.trim().toLowerCase());
}

export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api',
  appName: import.meta.env.VITE_APP_NAME ?? 'Kapur Frontend',
  siteUrl: import.meta.env.VITE_SITE_URL ?? 'https://app.coldop.in',
  enableDevtools: readBooleanFlag(import.meta.env.VITE_ENABLE_DEVTOOLS),
} as const;
