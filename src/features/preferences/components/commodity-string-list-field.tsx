import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import type { PreferencesFormApi } from '../forms/use-preferences-form';

type CommodityStringListFieldProps = {
  form: PreferencesFormApi;
  fieldName: `commodities[${number}].varieties` | `commodities[${number}].sizes`;
  label: string;
  description: string;
  placeholder: string;
  addLabel: string;
  itemLabel: (index: number) => string;
};

export function CommodityStringListField({
  form,
  fieldName,
  label,
  description,
  placeholder,
  addLabel,
  itemLabel,
}: CommodityStringListFieldProps) {
  return (
    <form.Field name={fieldName} mode="array">
      {(listField) => {
        const listInvalid = listField.state.meta.isTouched && !listField.state.meta.isValid;

        return (
          <Field data-invalid={listInvalid}>
            <FieldLabel>{label}</FieldLabel>
            <FieldDescription>{description}</FieldDescription>

            <div className="flex flex-col gap-2">
              {listField.state.value.length === 0 ? (
                <p className="text-muted-foreground text-sm">No {label.toLowerCase()} added yet.</p>
              ) : (
                listField.state.value.map((_, itemIndex) => (
                  <form.Field key={itemIndex} name={`${fieldName}[${itemIndex}]`}>
                    {(itemField) => {
                      const isInvalid =
                        itemField.state.meta.isTouched && !itemField.state.meta.isValid;

                      return (
                        <div className="flex items-start gap-2">
                          <Field data-invalid={isInvalid} className="min-w-0 flex-1">
                            <FieldLabel htmlFor={itemField.name} className="sr-only">
                              {itemLabel(itemIndex + 1)}
                            </FieldLabel>
                            <Input
                              id={itemField.name}
                              name={itemField.name}
                              value={itemField.state.value}
                              onBlur={itemField.handleBlur}
                              onChange={(e) => itemField.handleChange(e.target.value)}
                              placeholder={placeholder}
                              aria-invalid={isInvalid}
                              aria-label={itemLabel(itemIndex + 1)}
                              className="w-full"
                            />
                            {isInvalid && <FieldError errors={itemField.state.meta.errors} />}
                          </Field>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="size-9 shrink-0"
                            aria-label={`Remove ${itemLabel(itemIndex + 1)}`}
                            onClick={() => listField.removeValue(itemIndex)}
                          >
                            <Trash2 className="size-4" aria-hidden />
                          </Button>
                        </div>
                      );
                    }}
                  </form.Field>
                ))
              )}

              {listInvalid && listField.state.meta.errors.length > 0 && (
                <FieldError errors={listField.state.meta.errors} />
              )}
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2 w-full sm:w-auto"
              onClick={() => listField.pushValue('')}
            >
              <Plus className="mr-2 size-4" aria-hidden />
              {addLabel}
            </Button>
          </Field>
        );
      }}
    </form.Field>
  );
}
