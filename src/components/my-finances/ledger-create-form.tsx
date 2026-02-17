import { memo } from 'react';
import type { CreateLedgerBody } from '@/services/accounting/ledgers/useCreateLedger';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  SearchSelector,
  type Option,
} from '@/components/forms/search-selector';

const LEDGER_TYPES: CreateLedgerBody['type'][] = [
  'Asset',
  'Liability',
  'Income',
  'Expense',
  'Equity',
];

const LEDGER_TYPE_OPTIONS: Option<CreateLedgerBody['type']>[] =
  LEDGER_TYPES.map((t) => ({ value: t, label: t, searchableText: t }));

export interface LedgerCreateFormProps {
  form: CreateLedgerBody;
  setForm: React.Dispatch<React.SetStateAction<CreateLedgerBody>>;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  isPending: boolean;
}

const LedgerCreateForm = memo(function LedgerCreateForm({
  form,
  setForm,
  onSubmit,
  onCancel,
  isPending,
}: LedgerCreateFormProps) {
  return (
    <form onSubmit={onSubmit} className="font-custom flex flex-col gap-4 pt-2">
      <div className="space-y-2">
        <Label htmlFor="ledger-name">Name</Label>
        <Input
          id="ledger-name"
          placeholder="e.g. Bank, Cash"
          value={form.name}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, name: e.target.value }))
          }
          className="font-custom focus-visible:ring-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="ledger-type">Type</Label>
        <SearchSelector<CreateLedgerBody['type']>
          id="ledger-type"
          options={LEDGER_TYPE_OPTIONS}
          placeholder="Select type..."
          searchPlaceholder="Search type..."
          value={form.type}
          onSelect={(v) =>
            setForm((prev) => ({
              ...prev,
              type: (v || 'Asset') as CreateLedgerBody['type'],
            }))
          }
          buttonClassName="font-custom focus-visible:ring-primary w-full justify-between focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="ledger-subType">Sub type</Label>
        <Input
          id="ledger-subType"
          placeholder="e.g. Current Asset"
          value={form.subType}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, subType: e.target.value }))
          }
          className="font-custom focus-visible:ring-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="ledger-category">Category</Label>
        <Input
          id="ledger-category"
          placeholder="e.g. Cash"
          value={form.category}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, category: e.target.value }))
          }
          className="font-custom focus-visible:ring-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="ledger-openingBalance">
          Opening balance (optional)
        </Label>
        <Input
          id="ledger-openingBalance"
          type="number"
          step="any"
          placeholder="0"
          value={form.openingBalance ?? ''}
          onChange={(e) => {
            const v = e.target.value;
            setForm((prev) => ({
              ...prev,
              openingBalance:
                v === ''
                  ? undefined
                  : (() => {
                      const n = parseFloat(v);
                      return Number.isNaN(n) ? undefined : n;
                    })(),
            }));
          }}
          className="font-custom focus-visible:ring-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
        />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button
          type="button"
          variant="outline"
          className="font-custom focus-visible:ring-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="font-custom focus-visible:ring-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          disabled={isPending}
        >
          {isPending ? 'Creating…' : 'Create'}
        </Button>
      </div>
    </form>
  );
});

export default LedgerCreateForm;
