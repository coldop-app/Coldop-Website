import { Box } from 'lucide-react';
import { FEATURES } from '../data';
import { SectionHeading } from './SectionHeading';

export function Features() {
  return (
    <section id="features" className="scroll-mt-24 py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          icon={Box}
          eyebrow="Comprehensive Toolset"
          title="Software built for the cold storage"
          sub="From gate passes and farmer ledgers to chamber analytics and books — Coldop runs cold storage operations end to end."
        />

        <div data-reveal-group className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <div key={feature.title} className="card-hover bg-card rounded-xl border p-6">
              <div className="bg-primary/10 text-primary flex size-11 items-center justify-center rounded-lg">
                <feature.icon className="size-5" />
              </div>
              <h3 className="mt-5 text-lg font-semibold">{feature.title}</h3>
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed text-pretty">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
