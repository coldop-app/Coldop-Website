import * as z from 'zod';

export const capitalizeFirstLetter = (value: string) => {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
};

// Helper to format date → dd.mm.yyyy
export const formatDate = (d: Date) =>
  `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`;

// Helper to convert dd.mm.yyyy format to ISO format (2025-12-19T00:00:00.000Z)
export const formatDateToISO = (dateString: string): string => {
  const [day, month, year] = dateString.split('.').map(Number);
  if (!day || !month || !year) {
    // If parsing fails, return current date in ISO format
    return new Date().toISOString();
  }
  // Construct ISO string directly to avoid timezone issues
  const monthStr = String(month).padStart(2, '0');
  const dayStr = String(day).padStart(2, '0');
  return `${year}-${monthStr}-${dayStr}T00:00:00.000Z`;
};

/** Convert form date (string YYYY-MM-DD, dd.mm.yyyy, or Date) to payload ISO string: 2026-02-12T00:00:00.000+00:00 */
export function toPayloadDateISO(value: string | Date): string {
  if (value instanceof Date) {
    const y = value.getFullYear();
    const m = String(value.getMonth() + 1).padStart(2, '0');
    const d = String(value.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}T00:00:00.000+00:00`;
  }
  const s = typeof value === 'string' ? value.trim() : '';
  // YYYY-MM-DD (possibly with time part)
  const isoDatePart = s.split('T')[0] ?? s;
  if (/^\d{4}-\d{2}-\d{2}$/.test(isoDatePart)) {
    return `${isoDatePart}T00:00:00.000+00:00`;
  }
  // dd.mm.yyyy
  const iso = formatDateToISO(s);
  return iso.replace('Z', '+00:00');
}

/** Preprocess: dd.mm.yyyy string → Date; other inputs passed through for z.coerce.date() */
function preprocessDateInput(val: unknown): unknown {
  if (typeof val !== 'string') return val;
  const trimmed = val.trim();
  const parts = trimmed.split('.').map(Number);
  if (parts.length === 3) {
    const [d, m, y] = parts;
    if (
      d != null &&
      m != null &&
      y != null &&
      !Number.isNaN(d) &&
      !Number.isNaN(m) &&
      !Number.isNaN(y)
    )
      return new Date(y, m - 1, d);
  }
  return val;
}

/**
 * Zod schema: accepts form date (YYYY-MM-DD, dd.mm.yyyy, or Date) and outputs
 * payload ISO string (2026-02-12T00:00:00.000+00:00). Use for validation and when building payloads.
 */
export const payloadDateSchema = z
  .preprocess(preprocessDateInput, z.coerce.date())
  .transform(toPayloadDateISO);
