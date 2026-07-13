export type UtilizationBand = 'low' | 'medium' | 'high';

export function utilizationBand(percent: number): UtilizationBand {
  if (percent >= 85) return 'high';
  if (percent >= 50) return 'medium';
  return 'low';
}

export function utilizationBandDotClass(band: UtilizationBand) {
  if (band === 'high') return 'bg-primary';
  if (band === 'medium') return 'bg-chart-3';
  return 'bg-muted-foreground/40';
}

export function utilizationBandBarClass(band: UtilizationBand) {
  if (band === 'high') return 'bg-primary';
  if (band === 'medium') return 'bg-chart-3';
  return 'bg-muted-foreground/50';
}

export function formatUtilizationDisplay(percent: number) {
  return `${percent.toLocaleString('en-IN', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })}%`;
}
