/**
 * Mobile numbers that are allowed to see "special" fields (e.g. custom marka, stock filter)
 * in incoming forms, daybook cards, and PDF reports.
 */
const ALLOWED_SPECIAL_NUMBERS: readonly string[] = [
  '9217100041',
  '9877741375',
  '9478631000',
  '9888200953',
  '9888048330',
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
const INCOMING_CUSTOM_MARKA_ONLY_MOBILES: readonly string[] = ['9478631000'];

export type StockFilterOption = {
  readonly value: string;
  readonly label: string;
};

const DEFAULT_STOCK_FILTER_OPTIONS: readonly StockFilterOption[] = [
  { value: 'OWNED', label: 'OWNED' },
  { value: 'FARMER', label: 'FARMER' },
];

/** Per-admin stock filter dropdown options on incoming create/edit. */
const STOCK_FILTER_OPTIONS_BY_MOBILE: Readonly<
  Record<string, readonly StockFilterOption[]>
> = {
  '9888048330': [
    { value: 'OWNED', label: 'OWNED' },
    { value: 'AMAN', label: 'AMAN' },
  ],
};

/**
 * Stock filter options for incoming create/edit (default OWNED/FARMER).
 */
export function getStockFilterOptions(
  mobileNumber: string | null | undefined
): readonly StockFilterOption[] {
  if (
    mobileNumber != null &&
    mobileNumber in STOCK_FILTER_OPTIONS_BY_MOBILE
  ) {
    return STOCK_FILTER_OPTIONS_BY_MOBILE[mobileNumber];
  }
  return DEFAULT_STOCK_FILTER_OPTIONS;
}

/** Non-owned stock filter value for this admin (e.g. FARMER or AMAN). */
export function getStockFilterSecondaryValue(
  mobileNumber: string | null | undefined
): string {
  const options = getStockFilterOptions(mobileNumber);
  return options.find((o) => o.value !== 'OWNED')?.value ?? 'FARMER';
}

/** Tab label for the non-owned stock filter (e.g. "Farmer" or "Aman"). */
export function getStockFilterSecondaryTabLabel(
  mobileNumber: string | null | undefined
): string {
  const secondary = getStockFilterOptions(mobileNumber).find(
    (o) => o.value !== 'OWNED'
  );
  if (!secondary) return 'Farmer';
  if (secondary.value === 'AMAN') return 'Aman';
  return secondary.label.charAt(0) + secondary.label.slice(1).toLowerCase();
}

/**
 * Stock filter on incoming create/edit — shown only for special admins who are
 * not in {@link INCOMING_CUSTOM_MARKA_ONLY_MOBILES}.
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
