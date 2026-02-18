import { memo, useState, useMemo, useCallback } from 'react';
import {
  useGetAllVouchers,
  type Voucher,
} from '@/services/accounting/vouchers/useGetAllVouchers';
import { useCreateVoucher } from '@/services/accounting/vouchers/useCreateVoucher';
import type { CreateVoucherBody } from '@/services/accounting/vouchers/useCreateVoucher';
import { useUpdateVoucher } from '@/services/accounting/vouchers/useUpdateVoucher';
import type { UpdateVoucherBody } from '@/services/accounting/vouchers/useUpdateVoucher';
import { useDeleteVoucher } from '@/services/accounting/vouchers/useDeleteVoucher';
import { DataTable } from '@/components/ui/data-table';
import { getVouchersColumns } from './vouchers-columns';
import VoucherCreateForm from './voucher-create-form';
import VoucherEditForm from './voucher-edit-form';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { GeneralExpenseModal } from './general-expense-modal';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Plus, Search } from 'lucide-react';

const VoucherTab = memo(function VoucherTab() {
  const { data: vouchers, isLoading, isError, error } = useGetAllVouchers();
  const createVoucher = useCreateVoucher();
  const updateVoucher = useUpdateVoucher();
  const deleteVoucher = useDeleteVoucher();
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<CreateVoucherBody>({
    date: new Date().toISOString().slice(0, 10),
    debitLedger: '',
    creditLedger: '',
    amount: 0,
    narration: '',
  });
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [voucherToEdit, setVoucherToEdit] = useState<Voucher | null>(null);
  const [editForm, setEditForm] = useState<UpdateVoucherBody>({
    amount: undefined,
    narration: '',
  });
  const [voucherToDelete, setVoucherToDelete] = useState<Voucher | null>(null);
  const [generalExpenseDialogOpen, setGeneralExpenseDialogOpen] =
    useState(false);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Backend expects ISO date-time (e.g. 2025-02-16T00:00:00.000Z); input type="date" gives YYYY-MM-DD
    const dateIso =
      form.date.includes('T') ? form.date : `${form.date}T00:00:00.000Z`;
    const payload: CreateVoucherBody = {
      date: dateIso,
      debitLedger: form.debitLedger,
      creditLedger: form.creditLedger,
      amount: Number(form.amount),
      narration: form.narration?.trim() || undefined,
    };
    if (form.farmerStorageLinkId != null && form.farmerStorageLinkId !== '') {
      payload.farmerStorageLinkId = form.farmerStorageLinkId;
    }
    createVoucher.mutate(payload, {
      onSuccess: () => {
        setDialogOpen(false);
        setForm({
          date: new Date().toISOString().slice(0, 10),
          debitLedger: '',
          creditLedger: '',
          amount: 0,
          narration: '',
        });
      },
    });
  };

  const handleEditClick = useCallback((voucher: Voucher) => {
    setVoucherToEdit(voucher);
    setEditForm({
      amount: voucher.amount,
      narration: voucher.narration ?? '',
    });
    setEditDialogOpen(true);
  }, []);

  const handleDeleteClick = useCallback((voucher: Voucher) => {
    setVoucherToDelete(voucher);
  }, []);

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!voucherToEdit) return;
    const payload: UpdateVoucherBody = {};
    const amountChanged =
      editForm.amount !== undefined &&
      !Number.isNaN(editForm.amount) &&
      editForm.amount > 0 &&
      editForm.amount !== voucherToEdit.amount;
    if (amountChanged) {
      payload.amount = editForm.amount;
    }
    const narrationTrimmed = editForm.narration?.trim() ?? '';
    const narrationChanged =
      narrationTrimmed !== (voucherToEdit.narration?.trim() ?? '');
    if (narrationChanged) {
      payload.narration = narrationTrimmed || undefined;
    }
    if (Object.keys(payload).length === 0) return;
    updateVoucher.mutate(
      { voucherId: voucherToEdit._id, ...payload },
      {
        onSuccess: () => {
          setEditDialogOpen(false);
          setVoucherToEdit(null);
        },
      }
    );
  };

  const hasEditChanges = useMemo(() => {
    if (!voucherToEdit) return false;
    const amountOk =
      editForm.amount !== undefined &&
      !Number.isNaN(editForm.amount) &&
      editForm.amount > 0;
    const amountChanged = amountOk && editForm.amount !== voucherToEdit.amount;
    const narrationChanged =
      (editForm.narration ?? '') !== (voucherToEdit.narration ?? '');
    return amountChanged || narrationChanged;
  }, [voucherToEdit, editForm.amount, editForm.narration]);

  const handleDeleteConfirm = () => {
    if (!voucherToDelete) return;
    deleteVoucher.mutate(voucherToDelete._id, {
      onSuccess: () => setVoucherToDelete(null),
    });
  };

  const columns = useMemo(
    () =>
      getVouchersColumns({
        onEdit: handleEditClick,
        onDelete: handleDeleteClick,
      }),
    [handleEditClick, handleDeleteClick]
  );

  const filteredVouchers = useMemo(() => {
    const list = vouchers ?? [];
    if (!searchQuery.trim()) return list;
    const q = searchQuery.trim().toLowerCase();
    return list.filter((v) => {
      const num = String(v.voucherNumber);
      const date = v.date?.toLowerCase() ?? '';
      const debit = v.debitLedger?.name?.toLowerCase() ?? '';
      const credit = v.creditLedger?.name?.toLowerCase() ?? '';
      const narration = (v.narration ?? '').toLowerCase();
      return (
        num.includes(q) ||
        date.includes(q) ||
        debit.includes(q) ||
        credit.includes(q) ||
        narration.includes(q)
      );
    });
  }, [vouchers, searchQuery]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full rounded-md" />
        <Skeleton className="h-64 w-full rounded-md" />
        <div className="flex justify-end gap-2">
          <Skeleton className="h-8 w-24 rounded-md" />
          <Skeleton className="h-8 w-24 rounded-md" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <p className="font-custom text-destructive">
        {error instanceof Error ? error.message : 'Failed to load vouchers.'}
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder="Search by voucher #, date, ledger, narration..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="font-custom focus-visible:ring-primary w-full pl-10 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          />
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="font-custom focus-visible:ring-primary h-10 w-full gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 sm:w-auto">
                <Plus className="h-4 w-4 shrink-0" />
                Add New
              </Button>
            </DialogTrigger>
            <DialogContent className="font-custom sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Voucher</DialogTitle>
              </DialogHeader>
              <VoucherCreateForm
                form={form}
                setForm={setForm}
                onSubmit={handleCreateSubmit}
                onCancel={() => setDialogOpen(false)}
                isPending={createVoucher.isPending}
              />
            </DialogContent>
          </Dialog>
          <Button
            type="button"
            variant="secondary"
            className="font-custom focus-visible:ring-primary h-10 w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 sm:w-auto"
            onClick={() => setGeneralExpenseDialogOpen(true)}
          >
            General Expense
          </Button>
        </div>
        <GeneralExpenseModal
          open={generalExpenseDialogOpen}
          onOpenChange={setGeneralExpenseDialogOpen}
        />
      </div>
      <AlertDialog
        open={!!voucherToDelete}
        onOpenChange={(open) => !open && setVoucherToDelete(null)}
      >
        <AlertDialogContent className="font-custom">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete voucher?</AlertDialogTitle>
            <AlertDialogDescription>
              {voucherToDelete ? (
                <>
                  This will permanently delete voucher #
                  {voucherToDelete.voucherNumber}. This action cannot be undone.
                </>
              ) : (
                'This action cannot be undone.'
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="font-custom focus-visible:ring-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              className="font-custom focus-visible:ring-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              onClick={handleDeleteConfirm}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="font-custom sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Voucher</DialogTitle>
          </DialogHeader>
          <VoucherEditForm
            voucher={voucherToEdit}
            form={editForm}
            setForm={setEditForm}
            onSubmit={handleEditSubmit}
            onCancel={() => {
              setEditDialogOpen(false);
              setVoucherToEdit(null);
            }}
            isPending={updateVoucher.isPending}
            hasChanges={hasEditChanges}
          />
        </DialogContent>
      </Dialog>
      <DataTable columns={columns} data={filteredVouchers} />
    </div>
  );
});

export default VoucherTab;
