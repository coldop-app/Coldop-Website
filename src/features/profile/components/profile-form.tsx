import { Building2, EyeIcon, EyeOffIcon, Loader2, RefreshCw, Save, UserRound } from 'lucide-react';
import { useState } from 'react';
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
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { useUpdateProfile } from '../api/use-update-profile';
import {
  formValuesToUpdatePayload,
  profileToFormValues,
  useProfileForm,
} from '../forms/use-profile-form';
import type { ProfileData } from '../types';
import { hasUpdatePayloadChanges } from '../schemas/profile-form-schema';
import { SettingsBackButton } from '@/features/settings/components/settings-back-button';
import { ProfileStorageLayoutSection } from './profile-storage-layout-section';
import { ProfileUnsavedToast } from './profile-unsaved-toast';

type ProfileFormProps = {
  profile: ProfileData;
  onRefresh: () => void;
  isRefreshing?: boolean;
};

export function ProfileForm({ profile, onRefresh, isRefreshing = false }: ProfileFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { mutateAsync: updateProfile, isPending } = useUpdateProfile();

  const form = useProfileForm({
    profile,
    onSubmit: async (values) => {
      const payload = formValuesToUpdatePayload(values, profile);

      if (!hasUpdatePayloadChanges(payload)) {
        toast.info('No changes to save', { position: 'bottom-right' });
        return;
      }

      try {
        const response = await updateProfile(payload);
        // Clear dirty state immediately so the unsaved-changes toast dismisses,
        // even when storeAdmin.updatedAt does not change (e.g. storageLayout-only saves).
        form.reset({
          ...values,
          password: '',
          confirmPassword: '',
        });
        toast.success(response.message ?? 'Profile updated successfully', {
          position: 'bottom-right',
        });
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to update profile', {
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
            Profile
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage your account and cold storage details
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

      <ProfileUnsavedToast form={form} isPending={isPending} />

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
              <UserRound className="text-primary size-4" aria-hidden />
              Account
            </CardTitle>
            <CardDescription>Your name, mobile number, and password</CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <form.Field name="name">
                {(field) => {
                  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Name</FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(event) => field.handleChange(event.target.value)}
                        autoComplete="name"
                        aria-invalid={isInvalid}
                        className="h-11 text-base"
                      />
                      {isInvalid && <FieldError errors={field.state.meta.errors} />}
                    </Field>
                  );
                }}
              </form.Field>

              <form.Field name="mobileNumber">
                {(field) => {
                  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Mobile number</FieldLabel>
                      <FieldDescription>
                        This is the mobile number that you will use to login
                      </FieldDescription>
                      <Input
                        id={field.name}
                        name={field.name}
                        type="tel"
                        inputMode="numeric"
                        maxLength={10}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(event) => field.handleChange(event.target.value)}
                        autoComplete="tel"
                        aria-invalid={isInvalid}
                        className="h-11 text-base tabular-nums"
                      />
                      {isInvalid && <FieldError errors={field.state.meta.errors} />}
                    </Field>
                  );
                }}
              </form.Field>

              <form.Field name="password">
                {(field) => {
                  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>New password</FieldLabel>
                      <FieldDescription>Leave blank to keep your current password</FieldDescription>
                      <div className="relative">
                        <Input
                          id={field.name}
                          name={field.name}
                          type={showPassword ? 'text' : 'password'}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(event) => field.handleChange(event.target.value)}
                          autoComplete="new-password"
                          aria-invalid={isInvalid}
                          className="h-11 pr-10 text-base"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute top-1/2 right-1 size-9 -translate-y-1/2"
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                          onClick={() => setShowPassword((current) => !current)}
                        >
                          {showPassword ? (
                            <EyeOffIcon className="size-4" aria-hidden />
                          ) : (
                            <EyeIcon className="size-4" aria-hidden />
                          )}
                        </Button>
                      </div>
                      {isInvalid && <FieldError errors={field.state.meta.errors} />}
                    </Field>
                  );
                }}
              </form.Field>

              <form.Field name="confirmPassword">
                {(field) => {
                  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Confirm new password</FieldLabel>
                      <div className="relative">
                        <Input
                          id={field.name}
                          name={field.name}
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(event) => field.handleChange(event.target.value)}
                          autoComplete="new-password"
                          aria-invalid={isInvalid}
                          className="h-11 pr-10 text-base"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute top-1/2 right-1 size-9 -translate-y-1/2"
                          aria-label={
                            showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'
                          }
                          onClick={() => setShowConfirmPassword((current) => !current)}
                        >
                          {showConfirmPassword ? (
                            <EyeOffIcon className="size-4" aria-hidden />
                          ) : (
                            <EyeIcon className="size-4" aria-hidden />
                          )}
                        </Button>
                      </div>
                      {isInvalid && <FieldError errors={field.state.meta.errors} />}
                    </Field>
                  );
                }}
              </form.Field>
            </FieldGroup>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-heading flex items-center gap-2 text-base font-semibold">
              <Building2 className="text-primary size-4" aria-hidden />
              Cold storage
            </CardTitle>
            <CardDescription>Business details shown across the application</CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <form.Field name="coldStorage.name">
                {(field) => {
                  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Name</FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(event) => field.handleChange(event.target.value)}
                        aria-invalid={isInvalid}
                        className="h-11 text-base"
                      />
                      {isInvalid && <FieldError errors={field.state.meta.errors} />}
                    </Field>
                  );
                }}
              </form.Field>

              <form.Field name="coldStorage.address">
                {(field) => {
                  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Address</FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(event) => field.handleChange(event.target.value)}
                        aria-invalid={isInvalid}
                        className="h-11 text-base"
                      />
                      {isInvalid && <FieldError errors={field.state.meta.errors} />}
                    </Field>
                  );
                }}
              </form.Field>

              <form.Field name="coldStorage.mobileNumber">
                {(field) => {
                  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Mobile number</FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        type="tel"
                        inputMode="numeric"
                        maxLength={10}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(event) => field.handleChange(event.target.value)}
                        autoComplete="tel"
                        aria-invalid={isInvalid}
                        className="h-11 text-base tabular-nums"
                      />
                      {isInvalid && <FieldError errors={field.state.meta.errors} />}
                    </Field>
                  );
                }}
              </form.Field>

              <form.Field name="coldStorage.capacity">
                {(field) => {
                  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Capacity</FieldLabel>
                      <FieldDescription>Total storage capacity in bags or units</FieldDescription>
                      <Input
                        id={field.name}
                        name={field.name}
                        type="number"
                        min={1}
                        step={1}
                        inputMode="numeric"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(event) =>
                          field.handleChange(
                            event.target.value === '' ? 0 : Number(event.target.value),
                          )
                        }
                        aria-invalid={isInvalid}
                        className="h-11 text-base tabular-nums"
                      />
                      {isInvalid && <FieldError errors={field.state.meta.errors} />}
                    </Field>
                  );
                }}
              </form.Field>
            </FieldGroup>
          </CardContent>
        </Card>

        <ProfileStorageLayoutSection form={form} />

        <Card className="supports-backdrop-filter:bg-background/80 border-border bg-background/95 sticky bottom-0 z-10 backdrop-blur">
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
                    onClick={() => form.reset(profileToFormValues(profile))}
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
                    Save profile
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
