import { Link } from '@tanstack/react-router';
import { ArrowRight, Check, Layers, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PLANS } from '../data';
import { SectionHeading } from './SectionHeading';

export function Plans() {
  return (
    <section id="plans" className="bg-muted/30 scroll-mt-24 border-y py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          icon={Layers}
          eyebrow="Choose your fit"
          title="Two plans. One platform."
          sub="Base keeps everyday cold storage running smoothly. Enterprise is shaped around how your business works — from seed to dispatch."
        />

        <div data-reveal-group className="mx-auto mt-14 grid max-w-5xl gap-6 md:grid-cols-2">
          {PLANS.map((plan) => {
            const isEnterprise = plan.id === 'enterprise';

            return (
              <div
                key={plan.id}
                className={`card-hover bg-card flex flex-col rounded-xl border p-6 sm:p-8 ${
                  isEnterprise ? 'ring-primary/30 ring-1' : ''
                }`}
              >
                <div
                  className={
                    isEnterprise
                      ? 'bg-primary/5 -mx-6 -mt-6 rounded-t-xl px-6 pt-6 pb-6 sm:-mx-8 sm:-mt-8 sm:px-8 sm:pt-8 sm:pb-8'
                      : undefined
                  }
                >
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide ${
                      isEnterprise
                        ? 'bg-primary/15 text-primary'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {plan.badge}
                  </span>
                  <h3 className="mt-4 text-2xl font-bold tracking-tight">{plan.name}</h3>
                  <p className="text-muted-foreground mt-2 text-sm leading-relaxed text-pretty">
                    {plan.tagline}
                  </p>
                </div>

                <ul className="mt-8 flex flex-1 flex-col gap-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex gap-3 text-sm leading-relaxed">
                      <Check
                        className="text-primary mt-0.5 size-4 shrink-0"
                        aria-hidden
                        strokeWidth={2.5}
                      />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-8">
                  {plan.cta.kind === 'link' ? (
                    <Button asChild variant="outline" className="w-full" size="lg">
                      <Link to="/login">
                        {plan.cta.label} <ArrowRight data-icon="inline-end" />
                      </Link>
                    </Button>
                  ) : (
                    <Button asChild className="w-full" size="lg">
                      <a href={plan.cta.href}>
                        <Phone data-icon="inline-start" /> {plan.cta.label}
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
