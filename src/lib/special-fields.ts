/**
 * Mobile numbers that are allowed to see "special" fields (e.g. custom marka, stock filter)
 * in incoming forms, daybook cards, and PDF reports.
 */
const ALLOWED_SPECIAL_NUMBERS: readonly string[] = [
  '9217100041',
  '9877741375',
];

/**
 * Returns true if the given mobile number is allowed to see special fields
 * (custom marka, stock filter, and PDF layout without G. Total column).
 */
export function shouldShowSpecialFields(
  mobileNumber: string | null | undefined
): boolean {
  return (
    mobileNumber != null && ALLOWED_SPECIAL_NUMBERS.includes(mobileNumber)
  );
}
