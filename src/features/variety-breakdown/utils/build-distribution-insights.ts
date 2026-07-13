import { formatQuantity } from '@/features/daybook/utils/format';

export type DistributionInsight = {
  text: string;
};

function formatShare(value: number): string {
  return `${value.toLocaleString('en-IN', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })}%`;
}

export function buildTopItemInsight(
  items: Array<{ label: string; bags: number; share: number }>,
  labelSingular: string,
  labelPlural: string,
): DistributionInsight | null {
  if (items.length === 0) return null;

  const top = items[0];

  return {
    text: `${top.label} is the top ${labelSingular} with ${formatShare(top.share)} of total ${labelPlural}.`,
  };
}

export function buildDominantItemInsight(
  items: Array<{ label: string; bags: number; share: number }>,
  labelSingular: string,
): DistributionInsight | null {
  if (items.length === 0) return null;

  const top = items[0];

  if (items.length === 1) {
    return {
      text: `${top.label} is the only ${labelSingular} at ${formatShare(top.share)} of all inventory.`,
    };
  }

  return {
    text: `${top.label} is the most stored ${labelSingular} at ${formatShare(top.share)} of all inventory.`,
  };
}

export function buildTotalInsight(total: number, label: string): DistributionInsight | null {
  if (total <= 0) return null;

  return {
    text: `Total quantity across all ${label}: ${formatQuantity(total)}.`,
  };
}

export function buildFarmerCountInsight(count: number): DistributionInsight | null {
  if (count <= 0) return null;

  return {
    text: `Total farmers: ${count.toLocaleString('en-IN')}.`,
  };
}
