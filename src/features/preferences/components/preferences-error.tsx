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
import { SettingsBackButton } from '@/features/settings/components/settings-back-button';
import { getApiErrorMessage } from '@/lib/api-client';

type PreferencesErrorProps = {
  error: unknown;
  onRetry: () => void;
  isRetrying?: boolean;
};

export function PreferencesError({ error, onRetry, isRetrying = false }: PreferencesErrorProps) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-4 sm:gap-6">
      <SettingsBackButton />

      <header>
        <h1 className="font-heading text-foreground text-xl font-semibold tracking-tight sm:text-2xl">
          Preferences
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Cold storage configuration and display options
        </p>
      </header>

      <Empty className="border-border border border-dashed">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <AlertCircle aria-hidden />
          </EmptyMedia>
          <EmptyTitle>Could not load preferences</EmptyTitle>
          <EmptyDescription>
            {getApiErrorMessage(error, 'Something went wrong while loading your preferences.')}
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
    </div>
  );
}
