import { Workflow } from 'lucide-react';
import { STEPS } from '../data';
import { SectionHeading } from './SectionHeading';

export function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-24 py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          icon={Workflow}
          eyebrow="The Workflow"
          title="From gate to ledger in three steps"
          sub="One entry at the gate ripples through receipts, stock maps, and accounts — with nobody copying rows between registers."
        />

        <div data-reveal-group className="mt-14 grid gap-5 md:grid-cols-3">
          {STEPS.map((step) => (
            <div key={step.num} className="card-hover bg-card rounded-xl border p-6">
              <div className="flex items-start justify-between">
                <div className="bg-primary/10 text-primary flex size-11 items-center justify-center rounded-lg">
                  <step.icon className="size-5" />
                </div>
                <span className="font-heading text-primary/15 text-5xl leading-none font-bold">
                  {step.num}
                </span>
              </div>
              <h3 className="mt-5 text-lg font-semibold">{step.title}</h3>
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed text-pretty">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
