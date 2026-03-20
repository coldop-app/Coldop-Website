import { memo } from 'react';
import { AutoScrollFormWrapper } from '@/components/forms/auto-scroll-form-wrapper';
import { CreateIncomingForm as CreateIncomingFormBase } from './create-incoming-form';
import { EditIncomingForm as EditIncomingFormBase } from './edit-incoming-form';
import type { EditIncomingFormProps } from './edit-incoming-form';

export {
  IncomingFormBase,
  type IncomingFormBaseProps,
  type IncomingFormSubmitPayload,
  type ExtraQuantityRow,
} from './incoming-form-base';

export { AutoScrollFormWrapper } from '@/components/forms/auto-scroll-form-wrapper';

export const CreateIncomingForm = memo(function CreateIncomingForm() {
  return (
    <AutoScrollFormWrapper>
      <CreateIncomingFormBase />
    </AutoScrollFormWrapper>
  );
});

export const EditIncomingForm = memo(function EditIncomingForm(
  props: EditIncomingFormProps
) {
  return (
    <AutoScrollFormWrapper>
      <EditIncomingFormBase {...props} />
    </AutoScrollFormWrapper>
  );
});

export type { EditIncomingFormProps } from './edit-incoming-form';

/** Default export for create route: use CreateIncomingForm. For edit, use EditIncomingForm. */
export default CreateIncomingForm;
