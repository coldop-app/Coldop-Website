import { AlertCircle, FileQuestion, Loader2 } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type ReportStateCardProps = {
  variant: 'loading' | 'error' | 'empty';
  title?: string;
  message?: string;
  className?: string;
};

export function ReportStateCard({ variant, title, message, className }: ReportStateCardProps) {
  if (variant === 'loading') {
    return (
      <Card className={cn('overflow-hidden', className)}>
        <CardContent className="flex items-center justify-center gap-2 py-12">
          <Loader2 className="text-muted-foreground size-4 animate-spin" />
          <p className="text-muted-foreground text-sm">{message ?? 'Loading report…'}</p>
        </CardContent>
      </Card>
    );
  }

  if (variant === 'error') {
    return (
      <Card className={cn('border-destructive/40 overflow-hidden', className)}>
        <CardContent className="flex items-center justify-center gap-2 py-12">
          <AlertCircle className="text-destructive size-4" />
          <p className="text-destructive text-sm">{message ?? 'Failed to load report'}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardContent className="flex flex-col items-center justify-center gap-2 py-12">
        <FileQuestion className="text-muted-foreground size-5" />
        <p className="font-heading text-foreground text-base font-semibold">
          {title ?? 'No data available'}
        </p>
        {message ? <p className="text-muted-foreground text-sm">{message}</p> : null}
      </CardContent>
    </Card>
  );
}
