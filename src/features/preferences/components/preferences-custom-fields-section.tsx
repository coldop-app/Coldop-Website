import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import type { PreferencesFormApi } from '../forms/use-preferences-form';

type PreferencesCustomFieldsSectionProps = {
  form: PreferencesFormApi;
};

export function PreferencesCustomFieldsSection({ form }: PreferencesCustomFieldsSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading text-base font-semibold">Custom fields</CardTitle>
        <CardDescription>Additional configuration for your cold storage.</CardDescription>
      </CardHeader>
      <CardContent>
        <form.Field name="customFields" mode="array">
          {(field) => (
            <div className="flex flex-col gap-4">
              {field.state.value.map((_, index) => (
                <div
                  key={index}
                  className="border-border grid gap-4 rounded-xl border p-4 sm:grid-cols-[1fr_1fr_auto]"
                >
                  <form.Field name={`customFields[${index}].key`}>
                    {(subField) => {
                      const isInvalid =
                        subField.state.meta.isTouched && !subField.state.meta.isValid;

                      return (
                        <Field data-invalid={isInvalid}>
                          <FieldLabel htmlFor={subField.name}>Field</FieldLabel>
                          <Input
                            id={subField.name}
                            name={subField.name}
                            value={subField.state.value}
                            onBlur={subField.handleBlur}
                            onChange={(e) => subField.handleChange(e.target.value)}
                            placeholder="defaultChamber"
                            aria-invalid={isInvalid}
                            className="h-11 text-base"
                          />
                          {isInvalid && <FieldError errors={subField.state.meta.errors} />}
                        </Field>
                      );
                    }}
                  </form.Field>

                  <form.Field name={`customFields[${index}].value`}>
                    {(subField) => (
                      <Field>
                        <FieldLabel htmlFor={subField.name}>Value</FieldLabel>
                        <Input
                          id={subField.name}
                          name={subField.name}
                          value={subField.state.value}
                          onBlur={subField.handleBlur}
                          onChange={(e) => subField.handleChange(e.target.value)}
                          placeholder="A1"
                          className="h-11 text-base"
                        />
                      </Field>
                    )}
                  </form.Field>

                  <div className="flex items-end">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="size-11 shrink-0"
                      aria-label={`Remove custom field ${index + 1}`}
                      onClick={() => field.removeValue(index)}
                    >
                      <Trash2 className="size-4" aria-hidden />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </form.Field>
      </CardContent>
    </Card>
  );
}
