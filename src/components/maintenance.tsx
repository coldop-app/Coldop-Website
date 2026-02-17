import { Construction } from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';

export function Maintenance() {
  return (
    <div className="relative flex min-h-dvh w-full flex-col items-center justify-center overflow-hidden bg-linear-to-b from-background via-background to-muted/30 p-6">
      {/* Subtle grid pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.02] dark:opacity-[0.04]"
        style={{
          backgroundImage: `linear-gradient(to right, currentColor 1px, transparent 1px),
            linear-gradient(to bottom, currentColor 1px, transparent 1px)`,
          backgroundSize: '3rem 3rem',
        }}
      />

      <Card className="relative z-10 w-full max-w-md border-border/60 bg-card/95 shadow-xl backdrop-blur-sm">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Construction className="size-8" strokeWidth={1.5} />
          </div>
          <CardTitle className="text-2xl font-semibold tracking-tight">
            We&apos;re just sprucing things up
          </CardTitle>
          <CardDescription className="text-base">
            Thank you for stopping by. We&apos;re doing a little maintenance so we
            can serve you even better — we&apos;ll be back before you know it.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-6 pb-8">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Spinner className="size-5" />
            <span className="text-sm font-medium">We&apos;ll be right with you</span>
          </div>
          <p className="text-center text-xs text-muted-foreground/80">
            We truly appreciate your patience and understanding.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
