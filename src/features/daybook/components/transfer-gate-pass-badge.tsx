import { cn } from '@/lib/utils';
import { formatQuantity } from '@/features/daybook/utils/format';

type TransferGatePassBadgeProps = {
  bagCount: number;
  typeLabel: string;
  tone: 'incoming' | 'outgoing';
};

const toneStyles = {
  incoming: {
    label: 'text-blue-600 dark:text-blue-400',
    dot: 'bg-blue-600 dark:bg-blue-400',
  },
  outgoing: {
    label: 'text-rose-700 dark:text-rose-400',
    dot: 'bg-rose-700 dark:bg-rose-500',
  },
} as const;

export function TransferGatePassBadge({ bagCount, typeLabel, tone }: TransferGatePassBadgeProps) {
  const styles = toneStyles[tone];

  return (
    <span className="bg-muted/60 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs">
      <span className="text-foreground font-medium tabular-nums">
        {formatQuantity(bagCount)} bags
      </span>
      <span className={cn('size-1 shrink-0 rounded-full', styles.dot)} aria-hidden />
      <span className={cn('font-medium', styles.label)}>{typeLabel}</span>
    </span>
  );
}

export function isIncomingTransferType(type: string | undefined): boolean {
  return type?.toLowerCase() === 'incoming-transfer';
}

export function isOutgoingTransferType(type: string | undefined): boolean {
  return type?.toLowerCase() === 'outgoing-transfer';
}
