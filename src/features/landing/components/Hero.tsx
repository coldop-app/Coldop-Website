import { useEffect, useRef, useState } from 'react';
import { Link } from '@tanstack/react-router';
import gsap from 'gsap';
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  MapPin,
  Package,
  Play,
  ShieldCheck,
  User,
  Wheat,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useAuthStore } from '@/features/auth/store/use-auth-store';
import { DEFAULT_DAYBOOK_SEARCH } from '@/features/daybook/search';
import { cn } from '@/lib/utils';
import { GATE_PASSES } from '../data';
import { prefersReducedMotion, scrollToSection } from '../utils';

function HeroSummaryField({
  label,
  value,
  icon: Icon,
  valueClassName,
  className,
  truncate = true,
}: {
  label: string;
  value: string;
  icon?: typeof User;
  valueClassName?: string;
  className?: string;
  truncate?: boolean;
}) {
  return (
    <div className={cn('min-w-0 space-y-1', className)}>
      <p className="text-muted-foreground text-xs">{label}</p>
      <p
        className={cn(
          'text-foreground flex min-w-0 items-center gap-1.5 text-sm font-semibold',
          valueClassName,
        )}
        title={value}
      >
        {Icon ? <Icon className="text-muted-foreground size-3.5 shrink-0" aria-hidden /> : null}
        <span className={truncate ? 'truncate' : undefined}>{value}</span>
      </p>
    </div>
  );
}

