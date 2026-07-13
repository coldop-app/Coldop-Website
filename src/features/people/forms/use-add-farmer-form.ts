import { useMemo } from 'react';
import { useForm } from '@tanstack/react-form';

import {
  buildAddFarmerPayload,
  createAddFarmerFormSchema,
  createDefaultAddFarmerValues,
} from '@/features/people/schemas/add-farmer-form-schema';
import type { FarmerStorageLink } from '@/features/people/types';
import {
  getUsedAccountNumbers,
  getUsedMobileNumbers,
} from '@/features/people/utils/farmer-account-numbers';

type UseAddFarmerFormOptions = {
  links: FarmerStorageLink[];
  showFinances?: boolean;
  onSubmit: (payload: ReturnType<typeof buildAddFarmerPayload>) => Promise<void>;
};

export function useAddFarmerForm({
  links,
  showFinances = true,
  onSubmit,
}: UseAddFarmerFormOptions) {
  const formSchema = useMemo(
    () =>
      createAddFarmerFormSchema({
        getUsedAccountNumbers: () => getUsedAccountNumbers(links),
        getUsedMobileNumbers: () => getUsedMobileNumbers(links),
        showFinances,
      }),
    [links, showFinances],
  );

  return useForm({
    defaultValues: createDefaultAddFarmerValues(),
    validators: {
      onChange: formSchema,
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      const parsed = formSchema.parse(value);
      await onSubmit(buildAddFarmerPayload(parsed, { showFinances }));
    },
  });
}

export type AddFarmerFormApi = ReturnType<typeof useAddFarmerForm>;
