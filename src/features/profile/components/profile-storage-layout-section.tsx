import { Badge } from '@/components/ui/badge';
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
import { numericInputProps } from '@/lib/form-utils';
import { Layers3, Plus, Trash2 } from 'lucide-react';
import type { ProfileFormApi } from '../forms/use-profile-form';
import { emptyStorageFloor, emptyStorageLayoutChamber } from '../schemas/profile-form-schema';

type ProfileStorageLayoutSectionProps = {
  form: ProfileFormApi;
};

export function ProfileStorageLayoutSection({ form }: ProfileStorageLayoutSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading flex items-center gap-2 text-base font-semibold">
          <Layers3 className="text-primary size-4" aria-hidden />
          Storage layout
        </CardTitle>
        <CardDescription>
          Define chambers and floors used as stock locations in your cold storage.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form.Field name="coldStorage.storageLayout" mode="array">
          {(layoutField) => (
            <div className="flex flex-col gap-4">
              {layoutField.state.value.length === 0 ? (
                <Empty className="border-border border border-dashed p-8">
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <Layers3 aria-hidden />
                    </EmptyMedia>
                    <EmptyTitle>No storage layout</EmptyTitle>
                    <EmptyDescription>
                      Add chambers and floors to model your storage layout.
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              ) : (
                layoutField.state.value.map((chamber, chamberIndex) => {
                  const totalCapacity = chamber.floors.reduce(
                    (sum, floor) => sum + floor.capacity,
                    0,
                  );

                  return (
                    <div
                      key={chamberIndex}
                      className="border-border flex flex-col gap-4 rounded-xl border p-4 sm:p-5"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <p className="font-heading text-foreground text-sm font-semibold">
                            Chamber {chamberIndex + 1}
                          </p>
                          <Badge variant="secondary">
                            {chamber.floors.length}{' '}
                            {chamber.floors.length === 1 ? 'floor' : 'floors'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <p className="text-muted-foreground text-sm">
                            Total capacity:
                            <span className="ml-1 tabular-nums">{totalCapacity}</span>
                          </p>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="size-9 shrink-0"
                            aria-label={`Remove chamber ${chamberIndex + 1}`}
                            onClick={() => layoutField.removeValue(chamberIndex)}
                          >
                            <Trash2 className="size-4" aria-hidden />
                          </Button>
                        </div>
                      </div>

                      <form.Field name={`coldStorage.storageLayout[${chamberIndex}].name`}>
                        {(chamberNameField) => {
                          const isInvalid =
                            chamberNameField.state.meta.isTouched &&
                            !chamberNameField.state.meta.isValid;

                          return (
                            <Field data-invalid={isInvalid}>
                              <FieldLabel htmlFor={chamberNameField.name}>Chamber name</FieldLabel>
                              <Input
                                id={chamberNameField.name}
                                name={chamberNameField.name}
                                value={chamberNameField.state.value}
                                onBlur={chamberNameField.handleBlur}
                                onChange={(event) =>
                                  chamberNameField.handleChange(event.target.value)
                                }
                                placeholder="e.g. Chamber A"
                                aria-invalid={isInvalid}
                              />
                              {isInvalid && (
                                <FieldError errors={chamberNameField.state.meta.errors} />
                              )}
                            </Field>
                          );
                        }}
                      </form.Field>

                      <Separator />

                      <form.Field
                        name={`coldStorage.storageLayout[${chamberIndex}].floors`}
                        mode="array"
                      >
                        {(floorsField) => (
                          <div className="flex flex-col gap-3">
                            {floorsField.state.value.length === 0 ? (
                              <p className="text-muted-foreground text-sm">
                                Add at least one floor for this chamber.
                              </p>
                            ) : (
                              floorsField.state.value.map((_, floorIndex) => (
                                <div
                                  key={floorIndex}
                                  className="grid gap-4 sm:grid-cols-[1fr_1fr_auto]"
                                >
                                  <form.Field
                                    name={`coldStorage.storageLayout[${chamberIndex}].floors[${floorIndex}].name`}
                                  >
                                    {(floorNameField) => {
                                      const isInvalid =
                                        floorNameField.state.meta.isTouched &&
                                        !floorNameField.state.meta.isValid;

                                      return (
                                        <Field data-invalid={isInvalid}>
                                          <FieldLabel htmlFor={floorNameField.name}>
                                            Floor name
                                          </FieldLabel>
                                          <Input
                                            id={floorNameField.name}
                                            name={floorNameField.name}
                                            value={floorNameField.state.value}
                                            onBlur={floorNameField.handleBlur}
                                            onChange={(event) =>
                                              floorNameField.handleChange(event.target.value)
                                            }
                                            placeholder="e.g. Ground Floor"
                                            aria-invalid={isInvalid}
                                          />
                                          {isInvalid && (
                                            <FieldError errors={floorNameField.state.meta.errors} />
                                          )}
                                        </Field>
                                      );
                                    }}
                                  </form.Field>

                                  <form.Field
                                    name={`coldStorage.storageLayout[${chamberIndex}].floors[${floorIndex}].capacity`}
                                  >
                                    {(floorCapacityField) => {
                                      const isInvalid =
                                        floorCapacityField.state.meta.isTouched &&
                                        !floorCapacityField.state.meta.isValid;

                                      return (
                                        <Field data-invalid={isInvalid}>
                                          <FieldLabel htmlFor={floorCapacityField.name}>
                                            Capacity
                                          </FieldLabel>
                                          <Input
                                            id={floorCapacityField.name}
                                            name={floorCapacityField.name}
                                            {...numericInputProps}
                                            min={1}
                                            step={1}
                                            inputMode="numeric"
                                            value={
                                              floorCapacityField.state.value === 0
                                                ? ''
                                                : floorCapacityField.state.value
                                            }
                                            onBlur={floorCapacityField.handleBlur}
                                            onChange={(event) =>
                                              floorCapacityField.handleChange(
                                                event.target.value === ''
                                                  ? 0
                                                  : Number(event.target.value),
                                              )
                                            }
                                            aria-invalid={isInvalid}
                                            className="tabular-nums"
                                          />
                                          {isInvalid && (
                                            <FieldError
                                              errors={floorCapacityField.state.meta.errors}
                                            />
                                          )}
                                        </Field>
                                      );
                                    }}
                                  </form.Field>

                                  <div className="flex items-end">
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="icon"
                                      className="size-9 shrink-0"
                                      aria-label={`Remove floor ${floorIndex + 1} from chamber ${chamberIndex + 1}`}
                                      onClick={() => floorsField.removeValue(floorIndex)}
                                    >
                                      <Trash2 className="size-4" aria-hidden />
                                    </Button>
                                  </div>
                                </div>
                              ))
                            )}

                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="w-full sm:w-auto"
                              onClick={() => floorsField.pushValue(emptyStorageFloor())}
                            >
                              <Plus className="mr-2 size-4" aria-hidden />
                              Add floor
                            </Button>
                          </div>
                        )}
                      </form.Field>
                    </div>
                  );
                })
              )}

              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-auto"
                onClick={() => layoutField.pushValue(emptyStorageLayoutChamber())}
              >
                <Plus className="mr-2 size-4" aria-hidden />
                Add chamber
              </Button>
            </div>
          )}
        </form.Field>
      </CardContent>
    </Card>
  );
}
