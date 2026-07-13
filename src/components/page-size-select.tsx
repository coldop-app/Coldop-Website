import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

export const DEFAULT_PAGE_SIZE_OPTIONS = [10, 50, 100] as const;

interface PageSizeSelectProps {
  value: number;
  onValueChange: (value: number) => void;
  options?: readonly number[];
  disabled?: boolean;
  className?: string;
}

export function PageSizeSelect({
  value,
  onValueChange,
  options = DEFAULT_PAGE_SIZE_OPTIONS,
  disabled,
  className,
}: PageSizeSelectProps) {
  return (
    <div className={cn('text-muted-foreground flex items-center gap-2.5 text-sm', className)}>
      <Select
        value={`${value}`}
        onValueChange={(next) => onValueChange(Number(next))}
        disabled={disabled}
      >
        <SelectTrigger className="border-border/60 bg-background h-10 min-w-19 gap-2 px-3.5 font-medium tabular-nums shadow-sm">
          <SelectValue />
        </SelectTrigger>

        <SelectContent side="top" align="center">
          {options.map((size) => (
            <SelectItem key={size} value={`${size}`} className="tabular-nums">
              {size}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <span className="whitespace-nowrap">per page</span>
    </div>
  );
}
