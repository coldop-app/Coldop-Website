import { useForm } from '@tanstack/react-form';
import type { Preferences } from '@/features/auth/types';
import {
  formValuesToUpdatePayload,
  preferencesFormSchema,
  preferencesToFormValues,
  type PreferencesFormValues,
} from '../schemas/preferences-form-schema';

type UsePreferencesFormOptions = {
  preferences: Preferences;
  onSubmit: (values: PreferencesFormValues) => Promise<void>;
};

export function usePreferencesForm({ preferences, onSubmit }: UsePreferencesFormOptions) {
  return useForm({
    defaultValues: preferencesToFormValues(preferences),
    validators: {
      onChange: preferencesFormSchema,
      onSubmit: preferencesFormSchema,
    },
    onSubmit: async ({ value }) => {
      const parsed = preferencesFormSchema.parse(value);
      await onSubmit(parsed);
    },
  });
}

export type PreferencesFormApi = ReturnType<typeof usePreferencesForm>;

export { formValuesToUpdatePayload };
