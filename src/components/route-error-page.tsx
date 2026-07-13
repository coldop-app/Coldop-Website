import { Link } from '@tanstack/react-router';
import type { ErrorComponentProps } from '@tanstack/react-router';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function RouteErrorPage({ error, reset }: ErrorComponentProps) {
  const message = error instanceof Error ? error.message : 'An unexpected error occurred.';

  return (
    <div className="bg-background text-foreground flex min-h-svh flex-col items-center justify-center gap-6 p-6 text-center">
      <div className="bg-destructive/10 text-destructive flex size-12 items-center justify-center rounded-full">
        <AlertTriangle className="size-6" aria-hidden />
      </div>
      <div className="space-y-2">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">Something went wrong</h1>
        <p className="text-muted-foreground mx-auto max-w-md text-sm leading-relaxed">{message}</p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        {typeof reset === 'function' ? (
          <Button type="button" onClick={reset}>
            <RotateCcw className="size-4" />
            Try again
          </Button>
        ) : null}
        <Button asChild variant="outline">
          <Link to="/">Go home</Link>
        </Button>
      </div>
    </div>
  );
}
