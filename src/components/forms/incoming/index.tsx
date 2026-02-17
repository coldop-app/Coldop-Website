export { CreateIncomingForm } from './create-incoming-form';
export { EditIncomingForm } from './edit-incoming-form';
export type { EditIncomingFormProps } from './edit-incoming-form';
export {
  IncomingFormBase,
  type IncomingFormBaseProps,
  type IncomingFormSubmitPayload,
  type ExtraQuantityRow,
} from './incoming-form-base';

import { CreateIncomingForm } from './create-incoming-form';

/** Default export for create route: use CreateIncomingForm. For edit, use EditIncomingForm. */
export default CreateIncomingForm;
