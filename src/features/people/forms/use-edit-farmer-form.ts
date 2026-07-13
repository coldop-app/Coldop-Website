import { useMemo } from 'react';
import { useForm } from '@tanstack/react-form';

import {
  buildUpdateFarmerPayload,
  createEditFarmerFormSchema,
  linkToFormValues,
} from '@/features/people/schemas/add-farmer-form-schema';
import type { FarmerStorageLink } from '@/features/people/types';
import {
  getUsedAccountNumbers,
  getUsedMobileNumbers,
} from '@/features/people/utils/farmer-account-numbers';

type UseEditFarmerFormOptions = {
  links: FarmerStorageLink[];
  link: FarmerStorageLink;
  showFinances?: boolean;
  onSubmit: (payload: ReturnType<typeof buildUpdateFarmerPayload>) => Promise<void>;
};

export function useEditFarmerForm({
  links,
  link,
  showFinances = true,
  onSubmit,
}: UseEditFarmerFormOptions) {
  const otherLinks = useMemo(
    () => links.filter((item) => item._id !== link._id),
    [links, link._id],
  );

  const formSchema = useMemo(
    () =>
      createEditFarmerFormSchema({
        getUsedAccountNumbers: () => getUsedAccountNumbers(otherLinks),
        getUsedMobileNumbers: () => getUsedMobileNumbers(otherLinks),
        showFinances,
      }),
    [otherLinks, showFinances],
  );

  return useForm({
    defaultValues: linkToFormValues(link),
    validators: {
      onChange: formSchema,
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      const parsed = formSchema.parse(value);
      await onSubmit(buildUpdateFarmerPayload(parsed, { showFinances }));
    },
  });
}

export type EditFarmerFormApi = ReturnType<typeof useEditFarmerForm>;
