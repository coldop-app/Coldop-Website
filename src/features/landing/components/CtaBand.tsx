import { Link } from '@tanstack/react-router';
import { ArrowRight, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function CtaBand() {
  return (
    <section className="py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          data-reveal
          className="bg-primary text-primary-foreground relative overflow-hidden rounded-2xl px-6 py-14 text-center sm:px-16 lg:py-20"
        >
          <div aria-hidden className="pointer-events-none absolute inset-0">
            <div className="bg-primary-foreground/10 absolute -top-24 -right-16 size-72 rounded-full blur-2xl" />
            <div className="bg-primary-foreground/10 absolute -bottom-28 -left-16 size-72 rounded-full blur-2xl" />
          </div>

          <div className="relative">
            <h2 className="text-primary-foreground text-3xl font-bold tracking-tight text-balance sm:text-4xl">
              Ready to retire the register?
            </h2>
            <p className="text-primary-foreground/85 mx-auto mt-3 max-w-xl text-pretty">
              Bring your chambers, gate passes, and farmer ledgers onto one platform. Setup takes a
              day — not a season.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button asChild size="lg" variant="secondary">
                <Link to="/login">
                  Access Account <ArrowRight data-icon="inline-end" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground bg-transparent dark:bg-transparent"
              >
                <a href="tel:+919877069258">
                  <Phone data-icon="inline-start" /> Call +91 9877069258
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
