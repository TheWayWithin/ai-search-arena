import { Badge } from "@/components/ui/badge";

type TrendData = {
  previousRank: number | null;
  rankDelta: number | null;
  isNew: boolean;
};

type TrendIndicatorProps = {
  trend: TrendData | null;
};

export function TrendIndicator({ trend }: TrendIndicatorProps) {
  if (!trend) return <span className="text-neutral-grey text-sm">&mdash;</span>;

  // First cycle ever — no previous data
  if (trend.isNew && trend.previousRank === null) {
    return (
      <Badge variant="outline" className="border-mastery-blue/20 bg-mastery-blue/10 text-mastery-blue text-xs">
        NEW
      </Badge>
    );
  }

  // No change
  if (trend.rankDelta === 0) {
    return <span className="text-neutral-grey text-sm">&mdash;</span>;
  }

  // Improved (positive delta = moved up in rank)
  if (trend.rankDelta !== null && trend.rankDelta > 0) {
    return (
      <span className="text-confidence-green inline-flex items-center gap-0.5 text-sm font-medium">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="shrink-0">
          <path d="M6 2L10 7H2L6 2Z" fill="currentColor" />
        </svg>
        {trend.rankDelta}
      </span>
    );
  }

  // Declined (negative delta = moved down in rank)
  if (trend.rankDelta !== null && trend.rankDelta < 0) {
    return (
      <span className="text-insufficient-red inline-flex items-center gap-0.5 text-sm font-medium">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="shrink-0">
          <path d="M6 10L2 5H10L6 10Z" fill="currentColor" />
        </svg>
        {Math.abs(trend.rankDelta)}
      </span>
    );
  }

  return <span className="text-neutral-grey text-sm">&mdash;</span>;
}
