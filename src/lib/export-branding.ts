/** Shared Coldop branding for PDF/Excel/HTML exports — no exceljs dependency. */
export const COLDOP_BRANDING = {
  label: 'Powered by ',
  name: 'Coldop',
} as const;

/** CSS-friendly theme tokens for HTML report previews */
export const EXPORT_THEME_CSS = {
  primary: '#008235',
  primaryForeground: '#f0fdf4',
  foreground: '#09090b',
  mutedForeground: '#71717a',
  border: '#e4e4e7',
  mutedFill: '#f8f9fa',
  primarySoftFill: '#ecfdf5',
  primaryMutedFill: '#f4f4f5',
  zebraFill: '#fafafa',
  background: '#ffffff',
} as const;
