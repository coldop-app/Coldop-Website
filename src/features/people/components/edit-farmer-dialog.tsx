import { useEffect } from 'react';
import { Loader2, Pencil } from 'lucide-react';
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
import { useUpdateFarmerStorageLink } from '@/features/people/api/use-update-farmer-storage-link';
import { FarmerFormFields } from '@/features/people/components/farmer-form-fields';
import { useEditFarmerForm } from '@/features/people/forms/use-edit-farmer-form';
import { linkToFormValues } from '@/features/people/schemas/add-farmer-form-schema';
import type { FarmerStorageLink } from '@/features/people/types';

type EditFarmerDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  link: FarmerStorageLink;
  links?: FarmerStorageLink[];
  onSuccess?: (link: FarmerStorageLink) => void;
};

export function EditFarmerDialog({
  open,
  onOpenChange,
  link,
  links = [],
  onSuccess,
}: EditFarmerDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open ? (
        <EditFarmerDialogContent
          link={link}
          links={links}
          onSuccess={onSuccess}
          onOpenChange={onOpenChange}
        />
      ) : null}
    </Dialog>
  );
}

type EditFarmerDialogContentProps = {
  link: FarmerStorageLink;
  links: FarmerStorageLink[];
  onOpenChange: (open: boolean) => void;
  onSuccess?: (link: FarmerStorageLink) => void;
};

function EditFarmerDialogContent({
  link,
  links,
  onOpenChange,
  onSuccess,
}: EditFarmerDialogContentProps) {
  const showFinances = usePreferencesStore((s) => s.preferences?.showFinances ?? true);
  const { mutateAsync: updateFarmerStorageLink, isPending } = useUpdateFarmerStorageLink();

  const form = useEditFarmerForm({
    links,
    link,
    showFinances,
    onSubmit: async (payload) => {
      try {
        const { message, data } = await updateFarmerStorageLink({
          id: link._id,
          payload,
        });
        toast.success(message ?? 'Farmer updated successfully', {
          position: 'bottom-right',
        });
        if (data) {
          onSuccess?.(data);
        }
        onOpenChange(false);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to update farmer', {
          position: 'bottom-right',
        });
      }
    },
  });

  useEffect(() => {
    form.reset(linkToFormValues(link));
  }, [link]);

  return (
    <DialogContent className="flex max-h-[min(90dvh,720px)] max-w-lg flex-col gap-0 overflow-hidden p-0 sm:max-w-lg">
      <DialogHeader className="border-border shrink-0 border-b px-6 py-5">
        <DialogTitle className="font-heading text-foreground text-xl font-semibold tracking-tight">
          Edit farmer
        </DialogTitle>
        <DialogDescription>
          Update this farmer&apos;s account details. Fields marked with{' '}
          <span className="text-destructive">*</span> are required.
        </DialogDescription>
      </DialogHeader>

      <form
        id="edit-farmer-form"
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          event.stopPropagation();
          void form.handleSubmit();
        }}
        className="flex min-h-0 flex-1 flex-col"
      >
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          <FarmerFormFields form={form} mode="edit" showFinances={showFinances} />
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
              <Button type="submit" form="edit-farmer-form" disabled={isSubmitting || isPending}>
                {isSubmitting || isPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Saving…
                  </>
                ) : (
                  <>
                    <Pencil className="size-4" />
                    Save changes
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
