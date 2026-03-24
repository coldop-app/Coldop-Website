import { useGetTransferStockGatePasses } from '@/services/transfer-stock/useGetTransferStockGatePasses';
import TransferStockGatePassCard from './transfer-stock-gate-pass-card';
import { Spinner } from '@/components/ui/spinner';
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyMedia,
} from '@/components/ui/empty';
import { ArrowRightLeft } from 'lucide-react';

export default function TransferHistoryPage() {
  const { data, isPending, isError, error, refetch, isFetching } =
    useGetTransferStockGatePasses();

  const passes = data?.data ?? [];

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-foreground font-custom text-lg font-semibold tracking-tight">
            Transfer history
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Stock transfers between farmer accounts at this cold storage.
          </p>
        </div>
      </div>

      {isPending && (
        <div className="flex min-h-[200px] items-center justify-center">
          <Spinner className="text-primary h-8 w-8" />
        </div>
      )}

      {isError && !isPending && (
        <div className="bg-destructive/10 border-destructive/30 text-destructive rounded-lg border p-4 text-sm">
          <p className="font-medium">Could not load transfer history</p>
          <p className="text-destructive/90 mt-1">
            {error instanceof Error ? error.message : 'Something went wrong.'}
          </p>
          <button
            type="button"
            onClick={() => void refetch()}
            className="text-destructive mt-3 text-xs font-semibold underline underline-offset-2"
          >
            Try again
          </button>
        </div>
      )}

      {!isPending && !isError && passes.length === 0 && (
        <Empty className="border-border/60 min-h-[220px] rounded-xl border border-dashed">
          <EmptyMedia variant="icon">
            <ArrowRightLeft className="h-6 w-6" />
          </EmptyMedia>
          <EmptyHeader>
            <EmptyTitle>No transfers yet</EmptyTitle>
            <EmptyDescription>
              When you move stock between farmers using Transfer stock, the
              records will appear here.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}

      {!isPending && !isError && passes.length > 0 && (
        <div className="flex flex-col gap-4">
          {isFetching && !isPending && (
            <p className="text-muted-foreground text-xs">Refreshing…</p>
          )}
          <ul className="flex flex-col gap-4">
            {passes.map((entry) => (
              <li key={entry._id}>
                <TransferStockGatePassCard entry={entry} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
