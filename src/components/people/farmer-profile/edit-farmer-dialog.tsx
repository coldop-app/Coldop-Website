import { memo, useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useUpdateFarmer } from '@/services/store-admin/functions/useUpdateFarmer';
import type { FarmerStorageLink } from '@/types/farmer';
import type { UpdateFarmerStorageLinkResponseLink } from '@/types/farmer';

type FieldErrors = Array<{ message?: string } | undefined>;

export interface EditFarmerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  link: FarmerStorageLink;
  onUpdated?: (updatedLink: UpdateFarmerStorageLinkResponseLink) => void;
}

const EditFarmerDialog = memo(function EditFarmerDialog({
  open,
  onOpenChange,
  link,
  onUpdated,
}: EditFarmerDialogProps) {
  const { mutate: updateFarmer, isPending } = useUpdateFarmer();
  const [name, setName] = useState(link.farmerId.name);
  const [address, setAddress] = useState(link.farmerId.address);
  const [mobileNumber, setMobileNumber] = useState(link.farmerId.mobileNumber);
  const [accountNumber, setAccountNumber] = useState(
    String(link.accountNumber ?? '')
  );
  const [openingBalance, setOpeningBalance] = useState('');
  const [costPerBag, setCostPerBag] = useState(
    String(link.costPerBag ?? '')
  );
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
  const prevOpenRef = useRef(false);

  useEffect(() => {
    const justOpened = open && !prevOpenRef.current;
    prevOpenRef.current = open;
    if (justOpened) {
      queueMicrotask(() => {
        setName(link.farmerId.name);
        setAddress(link.farmerId.address);
        setMobileNumber(link.farmerId.mobileNumber);
        setAccountNumber(String(link.accountNumber ?? ''));
        setOpeningBalance('');
        setCostPerBag(String(link.costPerBag ?? ''));
        setErrors({});
      });
    }
  }, [open, link]);

  const validate = (): boolean => {
    const next: Partial<Record<string, string>> = {};
    const nameTrim = name.trim();
    if (nameTrim.length < 2) {
      next.name = 'Name must be at least 2 characters';
    }
    const addressTrim = address.trim();
    if (addressTrim.length < 1) {
      next.address = 'Address is required';
    }
    if (!/^[6-9]\d{9}$/.test(mobileNumber)) {
      next.mobileNumber =
        'Mobile number must be a valid 10-digit Indian number (6–9)';
    }
    const accNum = Number(accountNumber);
    if (Number.isNaN(accNum) || accNum < 1) {
      next.accountNumber = 'Account number must be a positive integer';
    }
    const cost = costPerBag.trim() ? Number(costPerBag) : undefined;
    if (cost !== undefined && (Number.isNaN(cost) || cost <= 0)) {
      next.costPerBag = 'Cost per bag must be a positive number';
    }
    const openBal = openingBalance.trim() ? Number(openingBalance) : undefined;
    if (openBal !== undefined && Number.isNaN(openBal)) {
      next.openingBalance = 'Opening balance must be a number';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    updateFarmer(
      {
        farmerStorageLinkId: link._id,
        name: name.trim(),
        address: address.trim(),
        mobileNumber: mobileNumber.trim(),
        accountNumber: Number(accountNumber),
        costPerBag: costPerBag.trim() ? Number(costPerBag) : undefined,
        openingBalance: openingBalance.trim()
          ? Number(openingBalance)
          : undefined,
      },
      {
        onSuccess: (data) => {
          if (data.success && data.data?.farmerStorageLink) {
            onUpdated?.(data.data.farmerStorageLink);
            onOpenChange(false);
          }
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="font-custom max-h-[85dvh] overflow-y-auto p-4 sm:max-w-[425px] sm:p-6">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Farmer</DialogTitle>
            <DialogDescription>
              Update farmer and link details. Changes apply to this cold storage
              link.
            </DialogDescription>
          </DialogHeader>

          <FieldGroup className="mt-4 grid gap-3 sm:mt-6 sm:gap-4">
            <Field data-invalid={!!errors.name}>
              <FieldLabel htmlFor="edit-farmer-name">Name</FieldLabel>
              <Input
                id="edit-farmer-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={() =>
                  errors.name && setErrors((p) => ({ ...p, name: undefined }))
                }
                placeholder="Farmer name"
                aria-invalid={!!errors.name}
                className="font-custom"
              />
              {errors.name && (
                <FieldError errors={[{ message: errors.name }] as FieldErrors} />
              )}
            </Field>

            <Field data-invalid={!!errors.address}>
              <FieldLabel htmlFor="edit-farmer-address">Address</FieldLabel>
              <Input
                id="edit-farmer-address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Address"
                aria-invalid={!!errors.address}
                className="font-custom"
              />
              {errors.address && (
                <FieldError
                  errors={[{ message: errors.address }] as FieldErrors}
                />
              )}
            </Field>

            <Field data-invalid={!!errors.mobileNumber}>
              <FieldLabel htmlFor="edit-farmer-mobile">Mobile Number</FieldLabel>
              <Input
                id="edit-farmer-mobile"
                type="tel"
                value={mobileNumber}
                onChange={(e) =>
                  setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 10))
                }
                placeholder="10-digit mobile number"
                maxLength={10}
                aria-invalid={!!errors.mobileNumber}
                className="font-custom"
              />
              {errors.mobileNumber && (
                <FieldError
                  errors={[{ message: errors.mobileNumber }] as FieldErrors}
                />
              )}
            </Field>

            <Field data-invalid={!!errors.accountNumber}>
              <FieldLabel htmlFor="edit-farmer-account">
                Account Number
              </FieldLabel>
              <Input
                id="edit-farmer-account"
                type="number"
                min={1}
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                aria-invalid={!!errors.accountNumber}
                className="font-custom"
              />
              {errors.accountNumber && (
                <FieldError
                  errors={[{ message: errors.accountNumber }] as FieldErrors}
                />
              )}
            </Field>

            <Field data-invalid={!!errors.costPerBag}>
              <FieldLabel htmlFor="edit-farmer-cost">Cost per bag</FieldLabel>
              <Input
                id="edit-farmer-cost"
                type="number"
                min={0}
                step={0.01}
                value={costPerBag}
                onChange={(e) => setCostPerBag(e.target.value)}
                onWheel={(e) => e.currentTarget.blur()}
                placeholder="0"
                aria-invalid={!!errors.costPerBag}
                className="font-custom"
              />
              {errors.costPerBag && (
                <FieldError
                  errors={[{ message: errors.costPerBag }] as FieldErrors}
                />
              )}
            </Field>

            <Field data-invalid={!!errors.openingBalance}>
              <FieldLabel htmlFor="edit-farmer-opening">
                Opening balance (optional)
              </FieldLabel>
              <Input
                id="edit-farmer-opening"
                type="number"
                step={0.01}
                value={openingBalance}
                onChange={(e) => setOpeningBalance(e.target.value)}
                onWheel={(e) => e.currentTarget.blur()}
                placeholder="0"
                aria-invalid={!!errors.openingBalance}
                className="font-custom"
              />
              {errors.openingBalance && (
                <FieldError
                  errors={[
                    { message: errors.openingBalance },
                  ] as FieldErrors}
                />
              )}
            </Field>
          </FieldGroup>

          <DialogFooter className="mt-4 flex-col-reverse gap-2 sm:mt-6 sm:flex-row sm:justify-end">
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                className="font-custom w-full sm:w-auto"
              >
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="submit"
              disabled={isPending}
              className="font-custom w-full sm:w-auto"
            >
              {isPending ? 'Saving...' : 'Save changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
});

export default EditFarmerDialog;