export function Hero() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const isLoggedIn = !!accessToken;

  const passCardRef = useRef<HTMLDivElement>(null);
  const mountedRef = useRef(false);
  const [passIndex, setPassIndex] = useState(0);
  const pass = GATE_PASSES[passIndex];

  /* Live gate-pass ticker */
  useEffect(() => {
    const id = window.setInterval(() => {
      setPassIndex((i) => (i + 1) % GATE_PASSES.length);
    }, 4000);
    return () => window.clearInterval(id);
  }, []);

  /* Micro-animation on pass rotation (skipped on mount — intro covers it) */
  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      return;
    }
    if (prefersReducedMotion() || !passCardRef.current) return;
    gsap.fromTo(
      passCardRef.current,
      { y: 10, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.45, ease: 'power2.out' },
    );
  }, [passIndex]);

  const accountCta = isLoggedIn ? (
    <Button asChild size="lg">
      <Link to="/daybook" search={DEFAULT_DAYBOOK_SEARCH}>
        Go to Dashboard <ArrowUpRight data-icon="inline-end" />
      </Link>
    </Button>
  ) : (
    <Button asChild size="lg">
      <Link to="/login">
        Access Account <ArrowRight data-icon="inline-end" />
      </Link>
    </Button>
  );

  return (
    <section id="home" className="relative scroll-mt-24 overflow-hidden">
      {/* Background ornaments */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="bg-primary/10 absolute -top-32 -left-32 size-[480px] rounded-full blur-[120px]" />
        <div className="bg-chart-3/10 absolute -right-40 bottom-0 size-[420px] rounded-full blur-[120px]" />
        <div
          className="absolute inset-0 [mask-image:radial-gradient(ellipse_60%_60%_at_50%_35%,black,transparent)] opacity-60"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, var(--border) 1px, transparent 0)',
            backgroundSize: '26px 26px',
          }}
        />
      </div>

      <div className="mx-auto flex min-h-[calc(100svh-4rem)] max-w-7xl items-center px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="grid w-full grid-cols-1 items-center gap-14 lg:grid-cols-12">
          {/* Copy */}
          <div className="flex flex-col items-center justify-center gap-6 text-center lg:col-span-6 lg:items-start lg:self-center lg:text-left">
            <span
              data-anim="hero-item"
              className="border-primary/20 bg-primary/5 text-primary inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium"
            >
              <ShieldCheck className="size-3.5" /> Enterprise-grade Cold Storage ERP
            </span>

            <h1
              data-anim="hero-item"
              className="text-4xl font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl lg:leading-[1.08]"
            >
              The Complete <span className="text-primary">Cold Storage</span> Management Platform
            </h1>

            <div
              data-anim="hero-item"
              className="border-primary bg-primary/5 max-w-lg rounded-r-lg border-l-2 px-4 py-2.5 text-left"
            >
              <p className="text-sm font-semibold">
                ਪੰਜਾਬ ਦੇ ਆਲੂ ਉਤਪਾਦਕਾਂ ਅਤੇ ਕੋਲਡ ਸਟੋਰਾਂ ਲਈ ਸਭ ਤੋਂ ਭਰੋਸੇਮੰਦ ਸਾਫਟਵੇਅਰ।
              </p>
              <p className="text-muted-foreground mt-0.5 text-xs">
                The most trusted digital ledger &amp; real-time telemetry for potato storages.
              </p>
            </div>

            <p
              data-anim="hero-item"
              className="text-muted-foreground max-w-lg text-base text-pretty sm:text-lg"
            >
              Replace manual reporting with Coldop — real-time analytics, instant PDF and Excel
              exports, live stock ledgers, and precise location tracking by chamber, floor, and row.
            </p>

            <div
              data-anim="hero-item"
              className="flex flex-wrap items-center justify-center gap-3 lg:justify-start"
            >
              {accountCta}
              <Button variant="outline" size="lg" onClick={() => scrollToSection('in-the-field')}>
                <Play data-icon="inline-start" /> Watch Operation Reels
              </Button>
            </div>

            <div
              data-anim="hero-item"
              className="text-muted-foreground flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs lg:justify-start"
            >
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="text-primary size-3.5" /> No hardware required
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="text-primary size-3.5" /> Works on any device
              </span>
            </div>
          </div>

          {/* Product visual */}
          <div className="flex justify-center lg:col-span-6 lg:self-center">
            <div data-anim="hero-visual" className="relative w-full max-w-[540px]">
              <div
                aria-hidden
                className="bg-primary/10 absolute -inset-8 -z-10 rounded-full blur-3xl"
              />

              <div className="bg-card rounded-2xl border shadow-xl">
                {/* Console header */}
                <div className="flex items-center justify-between border-b px-5 py-3.5">
                  <span className="text-muted-foreground flex items-center gap-2 font-mono text-xs font-semibold tracking-wider">
                    <span className="relative flex size-2">
                      <span className="bg-primary absolute inline-flex h-full w-full animate-ping rounded-full opacity-60" />
                      <span className="bg-primary relative inline-flex size-2 rounded-full" />
                    </span>
                    LIVE DAYBOOK
                  </span>
                  <span className="border-primary/20 bg-primary/10 text-primary rounded-md border px-2 py-0.5 text-[10px] font-semibold tracking-wide">
                    GATE PASS STREAM
                  </span>
                </div>

                <div className="space-y-3 p-5">
                  {/* Rotating gate pass — mirrors IncomingGatePassCard */}
                  <div ref={passCardRef}>
                    <Card className="card-hover border-border/60 overflow-hidden border">
                      <CardHeader className="border-border/40 bg-muted/10 flex flex-col gap-3 border-b pb-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="space-y-1">
                          <CardTitle className="flex items-center gap-2 text-base">
                            <span className="bg-primary size-2 rounded-full" />
                            IGP{' '}
                            <span className="text-primary font-mono tabular-nums">
                              #{pass.gatePassNo}
                            </span>
                          </CardTitle>
                          <CardDescription className="text-xs">{pass.createdAt}</CardDescription>
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5 sm:justify-end">
                          <Badge
                            variant="outline"
                            className="bg-background text-xs"
                            title={pass.variety}
                          >
                            {pass.variety}
                          </Badge>
                          <Badge variant="outline" className="bg-background text-xs tabular-nums">
                            {pass.bags.toLocaleString('en-IN')} Bags
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <div className="grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-3">
                          <HeroSummaryField label="Farmer" value={pass.farmer} icon={User} />
                          <HeroSummaryField
                            label="Account"
                            value={pass.account}
                            valueClassName="font-mono tabular-nums"
                          />
                          <HeroSummaryField label="Variety" value={pass.variety} icon={Package} />
                          <HeroSummaryField
                            label="Lot No"
                            value={pass.lotNo}
                            valueClassName="font-mono tabular-nums"
                          />
                          <HeroSummaryField
                            label="Location"
                            value={pass.location}
                            icon={MapPin}
                            className="col-span-2 sm:col-span-2"
                            truncate={false}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Analytics summary cards */}
                  <div className="grid grid-cols-2 gap-3">
                    <Card size="sm" className="border-border/60 gap-0 border shadow-none ring-0">
                      <CardHeader className="pb-2">
                        <CardDescription className="text-xs font-medium tracking-wider uppercase">
                          Total Inventory (Current)
                        </CardDescription>
                        <CardAction>
                          <div className="bg-primary/10 flex size-9 items-center justify-center rounded-xl">
                            <Package className="text-primary size-4" aria-hidden />
                          </div>
                        </CardAction>
                      </CardHeader>
                      <CardContent className="flex flex-col gap-1.5">
                        <p className="font-heading text-primary text-2xl font-semibold tracking-tight tabular-nums">
                          76,954
                        </p>
                        <p className="text-muted-foreground text-sm">Bags in storage</p>
                      </CardContent>
                    </Card>

                    <Card size="sm" className="border-border/60 gap-0 border shadow-none ring-0">
                      <CardHeader className="pb-2">
                        <CardDescription className="text-xs font-medium tracking-wider uppercase">
                          Top Variety
                        </CardDescription>
                        <CardAction>
                          <div className="bg-primary/10 flex size-9 items-center justify-center rounded-xl">
                            <Wheat className="text-primary size-4" aria-hidden />
                          </div>
                        </CardAction>
                      </CardHeader>
                      <CardContent className="flex flex-col gap-1.5">
                        <p className="font-heading text-foreground text-2xl font-semibold tracking-tight">
                          Chipsona 1
                        </p>
                        <p className="text-muted-foreground text-sm">24,810 bags</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Occupancy */}
                  <div className="bg-muted/40 rounded-lg border p-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Warehouse occupancy</span>
                      <span className="font-semibold tabular-nums">
                        76,954 / 90,000 bags · 85.5%
                      </span>
                    </div>
                    <div className="bg-border mt-2.5 h-2 overflow-hidden rounded-full">
                      <div
                        data-anim="occupancy"
                        className="bg-primary h-full w-[85.5%] rounded-full"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
