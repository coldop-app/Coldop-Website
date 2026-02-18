/** Quantity type for variety breakdown views */
export type QuantityType = 'current' | 'initial' | 'outgoing';

export const QUANTITY_TYPE_LABELS: Record<QuantityType, string> = {
  current: 'Current',
  initial: 'Initial',
  outgoing: 'Outgoing',
};

export function getQuantity(
  initialQuantity: number,
  currentQuantity: number,
  type: QuantityType
): number {
  if (type === 'current') return currentQuantity;
  if (type === 'initial') return initialQuantity;
  return Math.max(0, (initialQuantity ?? 0) - (currentQuantity ?? 0));
}
