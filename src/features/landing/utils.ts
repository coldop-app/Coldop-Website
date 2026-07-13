export function formatStat(value: number, format: string) {
  if (format === 'percent') return `${value.toFixed(1)}%`;
  if (format === 'lakh') return `${Math.round(value / 100_000)} Lakh+`;
  if (format === 'k') return `${Math.round(value / 1_000)}k+`;
  return `${Math.floor(value)}+`;
}

export function utilizationPercent(bags: number, capacity: number) {
  if (capacity <= 0) return 0;
  return (bags / capacity) * 100;
}

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

export function formatBags(value: number) {
  return new Intl.NumberFormat('en-IN').format(value);
}

export function formatUtilization(percent: number) {
  return `${percent.toLocaleString('en-IN', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })}%`;
}

export function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
}

export function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}
