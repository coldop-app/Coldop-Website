import type { LucideIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

type FarmerFinancesActionCardProps = {
  label: string;
  icon: LucideIcon;
  iconClassName: string;
  onClick: () => void;
};

export function FarmerFinancesActionCard({
  label,
  icon: Icon,
  iconClassName,
  onClick,
}: FarmerFinancesActionCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'border-border bg-background flex min-h-11 w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors',
        'hover:bg-muted/50 focus-visible:ring-ring/30 focus-visible:ring-2 focus-visible:outline-none',
      )}
    >
      <div
        className={cn('flex size-9 shrink-0 items-center justify-center rounded-md', iconClassName)}
      >
        <Icon className="size-4" aria-hidden />
      </div>
      <span className="text-foreground text-sm font-medium">{label}</span>
    </button>
  );
}
