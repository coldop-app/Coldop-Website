import { memo } from 'react';
import { Link, useRouter } from '@tanstack/react-router';
import { Home, ArrowLeft, RefreshCw, AlertTriangle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from '@/components/ui/empty';

interface ErrorPageProps {
  error?: Error;
  info?: { componentStack?: string };
  reset?: () => void;
}

const ErrorPage = ({ error, reset }: ErrorPageProps) => {
  const router = useRouter();
  const isDev = import.meta.env.DEV;
  const errorMessage = error?.message;

  return (
    <section className="bg-secondary dark:bg-background/80 flex min-h-screen flex-col items-center justify-center px-4 py-16 sm:px-8 sm:py-24">
      <Empty className="max-w-md">
        <EmptyHeader>
          <EmptyMedia
            variant="default"
            className="font-custom text-primary/90 dark:text-primary/80 mb-4 flex size-20 items-center justify-center sm:size-24"
          >
            <AlertTriangle className="size-16 sm:size-20" strokeWidth={1.5} />
          </EmptyMedia>
          <EmptyTitle className="font-custom text-2xl font-semibold tracking-tight text-[#333] sm:text-3xl dark:text-gray-100">
            Something went wrong
          </EmptyTitle>
          <EmptyDescription className="font-custom text-base leading-relaxed text-gray-600 sm:text-lg dark:text-gray-400">
            We encountered an unexpected error. Please try again or return to
            the home page.
          </EmptyDescription>
          {isDev && errorMessage && (
            <p className="font-custom bg-muted text-muted-foreground dark:bg-muted/50 mt-4 max-w-full truncate rounded-md px-3 py-2 text-left text-sm">
              {errorMessage}
            </p>
          )}
        </EmptyHeader>
        <EmptyContent>
          <div className="flex flex-wrap justify-center gap-3">
            <Button
              variant="default"
              size="lg"
              asChild
              className="font-custom font-bold"
            >
              <Link to="/">
                <Home className="mr-2 h-4 w-4" />
                Return home
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => router.history.back()}
              className="font-custom"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go back
            </Button>
            {reset && (
              <Button
                variant="outline"
                size="lg"
                onClick={reset}
                className="font-custom"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Try again
              </Button>
            )}
          </div>
        </EmptyContent>
      </Empty>
    </section>
  );
};

export default memo(ErrorPage);
