import { MessageSquare } from 'lucide-react';
import { SectionHeading } from './SectionHeading';
import { InstagramReel } from './InstagramReel';

export function InTheField() {
  return (
    <section id="in-the-field" className="bg-muted/30 scroll-mt-24 border-y py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          icon={MessageSquare}
          eyebrow="Live Action Proof"
          title="Coldop in the field"
          sub="Real gate operations and potato inventories being logged across Punjab."
        />

        <div data-reveal-group className="mt-14 grid grid-cols-1 items-start gap-8 md:grid-cols-12">
          <div className="space-y-4 md:col-span-8">
            <div className="bg-card rounded-xl border p-2 shadow-sm">
              <div className="aspect-video w-full overflow-hidden rounded-lg bg-black">
                <iframe
                  src="https://www.youtube.com/embed/aCQ3rb-K_m0"
                  title="From Registers to Real-Time: The ColdOp Story"
                  className="h-full w-full border-0"
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            </div>
            <div className="space-y-1 px-2">
              <h3 className="text-lg font-semibold">
                From Registers to Real-Time: The ColdOp Story
              </h3>
              <p className="text-muted-foreground text-sm text-pretty">
                How traditional cold storages ran operations before and after adopting the Coldop
                platform.
              </p>
            </div>
          </div>

          <div className="space-y-4 md:col-span-4">
            <div className="bg-card mx-auto w-full max-w-[340px] rounded-xl border p-2 shadow-sm">
              <div className="h-[480px] w-full overflow-hidden rounded-lg border">
                <InstagramReel />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
