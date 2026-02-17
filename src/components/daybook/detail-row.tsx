import type { LucideIcon } from 'lucide-react';

interface DetailRowProps {
  label: string;
  value: string;
  icon?: LucideIcon;
}

function DetailRow({ label, value, icon: Icon }: DetailRowProps) {
  return (
    <div className="min-w-0">
      <p className="text-muted-foreground text-xs">{label}</p>
      <div className="mt-1 flex min-w-0 items-center gap-2">
        {Icon != null && (
          <Icon className="text-muted-foreground h-3.5 w-3.5 shrink-0" />
        )}
        <p className="truncate text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}

export { DetailRow };
