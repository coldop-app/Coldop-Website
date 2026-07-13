import type { LucideIcon } from 'lucide-react';

export function SectionHeading({
  icon: Icon,
  eyebrow,
  title,
  sub,
}: {
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  sub: string;
}) {
  return (
    <div data-reveal className="mx-auto max-w-2xl space-y-3 text-center">
      <p className="text-primary inline-flex items-center gap-1.5 text-xs font-semibold tracking-widest uppercase">
        <Icon className="size-3.5" /> {eyebrow}
      </p>
      <h2 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">{title}</h2>
      <p className="text-muted-foreground text-pretty">{sub}</p>
    </div>
  );
}
