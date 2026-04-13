import { memo } from 'react';
import { Building2, Mail, Phone, ShieldCheck } from 'lucide-react';

import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';

const InactiveColdStorageScreen = () => {
  return (
    <section className="bg-secondary/40 dark:bg-background/80 flex min-h-screen flex-col items-center justify-center px-4 py-16 sm:px-8 sm:py-24">
      <Empty className="max-w-2xl border-border/70 bg-background/85 shadow-sm backdrop-blur-sm dark:bg-background/45">
        <EmptyHeader className="max-w-xl space-y-3">
          <p className="text-primary bg-primary/10 mx-auto inline-flex rounded-full px-3 py-1 text-xs font-medium tracking-wide uppercase">
            Subscription Required
          </p>

          <EmptyMedia
            variant="icon"
            className="bg-primary/10 text-primary mb-2 size-14 rounded-2xl ring-1 ring-black/5 sm:size-16 dark:ring-white/10"
          >
            <Building2 className="size-7 sm:size-8" />
          </EmptyMedia>

          <EmptyTitle className="font-custom text-2xl font-semibold tracking-tight text-[#333] sm:text-3xl dark:text-gray-100">
            Your Coldop Workspace Is Currently Inactive
          </EmptyTitle>

          <EmptyDescription className="font-custom text-muted-foreground text-base leading-relaxed sm:text-lg">
            Thank you for trying Coldop. Your free trial has ended, and access
            is temporarily paused. Complete your payment to reactivate your
            workspace and continue without interruption.
          </EmptyDescription>
        </EmptyHeader>

        <EmptyContent className="max-w-xl gap-4 pt-1">
          <div className="bg-muted/60 text-muted-foreground flex w-full items-start gap-3 rounded-xl border px-4 py-3.5 text-left">
            <ShieldCheck className="text-primary mt-0.5 size-4 shrink-0" />
            <p className="font-custom text-sm leading-relaxed sm:text-base">
              Need help with reactivation? Our team is ready to assist and
              ensure your operations are back online quickly.
            </p>
          </div>

          <div className="border-border w-full rounded-xl border border-dashed px-4 py-4 text-left">
            <p className="font-custom text-muted-foreground mb-3 text-xs font-medium tracking-wide uppercase">
              Contact
            </p>
            <ul className="font-custom text-foreground/90 space-y-2.5 text-sm sm:text-base">
              <li className="flex items-center gap-3">
                <Phone className="text-primary size-4 shrink-0 opacity-80" aria-hidden />
                <a
                  href="tel:+919877741375"
                  className="hover:text-primary underline-offset-4 transition-colors hover:underline"
                >
                  +91 9877741375
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="text-primary size-4 shrink-0 opacity-80" aria-hidden />
                <a
                  href="tel:+9198778069258"
                  className="hover:text-primary underline-offset-4 transition-colors hover:underline"
                >
                  +91 98778069258
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="text-primary size-4 shrink-0 opacity-80" aria-hidden />
                <a
                  href="mailto:coldop.app@gmail.com"
                  className="hover:text-primary underline-offset-4 transition-colors hover:underline"
                >
                  coldop.app@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </EmptyContent>
      </Empty>
    </section>
  );
};

export default memo(InactiveColdStorageScreen);
