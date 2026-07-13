import { useMemo } from 'react';
import { Package } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import type {
  StorageGatePass,
  TransferStockItem,
} from '@/features/transfer-stock/types/storage-gate-pass';
import { findPassAndSlot } from '@/features/transfer-stock/utils/gate-pass-matrix-utils';
import { cn } from '@/lib/utils';

type AllocationReviewByVarietyProps = {
  items: TransferStockItem[];
  passes: StorageGatePass[];
  variant?: 'default' | 'card';
};

type EnrichedItem = TransferStockItem & {
  variety: string;
};

function formatLocation(location: TransferStockItem['location']) {
  return `Ch ${location.chamber} · F ${location.floor} · R ${location.row}`;
}

export function AllocationReviewByVariety({
  items,
  passes,
  variant = 'default',
}: AllocationReviewByVarietyProps) {
  const groups = useMemo(() => {
    const enriched: EnrichedItem[] = items.map((item) => {
      const found = findPassAndSlot(passes, item.storageGatePassId, item.bagSize, item.bagIndex);
      return {
        ...item,
        variety: found?.pass.variety?.trim() || '—',
      };
    });

    const byVariety = new Map<string, EnrichedItem[]>();
    for (const item of enriched) {
      const list = byVariety.get(item.variety) ?? [];
      list.push(item);
      byVariety.set(item.variety, list);
    }

    return [...byVariety.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [items, passes]);

  if (items.length === 0) {
    return (
      <div className="border-border/50 bg-muted/15 rounded-xl border border-dashed px-4 py-6 text-center">
        <p className="text-muted-foreground text-sm">No allocations selected.</p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-3', variant === 'card' && groups.length > 1 && 'space-y-4')}>
      {groups.map(([variety, groupItems]) => {
        const groupTotal = groupItems.reduce((sum, item) => sum + item.quantity, 0);

        if (variant === 'card') {
          return (
            <div
              key={variety}
              className="border-border/50 bg-card overflow-hidden rounded-xl border shadow-sm"
            >
              <div className="border-border/40 bg-muted/25 flex items-center justify-between gap-3 border-b px-4 py-3">
                <div className="flex min-w-0 items-center gap-2.5">
                  <span className="bg-primary/10 text-primary ring-primary/15 flex size-8 shrink-0 items-center justify-center rounded-lg ring-1 ring-inset">
                    <Package className="size-4" aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <p className="text-muted-foreground text-[11px] font-medium tracking-wide uppercase">
                      Variety
                    </p>
                    <h4
                      className="font-heading text-foreground truncate text-sm font-semibold tracking-tight"
                      title={variety}
                    >
                      {variety}
                    </h4>
                  </div>
                </div>
                <Badge
                  variant="secondary"
                  className="bg-background/80 shrink-0 gap-1 px-2.5 font-normal tabular-nums"
                >
                  {groupTotal.toLocaleString('en-IN')}
                  <span className="text-muted-foreground">bags</span>
                </Badge>
              </div>
              <AllocationLinesTable items={groupItems} />
              <div className="border-border/40 bg-muted/15 flex items-center justify-between border-t px-4 py-2.5">
                <span className="text-muted-foreground text-xs">Subtotal</span>
                <span className="text-foreground text-sm font-semibold tabular-nums">
                  {groupTotal.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          );
        }

        return (
          <div key={variety} className="space-y-2">
            <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
              {variety}
            </p>
            <div className="border-border/50 overflow-x-auto rounded-xl border">
              <AllocationLinesTable items={groupItems} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function AllocationLinesTable({ items }: { items: EnrichedItem[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full caption-bottom text-sm">
        <thead className="border-border/40 bg-muted/30 border-b">
          <tr className="text-left">
            <th className="text-muted-foreground h-10 px-3 font-medium">Voucher</th>
            <th className="text-muted-foreground h-10 px-3 font-medium">Size</th>
            <th className="text-muted-foreground h-10 px-3 font-medium">Location</th>
            <th className="text-muted-foreground h-10 px-3 text-right font-medium">Qty</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr
              key={`${item.storageGatePassId}-${item.bagSize}-${item.bagIndex}-${index}`}
              className="border-border/40 border-b last:border-0"
            >
              <td className="text-foreground px-3 py-2.5 font-mono text-sm tabular-nums">
                #{item.gatePassNo.toLocaleString('en-IN')}
              </td>
              <td className="text-foreground px-3 py-2.5 font-medium">{item.bagSize}</td>
              <td className="text-muted-foreground px-3 py-2.5 text-xs">
                {formatLocation(item.location)}
              </td>
              <td className="text-foreground px-3 py-2.5 text-right font-medium tabular-nums">
                {item.quantity.toLocaleString('en-IN')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
