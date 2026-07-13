import { STATS } from '../data';
import { formatStat } from '../utils';

export function Stats() {
  return (
    <section aria-labelledby="stats-heading" className="border-b">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <h2 id="stats-heading" className="sr-only">
          Coldop platform impact
        </h2>
        <div data-reveal-group className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4">
          {STATS.map((stat, i) => (
            <div key={stat.label} className={`space-y-2 text-center ${i > 0 ? 'lg:border-l' : ''}`}>
              <p className="font-heading text-4xl font-bold sm:text-5xl">
                <span data-counter={stat.value} data-counter-format={stat.format}>
                  {formatStat(stat.value, stat.format)}
                </span>
              </p>
              <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
