import type { VarietyBreakdownSize } from '../types';

export function resolveSelectedSize(
  sizes: VarietyBreakdownSize[],
  bagSize: string,
): VarietyBreakdownSize | null {
  if (!bagSize) return null;

  return sizes.find((size) => size.size === bagSize) ?? null;
}
