import { cn } from '@/lib/utils';

/** App logo mark — matches the sidebar brand treatment. */
export function BrandMark({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <img
        src="/icon-192x192.webp"
        alt="Coldop"
        width={40}
        height={40}
        className="size-10 shrink-0 rounded-md object-contain"
        decoding="async"
      />
      <span className="font-heading text-lg leading-none font-semibold tracking-tight">Coldop</span>
    </div>
  );
}
