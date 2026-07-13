import { useForm } from '@tanstack/react-form';
import type { ProfileData } from '../types';
import {
  formValuesToUpdatePayload,
  profileFormSchema,
  profileToFormValues,
  type ProfileFormValues,
} from '../schemas/profile-form-schema';

type UseProfileFormOptions = {
  profile: ProfileData;
  onSubmit: (values: ProfileFormValues) => Promise<void>;
};

export function useProfileForm({ profile, onSubmit }: UseProfileFormOptions) {
  return useForm({
    defaultValues: profileToFormValues(profile),
    validators: {
      onChange: profileFormSchema,
      onSubmit: profileFormSchema,
    },
    onSubmit: async ({ value }) => {
      const parsed = profileFormSchema.parse(value);
      await onSubmit(parsed);
    },
  });
}

export type ProfileFormApi = ReturnType<typeof useProfileForm>;

export { formValuesToUpdatePayload, profileToFormValues };
