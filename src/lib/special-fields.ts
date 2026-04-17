/**
 * Mobile numbers that are allowed to see "special" fields (e.g. custom marka, stock filter)
 * in incoming forms, daybook cards, and PDF reports.
 */
const ALLOWED_SPECIAL_NUMBERS: readonly string[] = [
  '9217100041',
  '9877741375',
  '9478631000',
  '9888200953',
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

/**
 * Mobile numbers that see custom marka on incoming forms but not the stock
 * filter field (stock filter is optional / hidden for them).
 */
const INCOMING_CUSTOM_MARKA_ONLY_MOBILES: readonly string[] = [
  '9478631000',
];

/**
 * Stock filter (OWNED/FARMER) on incoming create/edit — shown only for special
 * admins who are not in {@link INCOMING_CUSTOM_MARKA_ONLY_MOBILES}.
 */
export function shouldShowStockFilterField(
  mobileNumber: string | null | undefined
): boolean {
  return (
    shouldShowSpecialFields(mobileNumber) &&
    mobileNumber != null &&
    !INCOMING_CUSTOM_MARKA_ONLY_MOBILES.includes(mobileNumber)
  );
}

/** Shown when a payment-restricted store admin taps a blocked control. */
export const PAYMENT_RESTRICTED_TOAST_MESSAGE =
  'Please contact our team to enable this functionality';

/**
 * TEMPORARY — remove when the client on this number completes payment.
 * Matches 10-digit mobile and common +91-prefixed forms.
 */
export function isPaymentRestrictedAdmin(
  mobileNumber: string | null | undefined
): boolean {
  const digits = (mobileNumber ?? '').replace(/\D/g, '');
  return digits.endsWith('9817664358');
}

/**
 * When the payment-restricted admin is on this cold storage, only PDF/report
 * actions stay blocked; edit, finances, filters, and gate pass expand/edit work.
 */
export const REPORT_ONLY_RESTRICTED_COLD_STORAGE_ID =
  '6996912634984daeca106e4f' as const;

export function isReportOnlyRestrictedContext(
  mobileNumber: string | null | undefined,
  coldStorageId: string | null | undefined
): boolean {
  return (
    isPaymentRestrictedAdmin(mobileNumber) &&
    coldStorageId === REPORT_ONLY_RESTRICTED_COLD_STORAGE_ID
  );
}
