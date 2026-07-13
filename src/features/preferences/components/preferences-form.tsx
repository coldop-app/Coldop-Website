import { Loader2, Plus, RefreshCw, Save, Settings2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import type { Preferences } from '@/features/auth/types';
import { useUpdatePreferences } from '../api/use-update-preferences';
import { formValuesToUpdatePayload, usePreferencesForm } from '../forms/use-preferences-form';
import {
  preferencesToFormValues,
  MARKA_TYPE_OPTIONS,
  REPORT_FORMAT_OPTIONS,
} from '../schemas/preferences-form-schema';
import { SettingsBackButton } from '@/features/settings/components/settings-back-button';
import { PreferencesCommoditiesSection } from './preferences-commodities-section';
import { PreferencesCustomFieldsSection } from './preferences-custom-fields-section';
import { PreferencesUnsavedToast } from './preferences-unsaved-toast';

type PreferencesFormProps = {
  preferences: Preferences;
  onRefresh: () => void;
  isRefreshing?: boolean;
};

function humanizeLabel(value: string) {
  return value
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function PreferencesForm({
  preferences,
  onRefresh,
  isRefreshing = false,
}: PreferencesFormProps) {
  const { mutateAsync: updatePreferences, isPending } = useUpdatePreferences();

  const hasCustomFields = Object.keys(preferences.customFields ?? {}).length > 0;

  const form = usePreferencesForm({
    preferences,
    onSubmit: async (values) => {
      try {
        await updatePreferences(formValuesToUpdatePayload(values));
        toast.success('Preferences updated successfully', {
          position: 'bottom-right',
        });
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to update preferences', {
          position: 'bottom-right',
        });
      }
    },
  });

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-4 sm:gap-6">
      <SettingsBackButton />

      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="font-heading text-foreground truncate text-xl font-semibold tracking-tight sm:text-2xl">
            Preferences
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Configure cold storage display options and commodities
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={onRefresh}
          disabled={isRefreshing || isPending}
          className="shrink-0 gap-2"
        >
          {isRefreshing ? (
            <Loader2 className="size-4 animate-spin" aria-hidden />
          ) : (
            <RefreshCw className="size-4" aria-hidden />
          )}
          Refresh
        </Button>
      </header>

      <PreferencesUnsavedToast form={form} isPending={isPending} />

      <form
        onSubmit={(event) => {
          event.preventDefault();
          event.stopPropagation();
          void form.handleSubmit();
        }}
        className="flex flex-col gap-4 sm:gap-6"
      >
        <Card>
          <CardHeader>
            <CardTitle className="font-heading flex items-center gap-2 text-base font-semibold">
              <Settings2 className="text-primary size-4" aria-hidden />
              General settings
            </CardTitle>
            <CardDescription>
              Report format, finances visibility, labour cost, and display toggles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <form.Field name="reportFormat">
                {(field) => {
                  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Report format</FieldLabel>
                      <Select
                        value={field.state.value}
                        onValueChange={(value) =>
                          field.handleChange(value as (typeof REPORT_FORMAT_OPTIONS)[number])
                        }
                      >
                        <SelectTrigger
                          id={field.name}
                          className="w-full text-base"
                          aria-invalid={isInvalid}
                        >
                          <SelectValue placeholder="Select format" />
                        </SelectTrigger>
                        <SelectContent>
                          {REPORT_FORMAT_OPTIONS.map((option) => (
                            <SelectItem key={option} value={option}>
                              {humanizeLabel(option)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {isInvalid && <FieldError errors={field.state.meta.errors} />}
                    </Field>
                  );
                }}
              </form.Field>

              <form.Field name="labourCost">
                {(field) => {
                  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Labour cost</FieldLabel>
                      <FieldDescription>
                        Cost per unit in INR. Must be 0 or greater.
                      </FieldDescription>
                      <Input
                        id={field.name}
                        name={field.name}
                        type="number"
                        min={0}
                        step="0.01"
                        inputMode="decimal"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) =>
                          field.handleChange(e.target.value === '' ? 0 : Number(e.target.value))
                        }
                        aria-invalid={isInvalid}
                        className="text-base tabular-nums"
                      />
                      {isInvalid && <FieldError errors={field.state.meta.errors} />}
                    </Field>
                  );
                }}
              </form.Field>

              <form.Field name="showFinances">
                {(field) => (
                  <Field orientation="horizontal">
                    <FieldContent>
                      <FieldLabel htmlFor={field.name}>Show finances</FieldLabel>
                      <FieldDescription>
                        Display finance-related data across the app
                      </FieldDescription>
                    </FieldContent>
                    <Switch
                      id={field.name}
                      checked={field.state.value}
                      onCheckedChange={field.handleChange}
                    />
                  </Field>
                )}
              </form.Field>

              <Field orientation="horizontal">
                <FieldContent>
                  <FieldLabel htmlFor="showViewFilters">Show view filters</FieldLabel>
                  <FieldDescription>
                    Enables column and view filters on reports. Managed by your administrator.
                  </FieldDescription>
                </FieldContent>
                <Switch
                  id="showViewFilters"
                  checked={preferences.showViewFilters ?? false}
                  disabled
                  aria-readonly
                />
              </Field>

              <form.Field name="stockFilter.enabled">
                {(field) => (
                  <Field orientation="horizontal">
                    <FieldContent>
                      <FieldLabel htmlFor={field.name}>Stock filter</FieldLabel>
                      <FieldDescription>Enable stock filtering in inventory views</FieldDescription>
                    </FieldContent>
                    <Switch
                      id={field.name}
                      checked={field.state.value}
                      onCheckedChange={field.handleChange}
                    />
                  </Field>
                )}
              </form.Field>

              <form.Subscribe selector={(state) => state.values.stockFilter.enabled}>
                {(stockFilterEnabled) =>
                  stockFilterEnabled ? (
                    <form.Field name="stockFilter.options" mode="array">
                      {(listField) => {
                        const listInvalid =
                          listField.state.meta.isTouched && !listField.state.meta.isValid;

                        return (
                          <Field data-invalid={listInvalid}>
                            <FieldLabel>Stock filter options</FieldLabel>
                            <FieldDescription>
                              Define the filter values available in inventory views.
                            </FieldDescription>

                            <div className="flex flex-col gap-2">
                              {listField.state.value.length === 0 ? (
                                <p className="text-muted-foreground text-sm">
                                  No filter options added yet.
                                </p>
                              ) : (
                                listField.state.value.map((_, itemIndex) => (
                                  <form.Field
                                    key={itemIndex}
                                    name={`stockFilter.options[${itemIndex}]`}
                                  >
                                    {(itemField) => {
                                      const isInvalid =
                                        itemField.state.meta.isTouched &&
                                        !itemField.state.meta.isValid;

                                      return (
                                        <div className="flex items-start gap-2">
                                          <Field
                                            data-invalid={isInvalid}
                                            className="min-w-0 flex-1"
                                          >
                                            <FieldLabel
                                              htmlFor={itemField.name}
                                              className="sr-only"
                                            >
                                              Filter option {itemIndex + 1}
                                            </FieldLabel>
                                            <Input
                                              id={itemField.name}
                                              name={itemField.name}
                                              value={itemField.state.value}
                                              onBlur={itemField.handleBlur}
                                              onChange={(e) =>
                                                itemField.handleChange(e.target.value)
                                              }
                                              placeholder="e.g. Available, Reserved"
                                              aria-invalid={isInvalid}
                                              aria-label={`Filter option ${itemIndex + 1}`}
                                              className="w-full text-base"
                                            />
                                            {isInvalid && (
                                              <FieldError errors={itemField.state.meta.errors} />
                                            )}
                                          </Field>
                                          <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            className="size-9 shrink-0"
                                            aria-label={`Remove filter option ${itemIndex + 1}`}
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
                              Add filter option
                            </Button>
                          </Field>
                        );
                      }}
                    </form.Field>
                  ) : null
                }
              </form.Subscribe>

              <form.Field name="customMarka">
                {(field) => (
                  <Field orientation="horizontal">
                    <FieldContent>
                      <FieldLabel htmlFor={field.name}>Custom marka</FieldLabel>
                      <FieldDescription>
                        Use custom marka labels on reports and entries
                      </FieldDescription>
                    </FieldContent>
                    <Switch
                      id={field.name}
                      checked={field.state.value}
                      onCheckedChange={field.handleChange}
                    />
                  </Field>
                )}
              </form.Field>

              <form.Subscribe selector={(state) => state.values.customMarka}>
                {(customMarkaEnabled) =>
                  !customMarkaEnabled ? (
                    <form.Field name="markaType">
                      {(field) => {
                        const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

                        return (
                          <Field data-invalid={isInvalid}>
                            <FieldLabel htmlFor={field.name}>Marka type</FieldLabel>
                            <FieldDescription>
                              Choose which identifier to use as marka when custom marka is disabled
                            </FieldDescription>
                            <Select
                              value={field.state.value}
                              onValueChange={(value) =>
                                field.handleChange(value as (typeof MARKA_TYPE_OPTIONS)[number])
                              }
                            >
                              <SelectTrigger
                                id={field.name}
                                className="w-full text-base"
                                aria-invalid={isInvalid}
                              >
                                <SelectValue placeholder="Select marka type" />
                              </SelectTrigger>
                              <SelectContent>
                                {MARKA_TYPE_OPTIONS.map((option) => (
                                  <SelectItem key={option} value={option}>
                                    {humanizeLabel(option)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {isInvalid && <FieldError errors={field.state.meta.errors} />}
                          </Field>
                        );
                      }}
                    </form.Field>
                  ) : null
                }
              </form.Subscribe>
            </FieldGroup>
          </CardContent>
        </Card>

        <PreferencesCommoditiesSection form={form} />
        {hasCustomFields && <PreferencesCustomFieldsSection form={form} />}

        <Card className="border-border bg-background/95 supports-[backdrop-filter]:bg-background/80 sticky bottom-0 z-10 backdrop-blur">
          <CardFooter className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <form.Subscribe
              selector={(state) => ({
                canSubmit: state.canSubmit,
                isSubmitting: state.isSubmitting,
                isDirty: state.isDirty,
              })}
            >
              {({ canSubmit, isSubmitting, isDirty }) => (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-11 w-full sm:w-auto"
                    disabled={isSubmitting || isPending || !isDirty}
                    onClick={() => form.reset(preferencesToFormValues(preferences))}
                  >
                    Discard changes
                  </Button>
                  <Button
                    type="submit"
                    className="h-11 w-full gap-2 sm:w-auto"
                    disabled={!canSubmit || isSubmitting || isPending || !isDirty}
                  >
                    {isSubmitting || isPending ? (
                      <Loader2 className="size-4 animate-spin" aria-hidden />
                    ) : (
                      <Save className="size-4" aria-hidden />
                    )}
                    Save preferences
                  </Button>
                </>
              )}
            </form.Subscribe>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
