import { AlertCircle, RefreshCw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { getApiErrorMessage } from '@/lib/api-client';

type VouchersErrorProps = {
  error: unknown;
  onRetry: () => void;
  isRetrying?: boolean;
};

export function VouchersError({ error, onRetry, isRetrying = false }: VouchersErrorProps) {
  return (
    <Empty className="border-border rounded-lg border border-dashed">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <AlertCircle aria-hidden />
        </EmptyMedia>
        <EmptyTitle>Could not load vouchers</EmptyTitle>
        <EmptyDescription>
          {getApiErrorMessage(error, 'Something went wrong while loading vouchers.')}
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button
          type="button"
          variant="outline"
          onClick={onRetry}
          disabled={isRetrying}
          className="gap-2"
        >
          <RefreshCw className={`size-4 ${isRetrying ? 'animate-spin' : ''}`} aria-hidden />
          Try again
        </Button>
      </EmptyContent>
    </Empty>
  );
}
