import { lazy, Suspense, useRef } from 'react';
import { useLandingAnimations } from '../hooks/use-landing-animations';
import { Navbar } from './Navbar';
import { Hero } from './Hero';
import { Clients } from './Clients';
import { Stats } from './Stats';
import { HowItWorks } from './HowItWorks';
import { ChamberMap } from './ChamberMap';
import { Features } from './Features';
import { CtaBand } from './CtaBand';
import { Footer } from './Footer';

const InTheField = lazy(() => import('./InTheField').then((m) => ({ default: m.InTheField })));

export function LandingPage() {
  const rootRef = useRef<HTMLDivElement>(null);
  useLandingAnimations(rootRef);

  return (
    <div ref={rootRef} className="bg-background text-foreground min-h-screen font-sans">
      <a
        href="#main-content"
        className="bg-primary text-primary-foreground focus:ring-ring sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-100 focus:rounded-md focus:px-3 focus:py-2 focus:ring-2 focus:outline-none"
      >
        Skip to main content
      </a>
      <Navbar />
      <main id="main-content">
        <Hero />
        <Clients />
        <Stats />
        <HowItWorks />
        <ChamberMap />
        <Features />
        <Suspense
          fallback={
            <section className="border-b py-20" aria-hidden>
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="bg-muted/40 h-64 animate-pulse rounded-2xl" />
              </div>
            </section>
          }
        >
          <InTheField />
        </Suspense>
        <CtaBand />
      </main>
      <Footer />
    </div>
  );
}
