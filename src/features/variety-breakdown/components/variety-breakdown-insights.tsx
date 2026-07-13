import type { DistributionInsight } from '../utils/build-distribution-insights';

type VarietyBreakdownInsightsProps = {
  insights: DistributionInsight[];
};

export function VarietyBreakdownInsights({ insights }: VarietyBreakdownInsightsProps) {
  if (insights.length === 0) return null;

  return (
    <ul className="text-muted-foreground space-y-1.5 text-sm">
      {insights.map((insight) => (
        <li key={insight.text} className="flex gap-2">
          <span aria-hidden className="text-primary">
            •
          </span>
          <span>{insight.text}</span>
        </li>
      ))}
    </ul>
  );
}
