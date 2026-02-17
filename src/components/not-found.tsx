import { memo } from 'react';
import { Link, useRouter } from '@tanstack/react-router';
import { Home, ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from '@/components/ui/empty';

const NotFound = () => {
  const router = useRouter();

  return (
    <section className="bg-secondary dark:bg-background/80 flex min-h-screen flex-col items-center justify-center px-4 py-16 sm:px-8 sm:py-24">
      <Empty className="max-w-md">
        <EmptyHeader>
          <EmptyMedia
            variant="default"
            className="font-custom text-primary/90 dark:text-primary/80 mb-4 text-[4rem] font-bold tracking-tighter sm:text-[5rem]"
          >
            404
          </EmptyMedia>
          <EmptyTitle className="font-custom text-2xl font-semibold tracking-tight text-[#333] sm:text-3xl dark:text-gray-100">
            Page not found
          </EmptyTitle>
          <EmptyDescription className="font-custom text-base leading-relaxed text-gray-600 sm:text-lg dark:text-gray-400">
            The page you're looking for doesn't exist or has been moved.
          </EmptyDescription>
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
          </div>
        </EmptyContent>
      </Empty>
    </section>
  );
};

export default memo(NotFound);
