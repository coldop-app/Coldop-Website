import { Plus, Sprout, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import type { PreferencesFormApi } from '../forms/use-preferences-form';
import { emptyCommodity } from '../schemas/preferences-form-schema';
import { CommodityStringListField } from './commodity-string-list-field';

type PreferencesCommoditiesSectionProps = {
  form: PreferencesFormApi;
};

export function PreferencesCommoditiesSection({ form }: PreferencesCommoditiesSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading flex items-center gap-2 text-base font-semibold">
          <Sprout className="text-primary size-4" aria-hidden />
          Commodities
        </CardTitle>
        <CardDescription>
          Manage each commodity with individual varieties and bag sizes.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form.Field name="commodities" mode="array">
          {(field) => (
            <div className="flex flex-col gap-4">
              {field.state.value.length === 0 ? (
                <Empty className="border-border border border-dashed p-8">
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <Sprout aria-hidden />
                    </EmptyMedia>
                    <EmptyTitle>No commodities</EmptyTitle>
                    <EmptyDescription>
                      Add commodities to define varieties and sizes for your cold storage.
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              ) : (
                field.state.value.map((_, index) => (
                  <div
                    key={index}
                    className="border-border flex flex-col gap-4 rounded-xl border p-4 sm:p-5"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-heading text-foreground text-sm font-semibold">
                        Commodity {index + 1}
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="size-9 shrink-0"
                        aria-label={`Remove commodity ${index + 1}`}
                        onClick={() => field.removeValue(index)}
                      >
                        <Trash2 className="size-4" aria-hidden />
                      </Button>
                    </div>

                    <form.Field name={`commodities[${index}].name`}>
                      {(subField) => {
                        const isInvalid =
                          subField.state.meta.isTouched && !subField.state.meta.isValid;

                        return (
                          <Field data-invalid={isInvalid}>
                            <FieldLabel htmlFor={subField.name}>Name</FieldLabel>
                            <Input
                              id={subField.name}
                              name={subField.name}
                              value={subField.state.value}
                              onBlur={subField.handleBlur}
                              onChange={(e) => subField.handleChange(e.target.value)}
                              placeholder="e.g. Potato"
                              aria-invalid={isInvalid}
                              className="w-full"
                            />
                            {isInvalid && <FieldError errors={subField.state.meta.errors} />}
                          </Field>
                        );
                      }}
                    </form.Field>

                    <Separator />

                    <div className="grid gap-6 lg:grid-cols-2">
                      <CommodityStringListField
                        form={form}
                        fieldName={`commodities[${index}].varieties`}
                        label="Varieties"
                        description="Add, edit, or remove each variety individually."
                        placeholder="e.g. Chipsona"
                        addLabel="Add variety"
                        itemLabel={(itemIndex) => `Variety ${itemIndex} for commodity ${index + 1}`}
                      />
                      <CommodityStringListField
                        form={form}
                        fieldName={`commodities[${index}].sizes`}
                        label="Sizes"
                        description="Add, edit, or remove each bag size individually."
                        placeholder="e.g. 50kg"
                        addLabel="Add size"
                        itemLabel={(itemIndex) => `Size ${itemIndex} for commodity ${index + 1}`}
                      />
                    </div>
                  </div>
                ))
              )}

              <Button
                type="button"
                variant="outline"
                className="h-11 w-full sm:w-auto"
                onClick={() => field.pushValue(emptyCommodity())}
              >
                <Plus className="mr-2 size-4" aria-hidden />
                Add commodity
              </Button>
            </div>
          )}
        </form.Field>
      </CardContent>
    </Card>
  );
}
