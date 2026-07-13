import { Link } from '@tanstack/react-router';
import { Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function NotFoundPage() {
  return (
    <div className="bg-background text-foreground flex min-h-svh flex-col items-center justify-center gap-6 p-6 text-center">
      <div className="space-y-2">
        <p className="text-muted-foreground font-mono text-sm tabular-nums">404</p>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">Page not found</h1>
        <p className="text-muted-foreground mx-auto max-w-md text-sm leading-relaxed">
          The page you requested does not exist or may have moved. Return home or sign in to the
          Coldop workspace.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button asChild>
          <Link to="/">
            <Home className="size-4" />
            Go home
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/login">Sign in</Link>
        </Button>
      </div>
    </div>
  );
}
