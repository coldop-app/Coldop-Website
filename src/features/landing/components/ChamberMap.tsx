import { useRef, useState } from 'react';
import { Link } from '@tanstack/react-router';
import gsap from 'gsap';
import { ArrowUpRight, CheckCircle2, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DEMO_CHAMBERS, type DemoFloor } from '../data';
import {
  formatBags,
  formatUtilization,
  prefersReducedMotion,
  utilizationBand,
  utilizationBandBarClass,
  utilizationBandDotClass,
  utilizationPercent,
} from '../utils';
import { SectionHeading } from './SectionHeading';

export function ChamberMap() {
  const inspectorRef = useRef<HTMLDivElement>(null);
  const [chamberId, setChamberId] = useState(DEMO_CHAMBERS[0].id);
  const chamber = DEMO_CHAMBERS.find((item) => item.id === chamberId) ?? DEMO_CHAMBERS[0];
  const [selectedFloor, setSelectedFloor] = useState<DemoFloor>(
    chamber.floors[1] ?? chamber.floors[0],
  );

  const chamberBags = chamber.floors.reduce((sum, floor) => sum + floor.bags, 0);

  const selectChamber = (id: string) => {
    const next = DEMO_CHAMBERS.find((item) => item.id === id);
    if (!next) return;
    setChamberId(id);
    const floor = next.floors[1] ?? next.floors[0];
    setSelectedFloor(floor);
    animateInspector();
  };

  const selectFloor = (floor: DemoFloor) => {
    setSelectedFloor(floor);
    animateInspector();
  };

  const animateInspector = () => {
    if (prefersReducedMotion() || !inspectorRef.current) return;
    gsap.fromTo(
      inspectorRef.current,
      { y: 6, opacity: 0.4 },
      { y: 0, opacity: 1, duration: 0.3, ease: 'power2.out' },
    );
  };

  const selectedPercent = utilizationPercent(selectedFloor.bags, selectedFloor.capacity);
  const selectedAvailable = Math.max(selectedFloor.capacity - selectedFloor.bags, 0);
  const selectedShare = chamberBags > 0 ? (selectedFloor.bags / chamberBags) * 100 : 0;
  const selectedBand = utilizationBand(selectedPercent);

  return (
    <section id="chamber-map" className="bg-muted/30 scroll-mt-24 border-y py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          icon={Layers}
          eyebrow="Location analytics"
          title="Chamber and floor utilization"
          sub="See occupancy per chamber and floor — bags stored, free capacity, and utilization at a glance."
        />

        <div
          data-reveal
          className="bg-card mt-14 grid grid-cols-1 gap-8 rounded-2xl border p-6 shadow-sm sm:p-8 lg:grid-cols-12"
        >
          <div className="space-y-4 lg:col-span-7">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-3">
              <span className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                {chamber.name} · Floor utilization
              </span>
              <span className="flex gap-4 text-xs font-medium">
                <span className="flex items-center gap-1.5">
                  <span className={`size-2.5 rounded-full ${utilizationBandDotClass('low')}`} /> Low
                </span>
                <span className="flex items-center gap-1.5">
                  <span className={`size-2.5 rounded-full ${utilizationBandDotClass('medium')}`} />{' '}
                  Medium
                </span>
                <span className="flex items-center gap-1.5">
                  <span className={`size-2.5 rounded-full ${utilizationBandDotClass('high')}`} />{' '}
                  High
                </span>
              </span>
            </div>

            <div className="flex flex-wrap gap-2" role="group" aria-label="Chambers">
              {DEMO_CHAMBERS.map((item) => {
                const active = item.id === chamber.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => selectChamber(item.id)}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                      active
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground'
                    }`}
                  >
                    {item.name}
                  </button>
                );
              })}
            </div>

            <div data-cells className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              {chamber.floors.map((floor) => {
                const percent = utilizationPercent(floor.bags, floor.capacity);
                const band = utilizationBand(percent);
                const selected = selectedFloor.id === floor.id;
                return (
                  <button
                    key={floor.id}
                    type="button"
                    onClick={() => selectFloor(floor)}
                    aria-pressed={selected}
                    className={`flex h-20 flex-col justify-between rounded-lg border p-2.5 text-left transition-all ${
                      selected
                        ? 'border-primary bg-primary/5 ring-primary/30 ring-2'
                        : 'bg-background hover:border-primary/40 hover:bg-muted/50'
                    }`}
                  >
                    <span className="text-muted-foreground font-mono text-[10px] leading-none font-semibold uppercase">
                      {floor.floor}
                    </span>
                    <div className="space-y-1.5">
                      <span className="flex items-end justify-between gap-2">
                        <span className="font-heading text-sm leading-none font-semibold tabular-nums">
                          {formatUtilization(percent)}
                        </span>
                        <span className="text-muted-foreground text-[10px] leading-none tabular-nums">
                          {formatBags(floor.bags)}
                        </span>
                      </span>
                      <div className="bg-muted h-1 overflow-hidden rounded-full">
                        <div
                          className={`h-full rounded-full ${utilizationBandBarClass(band)}`}
                          style={{ width: `${Math.min(percent, 100)}%` }}
                        />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col justify-center lg:col-span-5">
            <div ref={inspectorRef} className="bg-background rounded-xl border p-6">
              <div className="flex items-center justify-between border-b pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="bg-primary/10 text-primary flex size-9 items-center justify-center rounded-lg">
                    <Layers className="size-4" />
                  </div>
                  <div>
                    <h3 className="text-sm leading-none font-semibold">Floor Inspector</h3>
                    <p className="text-muted-foreground mt-1 font-mono text-[10px] uppercase">
                      {selectedFloor.floor} · {chamber.name}
                    </p>
                  </div>
                </div>
                <span className="border-primary/20 bg-primary/10 text-primary flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold">
                  <CheckCircle2 className="size-3" /> Live
                </span>
              </div>

              <div className="space-y-5 pt-5 text-sm">
                <div>
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="text-muted-foreground font-mono text-[10px] font-semibold tracking-wider uppercase">
                      Utilization
                    </p>
                    <p className="font-heading text-base font-bold tabular-nums">
                      {formatUtilization(selectedPercent)}
                    </p>
                  </div>
                  <div className="bg-muted mt-2 h-2.5 overflow-hidden rounded-full">
                    <div
                      className={`h-full rounded-full transition-[width] duration-300 ${utilizationBandBarClass(selectedBand)}`}
                      style={{ width: `${Math.min(selectedPercent, 100)}%` }}
                    />
                  </div>
                  <p className="text-muted-foreground mt-1.5 text-xs tabular-nums">
                    {formatBags(selectedFloor.bags)} / {formatBags(selectedFloor.capacity)} bags
                    utilized
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                  <div>
                    <p className="text-muted-foreground font-mono text-[10px] font-semibold tracking-wider uppercase">
                      Bags stored
                    </p>
                    <p className="mt-1 font-medium tabular-nums">
                      {formatBags(selectedFloor.bags)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground font-mono text-[10px] font-semibold tracking-wider uppercase">
                      Floor capacity
                    </p>
                    <p className="mt-1 font-medium tabular-nums">
                      {formatBags(selectedFloor.capacity)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground font-mono text-[10px] font-semibold tracking-wider uppercase">
                      Available space
                    </p>
                    <p className="text-primary mt-1 font-semibold tabular-nums">
                      {formatBags(selectedAvailable)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground font-mono text-[10px] font-semibold tracking-wider uppercase">
                      Share of chamber
                    </p>
                    <p className="mt-1 font-medium tabular-nums">
                      {formatUtilization(selectedShare)}
                    </p>
                  </div>
                </div>

                <div className="border-t pt-5">
                  <Button asChild className="w-full">
                    <Link to="/login">
                      View chamber analytics <ArrowUpRight data-icon="inline-end" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
