import { memo, useState, useMemo, useCallback } from 'react';
import {
  useGetAllLedgers,
  type Ledger,
} from '@/services/accounting/ledgers/useGetAllLedgers';
import { useCreateLedger } from '@/services/accounting/ledgers/useCreateLedger';
import type { CreateLedgerBody } from '@/services/accounting/ledgers/useCreateLedger';
import { useUpdateLedger } from '@/services/accounting/ledgers/useUpdateLedger';
import type { UpdateLedgerBody } from '@/services/accounting/ledgers/useUpdateLedger';
import { useDeleteLedger } from '@/services/accounting/ledgers/useDeleteLeger';
import { DataTable } from '@/components/ui/data-table';
import { getLedgersColumns } from './ledgers-columns';
import LedgerCreateForm from './ledger-create-form';
import LedgerEditForm from './ledger-edit-form';
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

const LedgerTab = memo(function LedgerTab() {
  const { data: ledgers, isLoading, isError, error } = useGetAllLedgers();
  const createLedger = useCreateLedger();
  const updateLedger = useUpdateLedger();
  const deleteLedger = useDeleteLedger();
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<CreateLedgerBody>({
    name: '',
    type: 'Asset',
    subType: '',
    category: '',
    openingBalance: undefined,
  });
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [ledgerToEdit, setLedgerToEdit] = useState<Ledger | null>(null);
  const [editForm, setEditForm] = useState<UpdateLedgerBody>({
    name: '',
    type: 'Asset',
    subType: '',
    category: '',
    openingBalance: undefined,
  });
  const [ledgerToDelete, setLedgerToDelete] = useState<Ledger | null>(null);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: CreateLedgerBody = {
      name: form.name,
      type: form.type,
      subType: form.subType,
      category: form.category,
    };
    if (
      form.openingBalance !== undefined &&
      !Number.isNaN(form.openingBalance)
    ) {
      payload.openingBalance = form.openingBalance;
    }
    createLedger.mutate(payload, {
      onSuccess: () => {
        setDialogOpen(false);
        setForm({
          name: '',
          type: 'Asset',
          subType: '',
          category: '',
          openingBalance: undefined,
        });
      },
    });
  };

  const handleEditClick = useCallback((ledger: Ledger) => {
    setLedgerToEdit(ledger);
    setEditForm({
      name: ledger.name,
      type: ledger.type,
      subType: ledger.subType,
      category: ledger.category,
      openingBalance: ledger.openingBalance,
    });
    setEditDialogOpen(true);
  }, []);

  const handleDeleteClick = useCallback((ledger: Ledger) => {
    setLedgerToDelete(ledger);
  }, []);

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ledgerToEdit) return;
    const payload: UpdateLedgerBody = {
      name: editForm.name,
      type: editForm.type,
      subType: editForm.subType,
      category: editForm.category,
    };
    if (
      editForm.openingBalance !== undefined &&
      !Number.isNaN(editForm.openingBalance)
    ) {
      payload.openingBalance = editForm.openingBalance;
    }
    updateLedger.mutate(
      { ledgerId: ledgerToEdit._id, ...payload },
      {
        onSuccess: () => {
          setEditDialogOpen(false);
          setLedgerToEdit(null);
        },
      }
    );
  };

  const handleDeleteConfirm = () => {
    if (!ledgerToDelete) return;
    deleteLedger.mutate(ledgerToDelete._id, {
      onSuccess: () => setLedgerToDelete(null),
    });
  };

  const columns = useMemo(
    () =>
      getLedgersColumns({
        onEdit: handleEditClick,
        onDelete: handleDeleteClick,
      }),
    [handleEditClick, handleDeleteClick]
  );

  const filteredLedgers = useMemo(() => {
    const list = ledgers ?? [];
    if (!searchQuery.trim()) return list;
    const q = searchQuery.trim().toLowerCase();
    return list.filter((ledger) => ledger.name.toLowerCase().includes(q));
  }, [ledgers, searchQuery]);

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
        {error instanceof Error ? error.message : 'Failed to load ledgers.'}
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder="Search by ledger name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="font-custom focus-visible:ring-primary w-full pl-10 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          />
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="font-custom focus-visible:ring-primary h-10 w-full gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 sm:w-auto">
              <Plus className="h-4 w-4 shrink-0" />
              Add New
            </Button>
          </DialogTrigger>
          <DialogContent className="font-custom sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Ledger</DialogTitle>
            </DialogHeader>
            <LedgerCreateForm
              form={form}
              setForm={setForm}
              onSubmit={handleCreateSubmit}
              onCancel={() => setDialogOpen(false)}
              isPending={createLedger.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>
      <AlertDialog
        open={!!ledgerToDelete}
        onOpenChange={(open) => !open && setLedgerToDelete(null)}
      >
        <AlertDialogContent className="font-custom">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete ledger?</AlertDialogTitle>
            <AlertDialogDescription>
              {ledgerToDelete ? (
                <>
                  This will permanently delete the ledger &quot;
                  {ledgerToDelete.name}&quot;. This action cannot be undone.
                  Ledgers with existing transactions cannot be deleted.
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
            <DialogTitle>Edit Ledger</DialogTitle>
          </DialogHeader>
          <LedgerEditForm
            ledger={ledgerToEdit}
            form={editForm}
            setForm={setEditForm}
            onSubmit={handleEditSubmit}
            onCancel={() => {
              setEditDialogOpen(false);
              setLedgerToEdit(null);
            }}
            isPending={updateLedger.isPending}
          />
        </DialogContent>
      </Dialog>
      <DataTable columns={columns} data={filteredLedgers} />
    </div>
  );
});

export default LedgerTab;
