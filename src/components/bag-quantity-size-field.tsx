import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

export type BagSizeSelectValue = string;

type FixedBagSizeLabelProps = {
  size: string;
  rowIndex: number;
};

/** Default bag-size rows: fixed label, order from BAG_SIZES. */
export function FixedBagSizeLabel({ size, rowIndex }: FixedBagSizeLabelProps) {
  return (
    <div
      className="flex min-h-8 min-w-0 items-center sm:min-h-9"
      aria-label={`Size (row ${rowIndex + 1}): ${size}`}
    >
      <span className="text-foreground truncate text-xs font-medium sm:text-sm" title={size}>
        {size}
      </span>
    </div>
  );
}

type BagSizeSelectFieldProps = {
  id: string;
  name: string;
  value: string;
  rowIndex: number;
  sizes: string[];
  isInvalid: boolean;
  errors?: Array<{ message?: string } | undefined>;
  labelClassName?: string;
  triggerClassName?: string;
  onBlur: () => void;
  onValueChange: (value: BagSizeSelectValue) => void;
};

/** Extra quantity rows only: pick which bag size to add. */
export function BagSizeSelectField({
  id,
  name,
  value,
  rowIndex,
  sizes,
  isInvalid,
  errors,
  labelClassName = 'md:sr-only',
  triggerClassName,
  onBlur,
  onValueChange,
}: BagSizeSelectFieldProps) {
  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel htmlFor={id} className={cn(labelClassName)}>
        Size (row {rowIndex + 1})
      </FieldLabel>
      <Select
        value={value || undefined}
        onValueChange={(next) => onValueChange(next as BagSizeSelectValue)}
      >
        <SelectTrigger
          id={id}
          name={name}
          className={cn('w-full', triggerClassName)}
          onBlur={onBlur}
          aria-invalid={isInvalid}
        >
          <SelectValue placeholder="Select size" />
        </SelectTrigger>
        <SelectContent>
          {sizes.map((size) => (
            <SelectItem key={size} value={size}>
              {size}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {isInvalid && <FieldError errors={errors} />}
    </Field>
  );
}
