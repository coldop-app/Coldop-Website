import type { Alignment, Borders, Fill, Font } from 'exceljs';

export const EXPORT_THEME_COLORS = {
  primary: 'FF008235',
  foreground: 'FF09090B',
  mutedForeground: 'FF71717A',
  border: 'FFE4E4E7',
  mutedFill: 'FFF8F9FA',
  primarySoftFill: 'FFECFDF5',
  primaryMutedFill: 'FFF4F4F5',
  zebraFill: 'FFFAFAFA',
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

/** @deprecated Use EXPORT_THEME_COLORS */
export const EXPORT_REPORT_COLORS = {
  ink: EXPORT_THEME_COLORS.foreground,
  inkSoft: EXPORT_THEME_COLORS.mutedForeground,
  inkMuted: 'FFA1A1AA',
  hairline: EXPORT_THEME_COLORS.border,
  hairlineStrong: EXPORT_THEME_COLORS.foreground,
  paper: 'FFFFFFFF',
  wash: EXPORT_THEME_COLORS.mutedFill,
  accent: EXPORT_THEME_COLORS.primary,
  accentWash: EXPORT_THEME_COLORS.primarySoftFill,
  borderLight: EXPORT_THEME_COLORS.primaryMutedFill,
} as const;

export const COLDOP_BRANDING = {
  label: 'Powered by ',
  name: 'Coldop',
} as const;

export const EXPORT_INTEGER_NUM_FMT = '#,##0';

const thinBorder = {
  style: 'thin' as const,
  color: { argb: EXPORT_THEME_COLORS.border },
};

export const EXPORT_THIN_BORDERS: Partial<Borders> = {
  top: thinBorder,
  left: thinBorder,
  bottom: thinBorder,
  right: thinBorder,
};

export function exportHeaderFont(size = 11): Partial<Font> {
  return {
    name: 'Calibri',
    size,
    bold: true,
    color: { argb: EXPORT_THEME_COLORS.foreground },
  };
}

export function exportBodyFont(size = 10): Partial<Font> {
  return {
    name: 'Calibri',
    size,
    color: { argb: EXPORT_THEME_COLORS.foreground },
  };
}

export function exportMutedFont(size = 9): Partial<Font> {
  return {
    name: 'Calibri',
    size,
    color: { argb: EXPORT_THEME_COLORS.mutedForeground },
  };
}

export function exportAccentFont(size = 11): Partial<Font> {
  return {
    name: 'Calibri',
    size,
    bold: true,
    color: { argb: EXPORT_THEME_COLORS.primary },
  };
}

export function exportTitleFont(size = 16): Partial<Font> {
  return {
    name: 'Calibri',
    size,
    bold: true,
    color: { argb: EXPORT_THEME_COLORS.primary },
  };
}

export function exportWashFill(): Fill {
  return {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: EXPORT_THEME_COLORS.mutedFill },
  };
}

export function exportAccentWashFill(): Fill {
  return {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: EXPORT_THEME_COLORS.primarySoftFill },
  };
}

export function exportLeftAlignment(vertical: 'middle' | 'top' = 'middle'): Partial<Alignment> {
  return { vertical, horizontal: 'left', wrapText: true };
}

/** @deprecated Prefer exportLeftAlignment */
export function exportCenterAlignment(): Partial<Alignment> {
  return { vertical: 'middle', horizontal: 'left', wrapText: true };
}

/** @deprecated Prefer exportLeftAlignment for body cells */
export function exportRightAlignment(): Partial<Alignment> {
  return { vertical: 'middle', horizontal: 'left', wrapText: true };
}

export function formatExportInteger(value: number): string {
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(value);
}
