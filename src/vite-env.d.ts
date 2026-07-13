/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_APP_NAME: string;
  readonly VITE_SITE_URL?: string;
  readonly VITE_ENABLE_DEVTOOLS?: string;
  readonly VITE_GTM_ID?: string;
  readonly VITE_GA_MEASUREMENT_ID?: string;
  readonly VITE_CLARITY_ID?: string;
  readonly VITE_POSTHOG_KEY?: string;
  readonly VITE_POSTHOG_HOST?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
