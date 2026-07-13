import { useMemo } from 'react';
import { Loader2, UserPlus } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { usePreferencesStore } from '@/features/auth/store/use-preferences-store';
import { useQuickRegisterFarmer } from '@/features/people/api/use-quick-register-farmer';
import { FarmerFormFields } from '@/features/people/components/farmer-form-fields';
import { useAddFarmerForm } from '@/features/people/forms/use-add-farmer-form';
import type { FarmerStorageLink } from '@/features/people/types';
import {
  getNextAccountNumber,
  getUsedAccountNumbers,
} from '@/features/people/utils/farmer-account-numbers';

type AddFarmerDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  links?: FarmerStorageLink[];
  onSuccess?: (link: FarmerStorageLink) => void;
};

export function AddFarmerDialog({
  open,
  onOpenChange,
  links = [],
  onSuccess,
}: AddFarmerDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open ? (
        <AddFarmerDialogContent links={links} onSuccess={onSuccess} onOpenChange={onOpenChange} />
      ) : null}
    </Dialog>
  );
}

type AddFarmerDialogContentProps = {
  links: FarmerStorageLink[];
  onOpenChange: (open: boolean) => void;
  onSuccess?: (link: FarmerStorageLink) => void;
};

function AddFarmerDialogContent({ links, onOpenChange, onSuccess }: AddFarmerDialogContentProps) {
  const usedAccountNumbers = useMemo(() => getUsedAccountNumbers(links), [links]);
  const nextAccountNumber = useMemo(
    () => getNextAccountNumber(usedAccountNumbers),
    [usedAccountNumbers],
  );

  const showFinances = usePreferencesStore((s) => s.preferences?.showFinances ?? true);
  const { mutateAsync: quickRegisterFarmer, isPending } = useQuickRegisterFarmer();

  const form = useAddFarmerForm({
    links,
    showFinances,
    onSubmit: async (payload) => {
      try {
        const { message, data } = await quickRegisterFarmer(payload);
        toast.success(message ?? 'Farmer added successfully', {
          position: 'bottom-right',
        });
        if (data) {
          onSuccess?.(data);
        }
        onOpenChange(false);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to add farmer', {
          position: 'bottom-right',
        });
      }
    },
  });

  return (
    <DialogContent className="flex max-h-[min(90dvh,720px)] max-w-lg flex-col gap-0 overflow-hidden p-0 sm:max-w-lg">
      <DialogHeader className="border-border shrink-0 border-b px-6 py-5">
        <DialogTitle className="font-heading text-foreground text-xl font-semibold tracking-tight">
          Add farmer
        </DialogTitle>
        <DialogDescription>
          Create a farmer account linked to your cold storage. Fields marked with{' '}
          <span className="text-destructive">*</span> are required.
        </DialogDescription>
      </DialogHeader>

      <form
        id="add-farmer-form"
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          event.stopPropagation();
          void form.handleSubmit();
        }}
        className="flex min-h-0 flex-1 flex-col"
      >
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          <FarmerFormFields
            form={form}
            mode="add"
            showFinances={showFinances}
            usedAccountNumbers={usedAccountNumbers}
            nextAccountNumber={nextAccountNumber}
          />
        </div>

        <DialogFooter className="border-border shrink-0 gap-2 border-t px-6 py-4">
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <form.Subscribe selector={(state) => state.isSubmitting}>
            {(isSubmitting) => (
              <Button type="submit" form="add-farmer-form" disabled={isSubmitting || isPending}>
                {isSubmitting || isPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Saving…
                  </>
                ) : (
                  <>
                    <UserPlus className="size-4" />
                    Save farmer
                  </>
                )}
              </Button>
            )}
          </form.Subscribe>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
