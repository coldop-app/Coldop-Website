import { Link } from '@tanstack/react-router';
import { LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function NotFoundPage() {
  return (
    <div className="bg-background text-foreground flex min-h-svh flex-col items-center justify-center gap-6 p-6 text-center">
      <div className="space-y-2">
        <p className="text-muted-foreground font-mono text-sm tabular-nums">404</p>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">Page not found</h1>
        <p className="text-muted-foreground mx-auto max-w-md text-sm leading-relaxed">
          The page you requested does not exist or may have moved. Sign in to open the Coldop
          workspace.
        </p>
      </div>
      <Button asChild>
        <Link to="/login">
          <LogIn className="size-4" />
          Sign in
        </Link>
      </Button>
    </div>
  );
}
